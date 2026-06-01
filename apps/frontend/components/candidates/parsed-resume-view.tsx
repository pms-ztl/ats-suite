"use client";

/**
 * Phase 37k, ParsedResumeView component.
 *
 * Renders the rich Phase 37 parsedSummary on the candidate detail page.
 *
 * Sections (only rendered when data exists):
 *   1. Top summary chips (total YOE, # companies, avg tenure, format)
 *   2. Honesty flags banner (medium/high severity only)
 *   3. Skills grid, chips with depth + recency + confidence badges
 *   4. Experience timeline, company + title + tenure, achievements decomposed
 *      with metric/change badges
 *   5. Education
 *   6. Languages + certifications
 *   7. GitHub corroboration card (confirmed / discrepancies)
 *
 * Confidence < 0.5 = low-confidence yellow badge.
 * Honesty flags + GitHub discrepancies severity = high → red, medium → amber.
 */
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Building2, GraduationCap, Globe, Award, GitBranch, ExternalLink, Sparkles, ShieldQuestion, Star } from "lucide-react";

// Loose types, the backend may add fields the UI doesn't render yet.
interface AnyMap { [k: string]: any }

interface Props {
  parsedSummary: AnyMap;
  fairnessMode?: boolean;
}

const lowConfidence = (conf?: number) => typeof conf === "number" && conf < 0.5;

