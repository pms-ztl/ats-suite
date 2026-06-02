#!/usr/bin/env bash
# Port the Claude Design "next/" export (100% coverage) into the real app,
# preserving the EXACT design files. Deterministic transforms only:
#  - dashboard-style pages: <main ...max-w[..] p-6> -> <div ...> (app shell
#    already provides <main className="p-6">), </main> -> </div>
#  - portal pages: <main> -> <div> only (CandidateLayout provides the wrapper)
#  - standalone pages (marketing/offline/not-found/error): copied verbatim
# Auth PAGES are intentionally skipped (they need real login wiring); the shared
# _auth shell IS brought in.
set -euo pipefail
SRC="/d/CDC/ATS/claude-design/next/app"
DST="/d/CDC/ATS/apps/frontend/app"

dashxform() { # main->div, </main>-></div>, strip ` p-6` from the mx-auto/max-w container
  perl -0pi -e 's/<main\b/<div/g; s/<\/main>/<\/div>/g; s/(className="[^"]*\bmx-auto\b[^"]*?\bmax-w-\[[^\]]*\][^"]*?)\s+p-6\b/$1/g;' "$1"
}
portalxform() { # main->div only (keep the design padding; layout wraps it)
  perl -0pi -e 's/<main\b/<div/g; s/<\/main>/<\/div>/g;' "$1"
}

copied=0
# 1) (dashboard)/** -> (dashboard)/**  (includes settings/layout.tsx + settings/* pages)
while IFS= read -r f; do
  rel="${f#"$SRC/(dashboard)/"}"
  mkdir -p "$DST/(dashboard)/$(dirname "$rel")"
  cp "$f" "$DST/(dashboard)/$rel"; dashxform "$DST/(dashboard)/$rel"; copied=$((copied+1))
done < <(find "$SRC/(dashboard)" -name "*.tsx")

# 2) (admin)/admin/** -> (dashboard)/admin/**  (keeps the app's admin/layout.tsx guard)
while IFS= read -r f; do
  rel="${f#"$SRC/(admin)/admin/"}"
  mkdir -p "$DST/(dashboard)/admin/$(dirname "$rel")"
  cp "$f" "$DST/(dashboard)/admin/$rel"; dashxform "$DST/(dashboard)/admin/$rel"; copied=$((copied+1))
done < <(find "$SRC/(admin)/admin" -name "*.tsx")

# 3) (portal)/** -> (candidate-portal)/**
while IFS= read -r f; do
  rel="${f#"$SRC/(portal)/"}"
  mkdir -p "$DST/(candidate-portal)/$(dirname "$rel")"
  cp "$f" "$DST/(candidate-portal)/$rel"; portalxform "$DST/(candidate-portal)/$rel"; copied=$((copied+1))
done < <(find "$SRC/(portal)" -name "*.tsx")

# 4) standalone singles
mkdir -p "$DST/offline" "$DST/pricing" "$DST/welcome" "$DST/(auth)"
cp "$SRC/offline/page.tsx"            "$DST/offline/page.tsx"
cp "$SRC/(marketing)/pricing/page.tsx" "$DST/pricing/page.tsx"
cp "$SRC/(marketing)/page.tsx"        "$DST/welcome/page.tsx"   # landing at /welcome ('/' is the dashboard)
cp "$SRC/not-found.tsx"               "$DST/not-found.tsx"
cp "$SRC/error.tsx"                   "$DST/error.tsx"
cp "$SRC/(auth)/_auth.tsx"            "$DST/(auth)/_auth.tsx"
copied=$((copied+6))

echo "copied/transformed: $copied files"
