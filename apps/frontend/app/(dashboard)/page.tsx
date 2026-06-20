"use client";
// app/(dashboard)/page.tsx - the customizable dashboard HOME.
//
// SLICE E7 (read engine) + SLICE F2 (edit mode + persistence write path).
//
// The home resolves the active dashboard document (use-dashboard-layout: user
// override -> tenant default -> per-role SYSTEM default) and renders it through
// <WidgetGrid> + <WidgetFrame>. WF6/F2 adds EDIT mode on top:
//
//   - <DashboardToolbar> mounts above the grid with a Customize toggle and, in
//     edit mode, Add widget / Save / Cancel / Reset-to-default (+ admin "Set as
//     tenant default") plus the shared LiveStatus chip.
//   - Edit mode operates on a WORKING COPY of the document (copy-on-write): drag/
//     resize, add (palette), remove (X), and per-widget settings (gear) all
//     mutate the working copy only. Save PUTs the WHOLE working document; Cancel
//     reverts to the loaded doc; Reset DELETEs the personal override and reloads
//     the default.
//   - Graceful fallback: if the persistence route 404s, the read falls back to
//     the WF5 seeded default (byte-identical) and Save surfaces an honest error.
//
// REAL DATA OR HONEST EMPTY ONLY: every cell is a <WidgetFrame> bound to the
// widget's dataSourceKey; the frame fetches the real source and the body renders
// the real value or an honest empty state. The engine only places cells.
import * as React from "react";
import { Greeting, Btn } from "@/components/aurora-kit";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useDashboardLayout } from "@/hooks/use-dashboard-layout";
import { useModules } from "@/hooks/use-modules";
import WidgetGrid, { type WidgetRenderFn } from "@/components/dashboard/WidgetGrid";
import { WidgetFrame } from "@/components/dashboard/WidgetFrame";
import { DashboardToolbar } from "@/components/dashboard/DashboardToolbar";
import { WidgetPalette } from "@/components/dashboard/WidgetPalette";
import {
  WidgetSettings,
  type WidgetSettingsResult,
} from "@/components/dashboard/WidgetSettings";
import { getCatalogEntry } from "@/lib/widgets/registry";
import type { DashboardDocument, DashboardWidget } from "@cdc-ats/contracts";

const BREAKPOINT_KEYS = ["lg", "md", "sm", "xs", "xxs"] as const;

function greetingFor(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}
function firstName(user: { name?: string } | null | undefined): string {
  return (user?.name || "there").split(" ")[0];
}

// Read a widget's current footprint from the lg layout (the authored breakpoint),
// falling back to its registry default if absent. Used to seed the settings form.
function sizeOf(doc: DashboardDocument, instanceId: string): { w: number; h: number } {
  const item = doc.layouts.lg.find((l) => l.i === instanceId);
  if (item) return { w: item.w, h: item.h };
  const w = doc.widgets.find((x) => x.instanceId === instanceId);
  const entry = w ? getCatalogEntry(w.type) : undefined;
  return { w: entry?.defaultSize.w ?? 4, h: entry?.defaultSize.h ?? 4 };
}

// Remove a widget (and its layout items in every breakpoint) from the document.
function removeWidget(doc: DashboardDocument, instanceId: string): DashboardDocument {
  const layouts = { ...doc.layouts } as DashboardDocument["layouts"];
  for (const bp of BREAKPOINT_KEYS) {
    layouts[bp] = doc.layouts[bp].filter((l) => l.i !== instanceId);
  }
  return {
    ...doc,
    widgets: doc.widgets.filter((w) => w.instanceId !== instanceId),
    layouts,
  };
}

// Apply a settings result: replace the widget definition and stamp its new w/h
// onto its layout item in every breakpoint (clamped sizes come from the form).
function applySettings(
  doc: DashboardDocument,
  result: WidgetSettingsResult,
): DashboardDocument {
  const id = result.widget.instanceId;
  const layouts = { ...doc.layouts } as DashboardDocument["layouts"];
  for (const bp of BREAKPOINT_KEYS) {
    layouts[bp] = doc.layouts[bp].map((l) =>
      l.i === id ? { ...l, w: result.size.w, h: result.size.h } : l,
    );
  }
  return {
    ...doc,
    widgets: doc.widgets.map((w) => (w.instanceId === id ? result.widget : w)),
    layouts,
  };
}

