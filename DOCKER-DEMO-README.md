# Run the whole app online with ONLY Docker

A fresh laptop needs nothing installed but **Docker Desktop**. One command builds
and runs everything (all 14 backend services, the frontend, Postgres, Redis,
NATS, MinIO), seeds demo data, and opens a free public link you can share. No
Node, no npm, no database setup.

---

## Fastest path

### On Windows
1. Install **Docker Desktop**, open it, and wait until it says "running".
2. Double-click **`docker-demo.bat`** in this folder.
   - The first time, it creates a `.env` file and stops. Open **`.env`**, set
     `OPENROUTER_API_KEY=your-key`, save, then double-click `docker-demo.bat` again.
3. Wait. The **first run builds everything (about 20 to 30 minutes)**; every run
   after that takes seconds. Keep the window open.
4. When it finishes it **prints your live link right in the window**:

   ```
   YOUR DEMO IS LIVE AT:
       https://<random-words>.trycloudflare.com
   ```

   The same link is also saved in **`CURRENT-DEMO-URL.txt`** next to the script.

### On Mac / Linux
```bash
cp .env.example .env        # then open .env and set OPENROUTER_API_KEY
docker compose -f docker-compose.demo.yml up -d --build    # first run ~20-30 min

# then get the live link:
docker compose -f docker-compose.demo.yml logs cloudflared | grep trycloudflare
```

---

## Where is my live link?

It is available any time, in any of these:

- **Windows:** printed by `docker-demo.bat`, and saved in `CURRENT-DEMO-URL.txt`.
- **Any OS:** run
  `docker compose -f docker-compose.demo.yml logs cloudflared`
  and look for the line `https://....trycloudflare.com`.

Open that link in any browser, on any device, anywhere in the world. Log in with:

- `priya@pinnacle.demo` / `PinnacleDemo123!` (tenant admin)
- `super@cdc-ats.demo` / `DemoSuper-2026!` (platform / super admin)

---

## Stop and start again

```bash
docker compose -f docker-compose.demo.yml down      # stop (keeps your data)
docker compose -f docker-compose.demo.yml up -d     # start again (no rebuild, seconds)
docker compose -f docker-compose.demo.yml down -v   # stop AND wipe all data
```

On Windows you can also just double-click `docker-demo.bat` again to start it and
get a fresh link.

---

## Good to know (please read once)

- **First build is slow (~20 to 30 min)** because it compiles 14 services. This
  is normal and only happens once; later starts are seconds.
- **Disk space:** Docker needs roughly 10 GB free for the images. On Windows, if
  your C: drive is full, move Docker's disk: Docker Desktop > Settings >
  Resources > Advanced > "Disk image location" > pick a folder on a drive that
  has space, then Apply and Restart.
- **The link changes every time you start** (free Cloudflare tunnels get a random
  name). It is always printed and saved to `CURRENT-DEMO-URL.txt`, so you never
  have to hunt for it.
- **Live only while this machine and Docker are running.** Closing Docker or
  shutting down the laptop takes the link offline. An always-on link needs paid
  hosting (a small VPS or a cloud platform).
- **If the link will not open on THIS computer**, turn on your browser's
  "Secure DNS" and set it to Cloudflare (Chrome/Edge: Settings > Privacy >
  Use secure DNS). Anyone else, or your phone, opens it normally.
- **Tenant isolation (RLS) is off in this demo image** for simplicity. It is
  fully present in the code and turned on in the cloud deployment (`render.yaml`).
  Fine for a demo, not for real multi-tenant production.
- **Resumes** are stored in the bundled MinIO, so no external S3 account is needed.

---

## What actually happens when you run it

1. Postgres starts and creates all 13 service databases.
2. `migrator` applies every service's schema, then exits.
3. The 14 backend services and the frontend start and become healthy.
4. `seeder` loads the demo tenants, users, requisitions, and candidates, and
   unlocks AI by putting the demo tenants on the ENTERPRISE plan, then exits.
5. `cloudflared` opens the public tunnel and prints your link.
