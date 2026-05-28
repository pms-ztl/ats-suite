/**
 * Phase 34f — background service worker.
 *
 * Receives ADD_CANDIDATE messages from the content script, reads the
 * saved API key + base URL from chrome.storage, and POSTs to /api/v1/candidates.
 *
 * Why this lives in the background: content scripts run inside the
 * LinkedIn page's context. Doing the fetch from there could expose the
 * API key to LinkedIn's own JavaScript. Background workers run in an
 * isolated origin so the key never touches LinkedIn's code.
 */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "ADD_CANDIDATE") return;

  (async () => {
    const { apiBase, apiKey } = await chrome.storage.sync.get(["apiBase", "apiKey"]);
    if (!apiBase || !apiKey) {
      sendResponse({ ok: false, error: "Set API key in popup first." });
      return;
    }
    try {
      const res = await fetch(`${apiBase}/v1/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify(msg.profile),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        sendResponse({ ok: false, error: body?.error?.message ?? `HTTP ${res.status}` });
        return;
      }
      sendResponse({ ok: true, data: body.data ?? body });
    } catch (e) {
      sendResponse({ ok: false, error: String(e?.message ?? e) });
    }
  })();

  // Required to keep the message channel open for the async sendResponse.
  return true;
});
