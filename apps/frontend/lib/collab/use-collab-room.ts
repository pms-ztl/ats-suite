"use client";
// Module D — interview room realtime. One hook owns the whole live session:
//   • fetches a signed collab token from interview-service,
//   • opens a WebSocket to collab-service (/rt), our own signaling+relay hub,
//   • runs a shared Yjs document (notes + code + whiteboard co-edit), and
//   • establishes own-WebRTC P2P media with every other participant.
// The collab-service is a dumb relay: it fans out our frames to the other peers.
// So conflict-resolution (Yjs CRDT) and media negotiation (RTCPeerConnection) are
// pure client concerns — no external video platform, no media server.
import { useEffect, useRef, useState, useCallback } from "react";
import * as Y from "yjs";

export interface Peer { id: string; name: string; role: "host" | "guest" }
export interface RemoteMedia { id: string; name: string; stream: MediaStream }

export type RoomStatus = "connecting" | "live" | "denied" | "error" | "ended";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
function authToken(): string | null {
  try { return typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null; } catch { return null; }
}

const ICE_SERVERS: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302"] }];

// base64 <-> Uint8Array for relaying Yjs binary updates over the JSON text channel.
function toB64(u: Uint8Array): string { let s = ""; for (const b of u) s += String.fromCharCode(b); return btoa(s); }
function fromB64(s: string): Uint8Array { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }

export interface UseCollabRoom {
  status: RoomStatus;
  self: Peer | null;
  peers: Peer[];
  remoteMedia: RemoteMedia[];
  localStream: MediaStream | null;
  doc: Y.Doc | null;
  muted: boolean;
  cameraOff: boolean;
  toggleMute: () => void;
  toggleCamera: () => void;
  leave: () => void;
  error: string | null;
}

