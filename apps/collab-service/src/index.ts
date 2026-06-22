import { initOpenTelemetry, initSentry, createLogger, registerGracefulShutdown } from "@cdc-ats/common";
initOpenTelemetry({ serviceName: "collab-service" });
initSentry({ serviceName: "collab-service" });

import http from "node:http";
import express, { type Request, type Response } from "express";
import { WebSocketServer, WebSocket } from "ws";
import { verifyCollabToken, type CollabClaims } from "./token.js";

const logger = createLogger({ serviceName: "collab-service" });
const PORT = Number(process.env["PORT"] ?? 4016);

// Module D — interview collaboration hub. A stateless, room-scoped WebSocket
// RELAY: it fans out every message a participant sends to the OTHER participants
// in the same room. This carries both axes the interview room needs:
//   • WebRTC signaling (offer/answer/ICE) for the own-signaling P2P video, and
//   • Yjs document updates for the co-edited notes / code / whiteboard.
// The server deliberately does NOT parse or understand the payloads — the CRDTs
// live on the clients (Yjs), so conflict resolution + late-joiner sync are a pure
// client concern (peers exchange Yjs sync messages through this relay). That keeps
// the hub tiny, dependency-light, and horizontally trivial. Joining requires a
// signed token minted by interview-service (no open rooms).

interface Participant {
  ws: WebSocket;
  id: string;
  claims: CollabClaims;
}

const rooms = new Map<string, Set<Participant>>();
let nextId = 1;

function join(roomId: string, p: Participant) {
  let set = rooms.get(roomId);
  if (!set) { set = new Set(); rooms.set(roomId, set); }
  set.add(p);
}
function leave(roomId: string, p: Participant) {
  const set = rooms.get(roomId);
  if (!set) return;
  set.delete(p);
  if (set.size === 0) rooms.delete(roomId);
}
function peers(roomId: string, except: Participant): Participant[] {
  const set = rooms.get(roomId);
  if (!set) return [];
  return [...set].filter((x) => x !== except);
}

const app = express();
app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok", rooms: rooms.size }));
app.get("/healthz", (_req: Request, res: Response) => res.json({ status: "ok" }));
app.get("/metrics", (_req: Request, res: Response) => {
  let participants = 0;
  for (const s of rooms.values()) participants += s.size;
  res.set("Content-Type", "text/plain");
  res.end(`collab_rooms ${rooms.size}\ncollab_participants ${participants}\n`);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

// Upgrade only the /rt path; validate the token from the query string BEFORE the
// socket is accepted, so an unauthorized client never reaches a room.
server.on("upgrade", (req, socket, head) => {
  let url: URL;
  try { url = new URL(req.url ?? "/", "http://localhost"); } catch { socket.destroy(); return; }
  if (url.pathname !== "/rt" && url.pathname !== "/rt/") { socket.destroy(); return; }
  const token = url.searchParams.get("token") ?? "";
  const claims = verifyCollabToken(token);
  const roomFromQuery = url.searchParams.get("room") ?? "";
  if (!claims || (roomFromQuery && roomFromQuery !== claims.roomId)) { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req, claims);
  });
});

wss.on("connection", (ws: WebSocket, _req: http.IncomingMessage, claims: CollabClaims) => {
  const participant: Participant = { ws, id: `p${nextId++}`, claims };
  const roomId = claims.roomId;
  join(roomId, participant);
  logger.info({ roomId, role: claims.role, id: participant.id }, "collab join");

  // Announce the new peer + the existing roster so clients can initiate WebRTC
  // and Yjs sync. (Control frames are JSON; payload frames are passed through.)
  const roster = peers(roomId, participant).map((x) => ({ id: x.id, role: x.claims.role, name: x.claims.displayName }));
  ws.send(JSON.stringify({ t: "welcome", self: { id: participant.id, role: claims.role, name: claims.displayName }, peers: roster }));
  for (const peer of peers(roomId, participant)) {
    peer.ws.send(JSON.stringify({ t: "peer-join", id: participant.id, role: claims.role, name: claims.displayName }));
  }

  ws.on("message", (data: Buffer, isBinary: boolean) => {
    // Pure relay: forward to every other participant in the room untouched.
    for (const peer of peers(roomId, participant)) {
      if (peer.ws.readyState === WebSocket.OPEN) peer.ws.send(data, { binary: isBinary });
    }
  });

  ws.on("close", () => {
    leave(roomId, participant);
    for (const peer of peers(roomId, participant)) {
      if (peer.ws.readyState === WebSocket.OPEN) peer.ws.send(JSON.stringify({ t: "peer-leave", id: participant.id }));
    }
    logger.info({ roomId, id: participant.id }, "collab leave");
  });

  ws.on("error", (err) => logger.warn({ err, roomId, id: participant.id }, "collab ws error"));
});

server.listen(PORT, () => logger.info({ port: PORT }, "collab-service listening (ws /rt)"));

registerGracefulShutdown({ logger, server, onShutdown: [async () => { wss.close(); }] });
