/**
 * Phase 34f — extension popup logic.
 *
 * Stores API base URL + key in chrome.storage.sync (so it follows the
 * user across machines if they have Chrome Sync). Tests against
 * GET /api/v1/health (any endpoint that returns 200 with the bearer
 * key works) — using GET against POST /api/v1/candidates returns 405
 * but proves the auth path works.
 *
 * No external libs — vanilla JS so the extension is auditable + small.
 */

const $ = (id) => document.getElementById(id);
const apiBaseEl = $("api-base");
const apiKeyEl = $("api-key");
const statusEl = $("status");

function setStatus(msg, ok) {
  statusEl.textContent = msg;
  statusEl.className = "status " + (ok ? "ok" : "err");
}

// Load saved settings on open
chrome.storage.sync.get(["apiBase", "apiKey"], (cfg) => {
  if (cfg.apiBase) apiBaseEl.value = cfg.apiBase;
  if (cfg.apiKey) apiKeyEl.value = cfg.apiKey;
});

$("save").addEventListener("click", () => {
  const apiBase = apiBaseEl.value.trim().replace(/\/$/, "");
  const apiKey = apiKeyEl.value.trim();
  if (!apiBase || !apiKey) { setStatus("Both fields are required.", false); return; }
  if (!apiKey.startsWith("ats_")) { setStatus("API keys start with ats_", false); return; }
  chrome.storage.sync.set({ apiBase, apiKey }, () => {
    setStatus("Saved.", true);
  });
});

$("test").addEventListener("click", async () => {
  const apiBase = apiBaseEl.value.trim().replace(/\/$/, "");
  const apiKey = apiKeyEl.value.trim();
  if (!apiBase || !apiKey) { setStatus("Fill both fields first.", false); return; }
  setStatus("Testing…", true);
  try {
    // POST with an empty body — server will respond 400 (validation) if the
    // key is good, 401 if the key is bad. Either way we get a clear signal.
    const res = await fetch(`${apiBase}/v1/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({}),
    });
    if (res.status === 401) {
      setStatus("Invalid or revoked API key.", false);
    } else if (res.status === 403) {
      setStatus("Key valid, but missing candidates:write scope.", false);
    } else if (res.status === 400) {
      setStatus("Connection works (got 400 for empty body — expected).", true);
    } else if (res.ok) {
      setStatus("Connection works.", true);
    } else {
      setStatus(`Server returned ${res.status}.`, false);
    }
  } catch (e) {
    setStatus(`Couldn't reach ${apiBase}.`, false);
  }
});
