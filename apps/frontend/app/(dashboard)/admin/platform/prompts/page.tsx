"use client";

/**
 * Admin → Platform → Prompts
 *
 * Centralized prompt editor. Super-admin can override the hardcoded system
 * prompt, model, and temperature for any agent, with version history and
 * one-click rollback.
 *
 * Backend: /api/super-admin/platform/prompts
 *
 * UX rules:
 *   - Left rail: agent list with "custom" badge if override exists
 *   - Right pane: editor for the selected agent
 *   - History panel: previous versions with rollback button
 *   - Saving creates a NEW version (never edits in place — auditable)
 *   - Empty fields fall back to the hardcoded defaults (per-field override)
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Brain, History, Loader2, RotateCcw, Save, FileText, Clock, User as UserIcon, GitCompare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LineDiff } from "@/components/diff/line-diff";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string {
  if (typeof document === "undefined") return "";
  return document.cookie.match(/(?:^|;\s*)ats-token=([^;]*)/)?.[1] ?? "";
}

interface OverrideRow {
  id: string;
  agentType: string;
  systemPrompt: string | null;
  modelName: string | null;
  temperature: number | null;
  version: number;
  isActive: boolean;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
}

interface ListItem {
  agentType: string;
  override: OverrideRow | null;
}

const MODEL_PRESETS = [
  "claude-sonnet-4-20250514",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "gpt-4o-2024-11-20",
  "gpt-4o-mini",
];

export default function PlatformPromptsPage() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<ListItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");

  // Editor state
  const [active, setActive] = useState<OverrideRow | null>(null);
  const [history, setHistory] = useState<OverrideRow[]>([]);
  const [editorLoading, setEditorLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [modelName, setModelName] = useState("");
  const [temperature, setTemperature] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [compareWith, setCompareWith] = useState<OverrideRow | null>(null);

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (selectedType) void loadDetail(selectedType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/platform/prompts`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const data = body.data ?? body;
      setList(data.prompts ?? []);
      if (!selectedType && data.prompts?.length > 0) {
        setSelectedType(data.prompts[0].agentType);
      }
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't load prompts");
    } finally {
      setLoading(false);
    }
  }

  async function loadDetail(agentType: string) {
    setEditorLoading(true);
    try {
      const res = await fetch(`${API_BASE}/super-admin/platform/prompts/${encodeURIComponent(agentType)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      const data = body.data ?? body;
      setActive(data.active ?? null);
      setHistory(data.history ?? []);
      const a: OverrideRow | null = data.active ?? null;
      setSystemPrompt(a?.systemPrompt ?? "");
      setModelName(a?.modelName ?? "");
      setTemperature(a?.temperature != null ? String(a.temperature) : "");
      setNotes("");
    } catch (err: any) {
      toast.error(err.message ?? "Couldn't load prompt detail");
    } finally {
      setEditorLoading(false);
    }
  }

  async function save() {
    if (!selectedType) return;
    setSaving(true);
    try {
      const payload: any = { notes: notes || undefined };
      payload.systemPrompt = systemPrompt.trim().length > 0 ? systemPrompt : null;
      payload.modelName = modelName.trim().length > 0 ? modelName : null;
      payload.temperature = temperature.trim().length > 0 ? Number(temperature) : null;

      const res = await fetch(`${API_BASE}/super-admin/platform/prompts/${encodeURIComponent(selectedType)}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message ?? `HTTP ${res.status}`);
      }
      toast.success("Prompt saved. Applies to new agent runs within ~5 min (cache TTL).");
      await Promise.all([load(), loadDetail(selectedType)]);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function rollback(versionId: string) {
    if (!selectedType) return;
    if (!confirm("Roll back to this version? It becomes active immediately and a new entry is added to history.")) return;
    try {
      const res = await fetch(
        `${API_BASE}/super-admin/platform/prompts/${encodeURIComponent(selectedType)}/rollback/${encodeURIComponent(versionId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Rolled back. Active version updated.");
      await Promise.all([load(), loadDetail(selectedType)]);
    } catch (err: any) {
      toast.error(err.message ?? "Rollback failed");
    }
  }

  async function revertToDefault() {
    if (!selectedType) return;
    if (!confirm("Disable all overrides for this agent? It will use the hardcoded default prompt + model.")) return;
    try {
      const res = await fetch(`${API_BASE}/super-admin/platform/prompts/${encodeURIComponent(selectedType)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Reverted to hardcoded defaults.");
      await Promise.all([load(), loadDetail(selectedType)]);
    } catch (err: any) {
      toast.error(err.message ?? "Revert failed");
    }
  }

  const dirty = useMemo(() => {
    if (!active) return systemPrompt !== "" || modelName !== "" || temperature !== "";
    return (
      (active.systemPrompt ?? "") !== systemPrompt ||
      (active.modelName ?? "") !== modelName ||
      String(active.temperature ?? "") !== temperature
    );
  }, [active, systemPrompt, modelName, temperature]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading prompt control plane…
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Link href="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Admin
      </Link>

      <PageHeader
        title="Prompt control plane"
        description="Override the system prompt, model, or temperature for any agent — across every tenant. Versioned with rollback. Cache TTL is 5 minutes."
      />

      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* Left: agent list */}
        <Card className="self-start">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Agents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-0.5">
              {list.map((item) => {
                const isSelected = item.agentType === selectedType;
                return (
                  <button
                    key={item.agentType}
                    type="button"
                    onClick={() => setSelectedType(item.agentType)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-mono text-xs">{item.agentType}</span>
                      {item.override && (
                        <Badge variant="secondary" className="text-[10px] h-4">
                          v{item.override.version}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: editor + history */}
        <div className="space-y-6">
          {selectedType ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="font-mono">{selectedType}</CardTitle>
                      <CardDescription>
                        {active
                          ? `Override active (v${active.version}). Saved ${new Date(active.createdAt).toLocaleString()}.`
                          : "Using hardcoded defaults — no override active. Save below to create a custom version."}
                      </CardDescription>
                    </div>
                    {active && (
                      <Button variant="ghost" size="sm" onClick={revertToDefault} className="text-destructive">
                        <RotateCcw className="w-4 h-4 mr-1.5" />
                        Revert to default
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editorLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="systemPrompt">System prompt</Label>
                        <Textarea
                          id="systemPrompt"
                          rows={12}
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          placeholder="Empty = use the hardcoded prompt baked into the agent."
                          className="font-mono text-xs leading-relaxed"
                        />
                        <p className="text-xs text-muted-foreground">{systemPrompt.length} chars · empty falls back to default</p>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="modelName">Model</Label>
                          <Input
                            id="modelName"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            list="model-presets"
                            placeholder="claude-sonnet-4-20250514"
                          />
                          <datalist id="model-presets">
                            {MODEL_PRESETS.map((m) => (
                              <option key={m} value={m} />
                            ))}
                          </datalist>
                          <p className="text-xs text-muted-foreground">Empty = use agent default</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature (0–2)</Label>
                          <Input
                            id="temperature"
                            type="number"
                            min={0}
                            max={2}
                            step={0.1}
                            value={temperature}
                            onChange={(e) => setTemperature(e.target.value)}
                            placeholder="0.7"
                          />
                          <p className="text-xs text-muted-foreground">Empty = use model default</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Changelog note (optional)</Label>
                        <Input
                          id="notes"
                          maxLength={500}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Why are you saving this version? Tightened the JSON-output instructions."
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center justify-end gap-3">
                <Button onClick={save} disabled={saving || !dirty}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save new version
                </Button>
              </div>

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Version history
                  </CardTitle>
                  <CardDescription>Past overrides. Click rollback to reactivate.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No previous versions.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="text-xs text-muted-foreground border-b">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium">Version</th>
                          <th className="text-left px-4 py-2 font-medium">Saved</th>
                          <th className="text-left px-4 py-2 font-medium">Note</th>
                          <th className="text-right px-4 py-2 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((h) => (
                          <tr key={h.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="px-4 py-2 font-mono text-xs">v{h.version}</td>
                            <td className="px-4 py-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(h.createdAt).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-xs">
                              {h.notes ?? <span className="text-muted-foreground italic">—</span>}
                              {h.createdByUserId && (
                                <span className="ml-2 text-muted-foreground inline-flex items-center gap-1">
                                  <UserIcon className="w-3 h-3" />
                                  {h.createdByUserId.slice(0, 8)}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-right space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setCompareWith(h)}
                                disabled={!active}
                                title={active ? "Compare to active version" : "No active version to compare against"}
                              >
                                <GitCompare className="w-3 h-3 mr-1" />
                                Diff
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => rollback(h.id)}>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Roll back
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Select an agent from the left to edit its prompt.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Diff dialog — compare a historical version to the active one */}
      <Dialog open={!!compareWith} onOpenChange={(o) => !o && setCompareWith(null)}>
        <DialogContent className="max-w-5xl w-[95vw] sm:max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2">
              <GitCompare className="w-5 h-5" />
              Diff: v{compareWith?.version} → v{active?.version} (active)
            </DialogTitle>
            <DialogDescription>
              Showing what changed from the older version on the left to the currently-active version on the right.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto flex-1 space-y-4">
            {compareWith && active && (
              <>
                {/* Settings diff (model + temperature) */}
                <div className="text-xs grid grid-cols-2 gap-3 px-1">
                  <div className="border rounded p-2 space-y-1">
                    <div className="text-muted-foreground">v{compareWith.version}</div>
                    <div>Model: <span className="font-mono">{compareWith.modelName ?? "(default)"}</span></div>
                    <div>Temp: <span className="font-mono">{compareWith.temperature ?? "(default)"}</span></div>
                  </div>
                  <div className="border rounded p-2 space-y-1 bg-primary/5">
                    <div className="text-primary">v{active.version} (active)</div>
                    <div>Model: <span className="font-mono">{active.modelName ?? "(default)"}</span></div>
                    <div>Temp: <span className="font-mono">{active.temperature ?? "(default)"}</span></div>
                  </div>
                </div>
                {/* System prompt diff */}
                <LineDiff
                  oldText={compareWith.systemPrompt ?? ""}
                  newText={active.systemPrompt ?? ""}
                  oldLabel={`v${compareWith.version} · ${new Date(compareWith.createdAt).toLocaleString()}`}
                  newLabel={`v${active.version} (active) · ${new Date(active.createdAt).toLocaleString()}`}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
