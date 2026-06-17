"use client";
// app/(dashboard)/chat/page.tsx
// Functional, tenant-isolated, real-time team chat wired to the real backend
// (notification-service /internal/messages, RLS-scoped). Lives INSIDE the dashboard
// shell (sidebar + nav) so it is no longer a dead-end full-screen route. It is a
// full-bleed route, so its root flexes to fill the shell's definite-height main
// area (flex:1; minHeight:0) and the thread panel scrolls instead of collapsing.
// Conversations, threads and unread counts come
// from the API; new messages arrive live over the shared SSE stream
// (/api/notifications/stream, "message" events). A user can only ever see and
// message people in their own tenant — enforced by RLS server-side.
import { useState, useEffect, useRef, useCallback } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  listConversations, getConversationMessages, sendMessage, createConversation,
  markConversationRead, listAssignableUsers,
  type Conversation, type ChatMessage, type AssignableUser,
} from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function initials(name: string): string {
  return name.split(" ").map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?";
}

export default function ChatPage() {
  const { user } = useCurrentUser();
  const meId = (user as any)?.id as string | undefined;
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState(false);
  const [threadLoading, setThreadLoading] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selected;

  const nameOf = useCallback((id: string): string => {
    if (id === meId) return "You";
    const u = users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : "Teammate";
  }, [users, meId]);

  const reloadConvos = useCallback(async () => { setConvos(await listConversations()); }, []);

  const openConvo = useCallback(async (id: string) => {
    setSelected(id);
    // Clear the previous thread and show a loading state immediately so the
    // panel never flashes a misleading "empty thread" while the real messages
    // for THIS conversation are still in flight.
    setMessages([]);
    setThreadLoading(true);
    try {
      setMessages(await getConversationMessages(id));
      await markConversationRead(id);
      setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => { reloadConvos(); listAssignableUsers().then(setUsers); }, [reloadConvos]);

  // Real-time: append messages for the open thread, refresh the list otherwise.
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_BASE}/notifications/stream`, { withCredentials: true });
      es.addEventListener("message", (e: MessageEvent) => {
        try {
          const p = JSON.parse(e.data);
          if (p?.kind !== "message") return;
          if (p.conversationId === selectedRef.current) {
            setMessages((m) => (m.some((x) => x.id === p.message.id) ? m : [...m, p.message]));
            markConversationRead(p.conversationId);
          }
          reloadConvos();
        } catch { /* ignore */ }
      });
    } catch { /* SSE unavailable — list still refreshes on actions */ }
    return () => { es?.close(); };
  }, [reloadConvos]);

  useEffect(() => { threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight }); }, [messages]);

  const send = async () => {
    const body = draft.trim();
    if (!body || !selected || sending) return;
    setSending(true); setDraft("");
    try {
      const msg = await sendMessage(selected, body);
      setMessages((m) => [...m, msg]);
      reloadConvos();
    } catch { setDraft(body); } finally { setSending(false); }
  };

  const startWith = async (uid: string) => {
    setShowNew(false);
    try { const { id } = await createConversation([uid]); await reloadConvos(); openConvo(id); } catch { /* ignore */ }
  };

  const selectedConvo = convos.find((c) => c.id === selected);
  const title = (c: Conversation) => c.title || c.participantIds.filter((p) => p !== meId).map(nameOf).join(", ") || "Conversation";
  // Header title for the open thread: use the conversation's resolved name, or a
  // neutral label while the conversation metadata is still loading into the list.
  const selectedTitle = selectedConvo ? title(selectedConvo) : "Conversation";

  return (
    <div className="cd-scope" style={{ flex: 1, minHeight: 0, display: "flex", background: "var(--c-bg)", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}>
      {/* sidebar */}
      <div style={{ width: 300, borderRight: "1px solid var(--c-line)", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: 0 }}>
        <div style={{ padding: "18px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 800, fontSize: "var(--fs-xl)", letterSpacing: "-0.02em" }}>Messages</div>
          <button onClick={() => setShowNew((s) => !s)} title="New message" style={{ width: 34, height: 34, borderRadius: 99, border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>+</button>
        </div>
        {showNew && (
          <div style={{ padding: "0 12px 10px" }}>
            <div style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", maxHeight: 240, overflowY: "auto" }}>
              <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--c-ink-3)" }}>Start a chat with</div>
              {users.filter((u) => u.id !== meId).map((u) => (
                <button key={u.id} onClick={() => startWith(u.id)} style={{ display: "flex", gap: 10, alignItems: "center", width: "100%", padding: "9px 12px", border: "none", background: "transparent", cursor: "pointer", textAlign: "left", color: "var(--c-ink)", fontFamily: "var(--font-sans)" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 99, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>{initials(`${u.firstName} ${u.lastName}`)}</span>
                  <span style={{ fontSize: "var(--fs-sm)" }}>{u.firstName} {u.lastName} <span style={{ color: "var(--c-ink-3)", fontSize: 11 }}>· {u.role}</span></span>
                </button>
              ))}
              {users.filter((u) => u.id !== meId).length === 0 && <div style={{ padding: "9px 12px", fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>No teammates yet.</div>}
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px" }}>
          {convos.length === 0 && <div style={{ padding: 20, fontSize: "var(--fs-sm)", color: "var(--c-ink-3)" }}>No conversations yet. Click + to start one.</div>}
          {convos.map((c) => (
            <button key={c.id} onClick={() => openConvo(c.id)} style={{ display: "flex", gap: 11, alignItems: "center", width: "100%", padding: "11px 12px", borderRadius: "var(--r-lg)", border: "none", background: selected === c.id ? "var(--c-surface-2)" : "transparent", cursor: "pointer", textAlign: "left", color: "var(--c-ink)", marginBottom: 2, fontFamily: "var(--font-sans)" }}>
              <span style={{ width: 38, height: 38, borderRadius: 99, background: "var(--c-brand-tint)", color: "var(--c-brand)", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{initials(title(c))}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: "var(--fs-sm)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title(c)}</span>
                  {c.unread > 0 && <span style={{ background: "var(--c-brand)", color: "var(--c-on-brand)", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 7px", flexShrink: 0 }}>{c.unread}</span>}
                </span>
                <span style={{ display: "block", fontSize: 12, color: "var(--c-ink-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>{c.lastMessage ? c.lastMessage.body : "No messages yet"}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* thread */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        {selected ? (
          <>
            <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--c-line)", fontWeight: 700, fontSize: "var(--fs-lg)" }}>{selectedTitle}</div>
            <div ref={threadRef} style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.map((m) => {
                const mine = m.senderId === meId;
                return (
                  <div key={m.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "62%" }}>
                    {!mine && <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginBottom: 3, marginLeft: 4 }}>{nameOf(m.senderId)}</div>}
                    <div style={{ padding: "9px 13px", borderRadius: 14, background: mine ? "var(--c-brand)" : "var(--c-surface-2)", color: mine ? "var(--c-on-brand)" : "var(--c-ink)", fontSize: "var(--fs-sm)", lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.body}</div>
                    <div style={{ fontSize: 10, color: "var(--c-ink-3)", marginTop: 3, textAlign: mine ? "right" : "left" }}>{timeLabel(m.createdAt)}</div>
                  </div>
                );
              })}
              {threadLoading && messages.length === 0 && <div style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-sm)", margin: "auto" }}>Loading conversation…</div>}
              {!threadLoading && messages.length === 0 && <div style={{ color: "var(--c-ink-3)", fontSize: "var(--fs-sm)", margin: "auto" }}>No messages yet — say hello.</div>}
            </div>
            <div style={{ padding: "14px 22px", borderTop: "1px solid var(--c-line)", display: "flex", gap: 10, alignItems: "flex-end" }}>
              <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Write a message... (Enter to send)" style={{ flex: 1, resize: "none", padding: "11px 14px", borderRadius: "var(--r-lg)", border: "1px solid var(--c-line-2)", background: "var(--c-surface)", color: "var(--c-ink)", fontSize: "var(--fs-sm)", fontFamily: "var(--font-sans)", outline: "none", maxHeight: 120 }} />
              <button onClick={send} disabled={!draft.trim() || sending} style={{ padding: "11px 20px", borderRadius: "var(--r-lg)", border: "none", background: "var(--c-brand)", color: "var(--c-on-brand)", fontWeight: 700, fontSize: "var(--fs-sm)", cursor: draft.trim() ? "pointer" : "default", opacity: draft.trim() && !sending ? 1 : 0.5, fontFamily: "var(--font-sans)" }}>Send</button>
            </div>
          </>
        ) : (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--c-ink-3)" }}>
            <div style={{ fontSize: "var(--fs-xl)", fontWeight: 700, color: "var(--c-ink-2)", marginBottom: 6 }}>Your team chat</div>
            <div style={{ fontSize: "var(--fs-sm)" }}>Select a conversation, or start a new one with the + button.</div>
          </div>
        )}
      </div>
    </div>
  );
}
