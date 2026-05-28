# CDC ATS — LinkedIn Sourcer (Chrome extension)

One-click add the LinkedIn profile you're viewing to your CDC ATS candidate pool.

## What it does

- Adds a floating "+ Add to CDC ATS" button on every `linkedin.com/in/*` page
- Scrapes the visible profile: name, headline, location, current title + company, LinkedIn URL
- POSTs to your CDC ATS deployment's `/api/v1/candidates` using your personal API key
- Backend creates (or updates, by LinkedIn URL) the candidate with source = `LINKEDIN`

## Install (developer mode — sideload)

While the extension is not yet on the Chrome Web Store, install it manually:

1. Download or clone this directory: `packages/chrome-extension/`
2. Open Chrome → `chrome://extensions/`
3. Toggle **Developer mode** on (top-right)
4. Click **Load unpacked**
5. Pick the `packages/chrome-extension/` folder
6. The CDC ATS icon appears in your toolbar

## First-time setup

1. Click the CDC ATS icon in the toolbar
2. Paste your **API base URL** (e.g. `https://your-deploy.cdc-ats.com/api`)
3. Paste your **API key** — create one at `Settings → API keys` in your CDC ATS dashboard
4. Click **Save**, then **Test connection** — should say "Connection works"

## Use

1. Browse to any LinkedIn profile (`linkedin.com/in/<name>`)
2. Click the **+ Add to CDC ATS** floating button (bottom-right)
3. The button shows "✓ Added" — the candidate is now in your pool with source = `LINKEDIN`

## Privacy

- The extension reads ONLY the profile page you're viewing when you click the button
- No background scraping, no telemetry, no third-party calls
- Your API key lives in `chrome.storage.sync` (encrypted by Chrome, optionally synced across your devices)
- Your API key is sent ONLY to the API base URL you configure — never to LinkedIn or any third party

## Limitations

- LinkedIn doesn't expose email addresses publicly. We synthesize a placeholder email from the LinkedIn vanity slug (`alex-chen-123.linkedin@unknown.local`). When the candidate actually applies, your CDC ATS will deduplicate by their real email and link the records.
- LinkedIn's DOM changes occasionally. If the button stops scraping a field correctly, file a bug — we update selectors in patch releases.
- Recruiter Lite / Recruiter Pro profile views may show different DOM; v1 targets the standard logged-in profile view.

## Packaging for Chrome Web Store

```bash
cd packages/chrome-extension
zip -r cdc-ats-linkedin.zip . -x "*.md" -x ".DS_Store"
```

Upload the resulting `cdc-ats-linkedin.zip` to the Chrome Web Store developer dashboard.

## Icons

Replace `icons/icon{16,48,128}.png` with your tenant's branded icons before
publishing to the Store. The placeholders in this directory are CDC ATS
default marks.
