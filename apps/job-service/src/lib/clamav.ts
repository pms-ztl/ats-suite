/**
 * WF-I / I3 — OPTIONAL resume virus scan via a ClamAV (clamd) sidecar.
 *
 * The apply-ingest worker runs this BEFORE a resume enters the parse pipeline so
 * a malware-laced upload is quarantined instead of being handed downstream. It is
 * a clean clamd INSTREAM client written on Node's built-in `net` socket - it adds
 * NO new npm dependency and speaks the exact wire protocol `clamd` exposes on its
 * TCP port.
 *
 * ── FEATURE-FLAGGED OFF BY DEFAULT ──────────────────────────────────────────
 * CLAMAV_ENABLED must be truthy for any scanning to happen. When it is unset (the
 * default) isClamavEnabled() returns false and the worker SKIPS straight through
 * to forwarding - so the whole apply pipeline works on the single-host stack with
 * no sidecar running, exactly as the HARD RULES require (ClamAV is optional and
 * must never be able to destabilize the stack). Turning it on is purely additive:
 *
 *   CLAMAV_ENABLED       "true"/"1" to enable scanning (default OFF)
 *   CLAMAV_HOST          clamd host (default "clamav")  - the sidecar service name
 *   CLAMAV_PORT          clamd TCP port (default 3310)
 *   CLAMAV_TIMEOUT_MS    per-scan socket budget (default 30000)
 *   CLAMAV_MAX_BYTES     refuse to stream more than this to clamd (default 26214400 = 25MB)
 *   CLAMAV_FAIL_OPEN     how to treat a scanner OUTAGE. DEFAULT OFF (fail-CLOSED):
 *                        a scanner outage is a retryable ERROR so no unscanned
 *                        upload is ever forwarded when scanning is enabled. Set it
 *                        truthy for fail-open (proceed + honestly record the upload
 *                        as not-scanned) so a clamd blip never blocks an apply. Note
 *                        scanning is OFF entirely unless CLAMAV_ENABLED, so this only
 *                        applies in a high-assurance run.
 *
 * Honesty: a CLEAN verdict means clamd really returned "OK". An INFECTED verdict
 * carries the REAL signature name clamd reported - never a fabricated finding. A
 * scanner error is surfaced as { ok:false, error }; the worker then either retries
 * (fail-closed) or proceeds-as-not-scanned (fail-open) - it never claims a scan
 * found the file clean when none ran.
 */
import net from "node:net";
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "job-service:clamav" });

export function isClamavEnabled(): boolean {
  const v = (process.env["CLAMAV_ENABLED"] ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

export function clamavFailOpen(): boolean {
  // Default OFF (fail-CLOSED), matching .env.example: when scanning is ENABLED, a
  // scanner outage is a retryable error so an unscanned upload never silently
  // passes. ClamAV itself is OFF by default (CLAMAV_ENABLED), so this only ever
  // applies in a high-assurance run that turned scanning on. Set CLAMAV_FAIL_OPEN
  // truthy to proceed-as-not-scanned on an outage instead.
  const v = (process.env["CLAMAV_FAIL_OPEN"] ?? "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

export type ScanVerdict =
  | { clean: true; signature: null }            // clamd said OK
  | { clean: false; signature: string }         // clamd found a real signature
  | { ok: false; error: string };               // scanner outage / protocol error

/**
 * Scan a buffer with clamd over INSTREAM. Resolves with a verdict:
 *   - { clean:true,  signature:null }      stream returned "... OK"
 *   - { clean:false, signature:"<name>" }  stream returned "... <SIG> FOUND"
 *   - { ok:false, error:"..." }            socket/protocol error (NOT a clean pass)
 *
 * INSTREAM framing: send "zINSTREAM\0", then a sequence of <uint32 length BE><chunk>
 * frames, terminated by a zero-length frame (uint32 0). clamd replies with a single
 * line ending in "OK" or "<sig> FOUND".
 */
export function scanBuffer(buffer: Buffer): Promise<ScanVerdict> {
  const host = process.env["CLAMAV_HOST"] ?? "clamav";
  const port = Number(process.env["CLAMAV_PORT"] ?? 3310);
  const timeoutMs = Number(process.env["CLAMAV_TIMEOUT_MS"] ?? 30_000);
  const maxBytes = Number(process.env["CLAMAV_MAX_BYTES"] ?? 26_214_400); // 25MB

  if (buffer.byteLength > maxBytes) {
    // Too big to scan within the configured ceiling - surface as an error so the
    // worker decides (retry / fail) rather than silently passing an unscanned blob.
    return Promise.resolve({ ok: false, error: `object ${buffer.byteLength}B exceeds CLAMAV_MAX_BYTES ${maxBytes}B` });
  }

  return new Promise<ScanVerdict>((resolve) => {
    let settled = false;
    const done = (v: ScanVerdict) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch { /* ignore */ }
      resolve(v);
    };

    const chunks: Buffer[] = [];
    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      try {
        socket.write("zINSTREAM\0");
        // Stream the body in 64KB frames so clamd never has to buffer it all at once.
        const CHUNK = 64 * 1024;
        for (let off = 0; off < buffer.byteLength; off += CHUNK) {
          const slice = buffer.subarray(off, Math.min(off + CHUNK, buffer.byteLength));
          const len = Buffer.allocUnsafe(4);
          len.writeUInt32BE(slice.byteLength, 0);
          socket.write(len);
          socket.write(slice);
        }
        // Zero-length frame terminates the stream.
        const end = Buffer.allocUnsafe(4);
        end.writeUInt32BE(0, 0);
        socket.write(end);
      } catch (err) {
        done({ ok: false, error: err instanceof Error ? err.message : "write failed" });
      }
    });

    socket.on("data", (d: Buffer) => chunks.push(d));

    socket.on("end", () => {
      const reply = Buffer.concat(chunks).toString("utf8").replace(/\0+$/, "").trim();
      if (!reply) {
        done({ ok: false, error: "empty reply from clamd" });
        return;
      }
      // Typical replies: "stream: OK"  or  "stream: Eicar-Test-Signature FOUND"
      if (/\bOK\s*$/.test(reply)) {
        done({ clean: true, signature: null });
        return;
      }
      const m = reply.match(/:\s*(.+?)\s+FOUND\s*$/i);
      if (m) {
        done({ clean: false, signature: m[1]!.trim() });
        return;
      }
      // Anything else (e.g. "INSTREAM size limit exceeded ERROR") is a scanner error.
      done({ ok: false, error: reply });
    });

    socket.on("timeout", () => done({ ok: false, error: `clamd timeout after ${timeoutMs}ms` }));
    socket.on("error", (err) => {
      logger.warn({ err: err.message, host, port }, "clamd socket error");
      done({ ok: false, error: err.message });
    });
  });
}