export default function DashboardHome() {
  const { user } = useCurrentUser();
  const {
    document: resolvedDoc,
    source,
    loading,
    save,
    reset,
    saving,
    saveError,
  } = useDashboardLayout();
  // Resolve the tenant's enabled module set (graceful all-enabled fallback). Used
  // to gate the Add-widget palette exactly like the cd-shell nav.
  const { enabledKeys } = useModules();

  // ── edit state ────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = React.useState(false);
  // The working copy: null when not editing (render the resolved doc directly).
  const [draft, setDraft] = React.useState<DashboardDocument | null>(null);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  // The widget whose settings form is open (instanceId), or null.
  const [settingsFor, setSettingsFor] = React.useState<string | null>(null);
  const [localError, setLocalError] = React.useState<Error | undefined>(undefined);

  // The document actually rendered: the working draft in edit mode, else the
  // resolved (read) document.
  const activeDoc = isEditing && draft ? draft : resolvedDoc;

  // One honest freshness signal for the toolbar's single <LiveStatus>: stamp the
  // wall-clock time whenever the board's layout finishes resolving (loading -> ok).
  // The per-widget data has its own 45s live layer; this chip reflects that the
  // board itself is loaded, never a fabricated "always live".
  const loadedAtRef = React.useRef<number | null>(null);
  const updatedAt = React.useMemo(() => {
    if (!loading) loadedAtRef.current = Date.now();
    return loadedAtRef.current ?? undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, resolvedDoc]);

  // Dirty = the draft differs from what was loaded (cheap structural compare).
  const dirty = React.useMemo(() => {
    if (!isEditing || !draft) return false;
    return JSON.stringify(draft) !== JSON.stringify(resolvedDoc);
  }, [isEditing, draft, resolvedDoc]);

  const enterEdit = React.useCallback(() => {
    // Snapshot the resolved doc into the working copy (copy-on-write).
    setDraft(JSON.parse(JSON.stringify(resolvedDoc)) as DashboardDocument);
    setIsEditing(true);
    setLocalError(undefined);
  }, [resolvedDoc]);

  const cancelEdit = React.useCallback(() => {
    // Revert: drop the working copy and leave edit mode.
    setDraft(null);
    setIsEditing(false);
    setPaletteOpen(false);
    setSettingsFor(null);
    setLocalError(undefined);
  }, []);

  // Sanitize any RGL auto-place sentinels (x/y = Infinity) to integers before a
  // save validates the document (the contract requires nonnegative integers). RGL
  // normally resolves Infinity via onLayoutChange before Save, but a save fired
  // before a layout pass would otherwise carry it; clamp defensively.
  const sanitize = React.useCallback((doc: DashboardDocument): DashboardDocument => {
    const layouts = { ...doc.layouts } as DashboardDocument["layouts"];
    for (const bp of BREAKPOINT_KEYS) {
      layouts[bp] = doc.layouts[bp].map((l) => ({
        ...l,
        x: Number.isFinite(l.x) ? Math.max(0, Math.round(l.x)) : 0,
        y: Number.isFinite(l.y) ? Math.max(0, Math.round(l.y)) : 0,
      }));
    }
    return { ...doc, layouts };
  }, []);

  const doSave = React.useCallback(async () => {
    if (!draft) return;
    setLocalError(undefined);
    try {
      await save(sanitize(draft));
      setDraft(null);
      setIsEditing(false);
      setPaletteOpen(false);
      setSettingsFor(null);
    } catch {
      // save() already captured saveError; stay in edit mode so the user can
      // retry or cancel. The toolbar shows the error.
    }
  }, [draft, save, sanitize]);

  const doReset = React.useCallback(async () => {
    setLocalError(undefined);
    try {
      await reset();
      setDraft(null);
      setIsEditing(false);
      setPaletteOpen(false);
      setSettingsFor(null);
    } catch {
      // reset() captured the error; the toolbar surfaces it.
    }
  }, [reset]);

  // ADMIN-only "Set as tenant default": best-effort PUT to the tenant board route.
  // Additive + graceful: if the route is absent (404), surface an honest notice
  // rather than fabricating success. Wired only for admins (callback omitted
  // otherwise, hiding the button).
  const isAdmin = (user?.role ?? "").toUpperCase() === "ADMIN";
  const setTenantDefault = React.useCallback(async () => {
    if (!draft) return;
    setLocalError(undefined);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
      let token: string | null = null;
      try {
        token = typeof window !== "undefined" ? window.sessionStorage.getItem("ats-access-token") : null;
      } catch {
        token = null;
      }
      const res = await fetch(`${API_BASE}/me/dashboards/tenant-default`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(sanitize(draft)),
      });
      if (!res.ok) {
        setLocalError(
          new Error(
            res.status === 404
              ? "Setting a tenant default isn't available yet in this environment."
              : `Could not set tenant default (${res.status}).`,
          ),
        );
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [draft, sanitize]);

  // ── grid edit callbacks (operate on the working copy) ─────────────────────
  const onLayoutChange = React.useCallback(
    (
      _flat: ReadonlyArray<{ i: string; x: number; y: number; w: number; h: number }>,
      layouts: DashboardDocument["layouts"],
    ) => {
      // Only sync while editing; the grid is static in view mode so this never
      // fires there, but guard anyway.
      setDraft((prev) => (prev ? { ...prev, layouts } : prev));
    },
    [],
  );

  const onRemove = React.useCallback((instanceId: string) => {
    setDraft((prev) => (prev ? removeWidget(prev, instanceId) : prev));
    setSettingsFor((cur) => (cur === instanceId ? null : cur));
  }, []);

  const onAddDoc = React.useCallback((next: DashboardDocument) => {
    setDraft(next);
    setPaletteOpen(false);
  }, []);

  const onApplySettings = React.useCallback((result: WidgetSettingsResult) => {
    setDraft((prev) => (prev ? applySettings(prev, result) : prev));
    setSettingsFor(null);
  }, []);

  // renderWidget delegates each cell to <WidgetFrame>. In edit mode it also wires
  // the per-widget remove + settings affordances (the frame renders them in its
  // header-right slot and turns the header into the drag handle). An unregistered
  // widget type is dropped (honest - never render an unbound cell).
  const renderWidget: WidgetRenderFn = React.useCallback(
    (widget: DashboardWidget, ctx) => {
      const entry = getCatalogEntry(widget.type);
      if (!entry) return null;

      return (
        <WidgetFrame
          instanceId={widget.instanceId}
          type={widget.type}
          title={widget.title ?? entry.label}
          icon={entry.icon}
          dataSourceKey={widget.dataSourceKey}
          viz={widget.viz}
          config={widget.config}
          globalFilters={activeDoc.globalFilters}
          breakpoint={ctx.breakpoint}
          bodyLoader={entry.bodyLoader}
          isEditing={ctx.isEditing}
          onRemove={ctx.isEditing ? () => onRemove(widget.instanceId) : undefined}
          onSettings={ctx.isEditing ? () => setSettingsFor(widget.instanceId) : undefined}
        />
      );
    },
    [activeDoc.globalFilters, onRemove],
  );

  // The widget currently being configured (for the settings form).
  const settingsWidget = settingsFor
    ? activeDoc.widgets.find((w) => w.instanceId === settingsFor) ?? null
    : null;

  return (
    <div>
      <Greeting
        title={`${greetingFor()}, ${firstName(user)}`}
        sub="Everything happening across your hiring operation, in real time."
      >
        <a href="/candidates"><Btn variant="soft" icon="users">Candidates</Btn></a>
        <a href="/requisitions/new"><Btn variant="primary" icon="briefcase">New requisition</Btn></a>
      </Greeting>

      {/* Edit toolbar (Customize toggle / Save / Cancel / Reset + LiveStatus). */}
      <DashboardToolbar
        isEditing={isEditing}
        onEdit={enterEdit}
        onSave={doSave}
        onCancel={cancelEdit}
        onReset={doReset}
        onTogglePalette={() => setPaletteOpen((o) => !o)}
        paletteOpen={paletteOpen}
        onSetTenantDefault={isAdmin ? setTenantDefault : undefined}
        saving={saving}
        dirty={dirty}
        source={source}
        updatedAt={updatedAt}
        error={localError ?? saveError}
      />

      {/* Add-widget palette (edit mode only). */}
      {isEditing && paletteOpen && (
        <WidgetPalette
          document={activeDoc}
          role={user?.role}
          plan={user?.tenant?.plan}
          enabledKeys={enabledKeys}
          onAdd={onAddDoc}
          onClose={() => setPaletteOpen(false)}
        />
      )}

      {/* Per-widget settings form (edit mode only). */}
      {isEditing && settingsWidget && (
        <WidgetSettings
          widget={settingsWidget}
          size={sizeOf(activeDoc, settingsWidget.instanceId)}
          onApply={onApplySettings}
          onClose={() => setSettingsFor(null)}
        />
      )}

      {/* The engine renders the active (working in edit mode, else resolved)
          document. isEditing unlocks drag/resize in WidgetGrid. */}
      <WidgetGrid
        document={activeDoc}
        isEditing={isEditing}
        onLayoutChange={onLayoutChange}
        renderWidget={renderWidget}
      />
    </div>
  );
}
