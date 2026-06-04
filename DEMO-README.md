# Put the demo online yourself (no Claude needed)

Two scripts make the app reachable from anywhere over a free public link, and
they print that link right in the window so you always know it.

## Run it

Double-click **`start-demo.bat`** (or in a terminal: `powershell -ExecutionPolicy Bypass -File .\start-demo.ps1`).

It will:
1. Start the database + Redis + NATS (Docker), the backend, and the frontend if they are not already up.
2. Open a free Cloudflare tunnel.
3. Print the public URL in the window, like:

```
   YOUR DEMO IS LIVE AT:
       https://<random-words>.trycloudflare.com
```

4. Save that same URL to **`CURRENT-DEMO-URL.txt`** so you can copy it any time.

Login: `priya@pinnacle.demo` / `PinnacleDemo123!` (tenant admin) or
`super@cdc-ats.demo` / `DemoSuper-2026!` (platform/super admin).

To take it offline: double-click **`stop-demo.bat`**.

## One-time setup per machine

This is needed once on each computer (not on each run):

- **Docker Desktop** installed and running (for Postgres / Redis / NATS).
- **Node.js 20+**, then run `npm install` once in this folder.
- A **`.env`** file in this folder with your keys (at minimum `OPENROUTER_API_KEY`).
  `.env` is never committed to GitHub for security, so copy yours onto each machine.

`cloudflared` (the tunnel tool) installs itself automatically on first run.

## Good to know (the honest limits)

- **The link is live only while this machine is on** and the script is running.
  Close the machine or run `stop-demo` and the link stops working. That is the
  trade-off for a free tunnel; an always-on link needs paid hosting.
- **The URL changes** each time you start the tunnel (free Cloudflare tunnels are
  random by design). That is fine now because the script prints it and saves it
  to `CURRENT-DEMO-URL.txt` every time.
- **If the link will not open on THIS PC**, turn on your browser's "Secure DNS"
  and set it to Cloudflare (Chrome/Edge: Settings > Privacy > Use secure DNS).
  Anyone you share it with on a normal network or phone opens it fine.
- **Live chat / notification push** are not instant through the free tunnel
  (Cloudflare buffers them); they update on refresh. Everything else is real-time.
