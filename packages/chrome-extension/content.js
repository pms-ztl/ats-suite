/**
 * Phase 34f — content script injected into linkedin.com/in/* pages.
 *
 * Adds a floating "Add to CDC ATS" button. On click, scrapes the visible
 * profile data (name, headline, location, current title, current company,
 * LinkedIn URL) and asks the background worker to POST it to /api/v1/candidates.
 *
 * Why scrape instead of using LinkedIn's API: their official API requires
 * a partnership and Recruiter license. The scraper approach mirrors what
 * Greenhouse + Lever + Workable do; it's robust to LinkedIn's frequent
 * DOM changes because we use multiple fallback selectors.
 */

(function () {
  // Avoid double-injection if LinkedIn does a soft navigation back.
  if (document.querySelector("#cdc-ats-fab")) return;

  function getText(selectors) {
    for (const s of selectors) {
      const el = document.querySelector(s);
      if (el && el.textContent && el.textContent.trim()) {
        return el.textContent.trim().replace(/\s+/g, " ");
      }
    }
    return "";
  }

  function scrapeProfile() {
    // LinkedIn changes class names regularly; multiple selectors per field
    // make this resilient. Stable selectors as of 2026-05.
    const name = getText([
      "h1.text-heading-xlarge",
      "h1.top-card-layout__title",
      "h1.pv-text-details__left-panel",
    ]);
    const headline = getText([
      "div.text-body-medium.break-words",
      "h2.top-card-layout__headline",
      ".pv-text-details__left-panel .text-body-medium",
    ]);
    const location = getText([
      "span.text-body-small.inline.t-black--light.break-words",
      ".top-card__subline-item",
      ".pv-text-details__left-panel .text-body-small",
    ]);
    // Current position: first non-section-header div under "Experience"
    const currentTitle = getText([
      "#experience + .pvs-list__outer-container .pv-entity__summary-info h3",
      ".experience-section .pv-entity__summary-info h3",
      "section[data-section='currentPositionsDetails'] h3",
    ]);
    const currentCompany = getText([
      "#experience + .pvs-list__outer-container .pv-entity__secondary-title",
      ".experience-section .pv-entity__secondary-title",
    ]);

    const parts = name.split(/\s+/);
    const firstName = parts[0] ?? "Unknown";
    const lastName = parts.slice(1).join(" ") || "—";

    return {
      // Use LinkedIn vanity URL as the candidate's primary identifier.
      // We don't have their email from the public profile — backend
      // upserts on email, so we synthesize a stable per-profile email
      // using the vanity slug. They can be merged later when the real
      // email surfaces (via an apply or a recruiter edit).
      linkedinProfileUrl: window.location.href.split("?")[0],
      fullName: name,
      firstName, lastName,
      headline,
      location,
      currentTitle,
      currentCompany,
      // Synthetic email — vanity slug from URL
      email: (() => {
        const m = window.location.href.match(/linkedin\.com\/in\/([^/?#]+)/);
        return m ? `${m[1].toLowerCase()}.linkedin@unknown.local` : "unknown.linkedin@unknown.local";
      })(),
    };
  }

  const fab = document.createElement("button");
  fab.id = "cdc-ats-fab";
  fab.type = "button";
  fab.textContent = "+ Add to CDC ATS";
  fab.addEventListener("click", async () => {
    const original = fab.textContent;
    fab.textContent = "Saving…";
    fab.disabled = true;
    try {
      const profile = scrapeProfile();
      // Hand off to background worker — content scripts can't read
      // chrome.storage by themselves on all Chrome versions.
      const reply = await chrome.runtime.sendMessage({ type: "ADD_CANDIDATE", profile });
      if (reply?.ok) {
        fab.textContent = "✓ Added";
        fab.classList.add("cdc-ats-ok");
        setTimeout(() => { fab.textContent = original; fab.classList.remove("cdc-ats-ok"); fab.disabled = false; }, 2500);
      } else {
        fab.textContent = reply?.error ? `× ${reply.error.slice(0, 30)}` : "× Failed";
        fab.classList.add("cdc-ats-err");
        setTimeout(() => { fab.textContent = original; fab.classList.remove("cdc-ats-err"); fab.disabled = false; }, 3500);
      }
    } catch (e) {
      fab.textContent = `× ${String(e).slice(0, 30)}`;
      fab.disabled = false;
    }
  });
  document.body.appendChild(fab);
})();