// When `joinToken` is supplied the caller is a GUEST (candidate, no login): we
// exchange the opaque signed join token for a collab room token via Lane 1's
// PUBLIC endpoint (POST /public/interview/join), so no auth cookie/JWT is needed.
// Without it, staff join the authed way (POST /interviews/:id/collab-token).
export function useCollabRoom(
  interviewId: string | null,
  role: "host" | "guest",
  displayName: string,
  joinToken?: string | null,
): UseCollabRoom {
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [self, setSelf] = useState<Peer | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [remoteMedia, setRemoteMedia] = useState<RemoteMedia[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const docRef = useRef<Y.Doc | null>(null);
  const selfIdRef = useRef<string>("");
  const peerConns = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);

  const send = useCallback((obj: unknown) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  // Create (or reuse) the RTCPeerConnection to a given peer.
  const ensurePeer = useCallback((peerId: string, initiator: boolean) => {
    let pc = peerConns.current.get(peerId);
    if (pc) return pc;
    pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConns.current.set(peerId, pc);
    const local = localStreamRef.current;
    if (local) for (const track of local.getTracks()) pc.addTrack(track, local);
    pc.onicecandidate = (e) => { if (e.candidate) send({ t: "signal", to: peerId, from: selfIdRef.current, kind: "ice", data: e.candidate }); };
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (!stream) return;
      setRemoteMedia((prev) => {
        if (prev.some((m) => m.id === peerId)) return prev.map((m) => (m.id === peerId ? { ...m, stream } : m));
        return [...prev, { id: peerId, name: peerId, stream }];
      });
    };
    if (initiator) {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc!.createOffer();
          await pc!.setLocalDescription(offer);
          send({ t: "signal", to: peerId, from: selfIdRef.current, kind: "offer", data: offer });
        } catch { /* renegotiation race — ignored */ }
      };
    }
    return pc;
  }, [send]);

  const closePeer = useCallback((peerId: string) => {
    const pc = peerConns.current.get(peerId);
    if (pc) { try { pc.close(); } catch { /* */ } peerConns.current.delete(peerId); }
    setRemoteMedia((prev) => prev.filter((m) => m.id !== peerId));
  }, []);

  useEffect(() => {
    if (!interviewId) return;
    let cancelled = false;
    const doc = new Y.Doc();
    docRef.current = doc;

    // Relay our Yjs updates to the room (skip remote-applied updates via origin).
    const onUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin === "remote") return;
      send({ t: "yjs", from: selfIdRef.current, update: toB64(update) });
    };
    doc.on("update", onUpdate);

    (async () => {
      try {
        // 1) local media (best-effort; the room still works for notes/code if denied).
        let stream: MediaStream | null = null;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        } catch { stream = null; }
        if (cancelled) { stream?.getTracks().forEach((t) => t.stop()); return; }
        localStreamRef.current = stream;
        setLocalStream(stream);

        // 2) token from interview-service. GUEST (join token present): swap the
        // opaque join token for a collab room token at the PUBLIC endpoint, no
        // auth headers. STAFF: the authed collab-token route.
        const res = joinToken
          ? await fetch(`${API_BASE}/public/interview/join`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: joinToken, displayName }),
            })
          : await fetch(`${API_BASE}/interviews/${interviewId}/collab-token`, {
              method: "POST", credentials: "include",
              headers: { "Content-Type": "application/json", ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) },
              body: JSON.stringify({ role, displayName }),
            });
        if (!res.ok) { if (!cancelled) setStatus(res.status === 403 || res.status === 401 ? "denied" : "error"); return; }
        const tok = (await res.json())?.data ?? {};
        if (cancelled) return;

        // 3) connect the WS relay.
        const ws = new WebSocket(`${tok.wsUrl}?room=${encodeURIComponent(tok.roomId)}&token=${encodeURIComponent(tok.token)}`);
        wsRef.current = ws;
        ws.onopen = () => { if (!cancelled) setStatus("live"); };
        ws.onerror = () => { if (!cancelled) setError("Realtime connection error"); };
        ws.onclose = () => { if (!cancelled && status !== "ended") setStatus((s) => (s === "live" ? "ended" : s)); };
        ws.onmessage = (ev) => {
          let msg: any; try { msg = JSON.parse(typeof ev.data === "string" ? ev.data : ""); } catch { return; }
          if (!msg || typeof msg !== "object") return;
          switch (msg.t) {
            case "welcome": {
              selfIdRef.current = msg.self?.id ?? "";
              setSelf({ id: msg.self?.id, name: msg.self?.name, role: msg.self?.role });
              const list: Peer[] = (msg.peers ?? []).map((p: any) => ({ id: p.id, name: p.name, role: p.role }));
              setPeers(list);
              // Send each existing peer our current doc state + (deterministically) initiate media.
              const full = Y.encodeStateAsUpdate(doc);
              for (const p of list) {
                send({ t: "yjs", from: selfIdRef.current, update: toB64(full) });
                ensurePeer(p.id, selfIdRef.current < p.id);
              }
              break;
            }
            case "peer-join": {
              const p: Peer = { id: msg.id, name: msg.name, role: msg.role };
              setPeers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
              // Bootstrap the newcomer with our doc state.
              send({ t: "yjs", from: selfIdRef.current, update: toB64(Y.encodeStateAsUpdate(doc)) });
              ensurePeer(p.id, selfIdRef.current < p.id);
              break;
            }
            case "peer-leave": {
              setPeers((prev) => prev.filter((x) => x.id !== msg.id));
              closePeer(msg.id);
              break;
            }
            case "yjs": {
              if (msg.from === selfIdRef.current) return;
              try { Y.applyUpdate(doc, fromB64(msg.update), "remote"); } catch { /* */ }
              break;
            }
            case "signal": {
              if (msg.to !== selfIdRef.current) return; // targeted; ignore others' frames
              void handleSignal(msg);
              break;
            }
          }
        };

        async function handleSignal(msg: any) {
          const pc = ensurePeer(msg.from, false);
          try {
            if (msg.kind === "offer") {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              send({ t: "signal", to: msg.from, from: selfIdRef.current, kind: "answer", data: answer });
            } else if (msg.kind === "answer") {
              await pc.setRemoteDescription(new RTCSessionDescription(msg.data));
            } else if (msg.kind === "ice") {
              await pc.addIceCandidate(new RTCIceCandidate(msg.data));
            }
          } catch { /* negotiation race — ignored */ }
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      doc.off("update", onUpdate);
      try { wsRef.current?.close(); } catch { /* */ }
      peerConns.current.forEach((pc) => { try { pc.close(); } catch { /* */ } });
      peerConns.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      doc.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId, role, displayName, joinToken]);

  const toggleMute = useCallback(() => {
    const s = localStreamRef.current; if (!s) return;
    const next = !muted; setMuted(next);
    s.getAudioTracks().forEach((t) => { t.enabled = !next; });
  }, [muted]);
  const toggleCamera = useCallback(() => {
    const s = localStreamRef.current; if (!s) return;
    const next = !cameraOff; setCameraOff(next);
    s.getVideoTracks().forEach((t) => { t.enabled = !next; });
  }, [cameraOff]);
  const leave = useCallback(() => {
    try { wsRef.current?.close(); } catch { /* */ }
    setStatus("ended");
  }, []);

  return {
    status, self, peers,
    // attach peer display names from the roster
    remoteMedia: remoteMedia.map((m) => ({ ...m, name: peers.find((p) => p.id === m.id)?.name ?? m.name })),
    localStream, doc: docRef.current, muted, cameraOff, toggleMute, toggleCamera, leave, error,
  };
}
