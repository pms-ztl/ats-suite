# collab-service

The interview collaboration hub (`@cdc-ats/collab-service`): a stateless,
room-scoped WebSocket relay for the built-in interview room. Unlike the other
services it is a raw `ws` WebSocket server, not an Express `/internal/*` API.

Default port: **4016** (`PORT`).

## What it does

It fans out every message a participant sends to the OTHER participants in the
same room, carrying two axes the interview room needs:

- WebRTC signaling (offer / answer / ICE) for the peer-to-peer video, and
- Yjs document updates for the co-edited notes / code / whiteboard.

The server deliberately does NOT parse or understand the payloads. Conflict
resolution and late-joiner sync are a pure client concern (the CRDTs live on the
clients via Yjs, exchanged through this relay). Joining a room requires a signed
token minted by interview-service (`verifyCollabToken`) — there are no open rooms.

## HTTP endpoints (management only)

An embedded Express app exposes:

- `GET /health` — status plus current room count.
- `GET /healthz` — liveness.
- `GET /metrics` — Prometheus text: `collab_rooms` and `collab_participants` gauges.

The WebSocket endpoint is served on the same port (the interview room connects to
the `/rt` path).

## Events

No NATS `publishEvent`/`subscribeToEvents`. All fan-out is over WebSocket within a
room; nothing is persisted or published to NATS.

## Environment variables

Read directly in `src/`: `PORT` and `COLLAB_TOKEN_SECRET` (the HMAC secret used to
verify the room token minted by interview-service; must match interview-service's
`COLLAB_TOKEN_SECRET`).

This service has no database.

## Run

```bash
npm run dev --workspace=@cdc-ats/collab-service
```

`tsx watch` with `--env-file=../../.env`. Deployed as a static Docker image via
`infra/Dockerfile.service` (`--build-arg SERVICE=collab-service`, build = `tsc`);
code changes require an image rebuild and container recreate.