function ConfidenceBadge({ conf }: { conf?: number }) {
  if (!lowConfidence(conf)) return null;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center ml-1 text-amber-600 dark:text-amber-400">
            <ShieldQuestion className="h-3 w-3" />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Low confidence ({(conf! * 100).toFixed(0)}%), verify in interview</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Field({ label, value, conf, mono }: { label: string; value: any; conf?: number; mono?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-baseline gap-2 text-xs">
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className={mono ? "font-mono" : ""}>{String(value)}</span>
      <ConfidenceBadge conf={conf} />
    </div>
  );
}

// Skill chip, color by depth, recency dot, confidence indicator
function SkillChip({ skill }: { skill: AnyMap }) {
  const depthColor =
    skill.depth === "lead"      ? "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30"
    : skill.depth === "used"    ? "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                                : "bg-muted text-muted-foreground border-border";
  const yearsActive = typeof skill.yearsActive === "number" ? skill.yearsActive : null;
  const recentEnough = skill.lastUsedYear && skill.lastUsedYear >= new Date().getFullYear() - 2;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`text-2xs gap-1 ${depthColor}`}>
            {skill.label ?? skill.raw}
            {yearsActive && yearsActive > 0 ? (
              <span className="opacity-70">· {yearsActive}y</span>
            ) : null}
            {recentEnough ? <Star className="h-2.5 w-2.5 fill-current" /> : null}
            <ConfidenceBadge conf={skill.confidence} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="text-xs space-y-0.5">
            <p><strong>{skill.label ?? skill.raw}</strong> {skill.category ? <span className="opacity-70">({skill.category})</span> : null}</p>
            {skill.depth && <p>Depth: {skill.depth === "lead" ? "Led work using it" : skill.depth === "used" ? "Hands-on use" : "Mentioned"}</p>}
            {yearsActive && yearsActive > 0 && <p>{yearsActive} years active</p>}
            {skill.lastUsedYear && <p>Last used: {skill.lastUsedYear}</p>}
            {skill.canonicalId ? null : <p className="text-amber-500">Not in skill taxonomy</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Achievement chip, shows metric + change visually
function AchievementBadge({ achievement }: { achievement: AnyMap }) {
  const hasMetric = achievement.metric && achievement.changeValue !== null && achievement.changeValue !== undefined;
  if (!hasMetric) return null;
  const positive = achievement.changeValue > 0;
  return (
    <Badge variant="outline" className={`text-2xs gap-1 ${
      positive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
    }`}>
      {positive ? "+" : ""}{achievement.changeValue}{achievement.changeUnit ?? ""} {achievement.metric}
    </Badge>
  );
}

export function ParsedResumeView({ parsedSummary, fairnessMode = false }: Props) {
  const data = parsedSummary;

  // Defensive guards, the backend shape evolved
  const skills = useMemo<AnyMap[]>(() => Array.isArray(data.skills) ? data.skills : [], [data.skills]);
  const experience = useMemo<AnyMap[]>(() => Array.isArray(data.experience) ? data.experience : [], [data.experience]);
  const education = useMemo<AnyMap[]>(() => Array.isArray(data.education) ? data.education : [], [data.education]);
  const langs = useMemo<AnyMap[]>(() => Array.isArray(data.languages) ? data.languages : [], [data.languages]);
  const certs = useMemo<AnyMap[]>(() => Array.isArray(data.certifications) ? data.certifications : [], [data.certifications]);
  const honestyFlags = useMemo<AnyMap[]>(() => Array.isArray(data.honestyFlags) ? data.honestyFlags : [], [data.honestyFlags]);
  const ghCorro = (data as AnyMap).githubCorroboration as AnyMap | undefined;
  const formatGuess = data.formatGuess as string | undefined;

  // Honesty flags worth surfacing
  const seriousFlags = honestyFlags.filter((f) => f.severity === "high" || f.severity === "medium");

  if (skills.length === 0 && experience.length === 0 && education.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No parsed resume data yet. Upload a resume to populate this view.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top summary chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        {typeof data.totalYearsExperience === "number" && (
          <Badge variant="outline" className="text-2xs">{data.totalYearsExperience}y total experience</Badge>
        )}
        {typeof data.uniqueCompanies === "number" && data.uniqueCompanies > 0 && (
          <Badge variant="outline" className="text-2xs">{data.uniqueCompanies} companies</Badge>
        )}
        {typeof data.averageTenureMonths === "number" && data.averageTenureMonths > 0 && (
          <Badge variant="outline" className="text-2xs">avg tenure {Math.round(data.averageTenureMonths / 12 * 10) / 10}y</Badge>
        )}
        {formatGuess && formatGuess !== "other" && (
          <Badge variant="outline" className="text-2xs uppercase">{formatGuess.replace(/_/g, " ")}</Badge>
        )}
        {fairnessMode && <Badge variant="outline" className="text-2xs bg-amber-500/15 text-amber-700 dark:text-amber-300">Fairness mode</Badge>}
        {data.verification && typeof data.verification.trustScore === "number" && (
          <Badge
            variant="outline"
            className={`text-2xs ${
              data.verification.trustScore >= 75
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : data.verification.trustScore >= 50
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30"
            }`}
          >
            Trust {data.verification.trustScore}/100
          </Badge>
        )}
      </div>

      {/* Verification & trust (Phase 38, agentic resume-verifier) */}
      {data.verification && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Verification &amp; Trust
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {data.verification.summary && <p className="text-muted-foreground">{data.verification.summary}</p>}
            {Array.isArray(data.verification.redFlags) && data.verification.redFlags.length > 0 && (
              <div className="space-y-1">
                {data.verification.redFlags.map((rf: string, i: number) => (
                  <p key={i} className="flex items-start gap-1 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {rf}
                  </p>
                ))}
              </div>
            )}
            {Array.isArray(data.verification.findings) && data.verification.findings.length > 0 && (
              <div className="space-y-1 pt-1">
                {data.verification.findings.map((f: AnyMap, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className={`text-2xs shrink-0 ${
                        f.status === "corroborated"
                          ? "text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : f.status === "contradicted"
                            ? "text-rose-700 dark:text-rose-300 border-rose-500/30"
                            : "text-amber-700 dark:text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {f.status}
                    </Badge>
                    <span><span className="font-medium">{f.claim}</span>{f.evidence ? `, ${f.evidence}` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Honesty flags */}
      {seriousFlags.length > 0 && !fairnessMode && (
        <Card className="border-amber-300 bg-amber-50/60 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /> Worth verifying in interview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {seriousFlags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Badge variant="outline" className="text-2xs shrink-0 mt-0.5">{f.severity}</Badge>
                <div>
                  <span className="font-medium">{f.field}</span>: <span className="text-muted-foreground">{f.reason}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              Skills ({skills.length})
              {skills.some((s) => lowConfidence(s.confidence)) && (
                <span className="text-2xs text-amber-600 ml-auto">some low-confidence</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, i) => <SkillChip key={i} skill={s} />)}
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-2xs text-muted-foreground">
              <span><Star className="h-2.5 w-2.5 fill-current inline" /> used last 2 years</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-violet-500 mr-1" />lead</span>
              <span><span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1" />hands-on</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {experience.map((e, i) => {
              const raw = e.raw ?? e;
              const months = e.tenureMonths ?? 0;
              const startDate = e.startDate?.iso ?? raw.startDate;
              const endDate = e.endDate?.iso ?? raw.endDate;
              return (
                <div key={i} className="border-l-2 border-border pl-3 space-y-1">
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-medium text-sm">{raw.title}</p>
                      <p className="text-xs text-muted-foreground">{e.companyLabel ?? raw.company}</p>
                    </div>
                    <span className="text-2xs text-muted-foreground">
                      {startDate ?? "?"} → {endDate ?? "present"}
                      {months > 0 ? ` · ${Math.round(months / 12 * 10) / 10}y` : ""}
                    </span>
                  </div>
                  {(raw.achievements ?? []).length > 0 && (
                    <div className="space-y-1 mt-2">
                      {raw.achievements.map((a: AnyMap, j: number) => (
                        <div key={j} className="text-xs flex items-start gap-2">
                          <span className="text-muted-foreground shrink-0">·</span>
                          <div className="flex-1 min-w-0">
                            <p>{a.raw}</p>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              <AchievementBadge achievement={a} />
                              {a.attribution && a.attribution !== "ambiguous" && (
                                <Badge variant="outline" className="text-2xs">{a.attribution.replace("_", " ")}</Badge>
                              )}
                              {(a.technologies ?? []).slice(0, 5).map((t: string, k: number) => (
                                <Badge key={k} variant="outline" className="text-2xs">{t}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {education.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {education.map((ed, i) => {
              const raw = ed.raw ?? ed;
              return (
                <div key={i} className="text-xs space-y-0.5">
                  <p className="font-medium">{raw.degree}{raw.field ? ` in ${raw.field}` : ""}</p>
                  <p className="text-muted-foreground">
                    {ed.schoolLabel ?? raw.school}
                    {raw.gpa ? <span className="ml-2">· GPA {raw.gpa}</span> : ""}
                  </p>
                  {raw.honors && raw.honors.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {raw.honors.map((h: string, j: number) => (
                        <Badge key={j} variant="outline" className="text-2xs">{h}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Languages + Certs */}
      {(langs.length > 0 || certs.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {langs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Languages</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {langs.map((l, i) => (
                  <Badge key={i} variant="outline" className="text-2xs">
                    {l.language}{l.proficiency ? <span className="ml-1 opacity-70">· {l.proficiency}</span> : ""}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
          {certs.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Award className="h-4 w-4" /> Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {certs.map((c, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-medium">{c.name}</span>
                    {c.issuer && <span className="text-muted-foreground"> · {c.issuer}</span>}
                    {c.issuedYear && <span className="text-muted-foreground"> ({c.issuedYear})</span>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* GitHub corroboration */}
      {ghCorro && !fairnessMode && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><GitBranch className="h-4 w-4" /> GitHub corroboration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-2xs">
                Public signal: {ghCorro.publicSignal?.overallStrength ?? "unknown"}
              </Badge>
              {ghCorro.publicSignal?.accountAgeYears && (
                <Badge variant="outline" className="text-2xs">Account {ghCorro.publicSignal.accountAgeYears}y old</Badge>
              )}
              {(ghCorro.publicSignal?.primaryLanguages ?? []).slice(0, 5).map((l: string, i: number) => (
                <Badge key={i} variant="outline" className="text-2xs">{l}</Badge>
              ))}
            </div>
            {(ghCorro.confirmed ?? []).length > 0 && (
              <div>
                <p className="font-medium text-emerald-600 mb-1">Confirmed</p>
                <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                  {ghCorro.confirmed.map((c: AnyMap, i: number) => (
                    <li key={i}><span className="text-foreground">{c.claim}</span>, {c.evidence}</li>
                  ))}
                </ul>
              </div>
            )}
            {(ghCorro.discrepancies ?? []).length > 0 && (
              <div>
                <p className="font-medium text-amber-600 mb-1">Discrepancies</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {ghCorro.discrepancies.map((d: AnyMap, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Badge variant="outline" className="text-2xs shrink-0">{d.severity}</Badge>
                      <div><span className="text-foreground">{d.claim}</span>, <span className="text-muted-foreground">{d.discrepancy}</span></div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
