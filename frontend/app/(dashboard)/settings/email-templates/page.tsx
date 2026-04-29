"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Mail, Eye, Pencil, Loader2 } from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  html: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
  {
    id: "candidateInvite",
    name: "Candidate Invite",
    description: "Sent to candidates when they are invited for an interview",
    subject: "Interview Invitation -- {interviewDate}",
    html: `<h2>Interview Invitation</h2>
<p>Dear {candidateName},</p>
<p>You have been invited for an interview on <strong>{interviewDate}</strong>.</p>
<p><a href="{link}">Click here to confirm your availability</a></p>
<p>Best regards,<br/>The Hiring Team</p>`,
  },
  {
    id: "offerLetter",
    name: "Offer Letter",
    description: "Sent to candidates when an offer is extended",
    subject: "Offer Letter -- {role}",
    html: `<h2>Congratulations!</h2>
<p>Dear {candidateName},</p>
<p>We are pleased to offer you the position of <strong>{role}</strong>.</p>
<p><a href="{link}">Click here to view and accept your offer</a></p>
<p>Best regards,<br/>The Hiring Team</p>`,
  },
  {
    id: "applicationReceived",
    name: "Application Received",
    description: "Confirmation sent when a candidate submits an application",
    subject: "Application Received -- {role}",
    html: `<h2>Application Received</h2>
<p>Dear {candidateName},</p>
<p>Thank you for applying for the <strong>{role}</strong> position.</p>
<p>We will review your application and get back to you soon.</p>
<p>Best regards,<br/>The Hiring Team</p>`,
  },
  {
    id: "interviewReminder",
    name: "Interview Reminder",
    description: "Sent to candidates as a reminder before their interview",
    subject: "Interview Reminder -- {interviewDate}",
    html: `<h2>Interview Reminder</h2>
<p>Dear {candidateName},</p>
<p>This is a reminder of your interview on <strong>{interviewDate}</strong>.</p>
<p>Location: {location}</p>
<p>Best regards,<br/>The Hiring Team</p>`,
  },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(DEFAULT_TEMPLATES);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [editHtml, setEditHtml] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [saving, setSaving] = useState(false);

  function handleEdit(template: EmailTemplate) {
    setEditingTemplate(template);
    setEditHtml(template.html);
    setEditSubject(template.subject);
  }

  async function handleSave() {
    if (!editingTemplate) return;
    setSaving(true);
    // Simulate save -- future: persist to DB via API
    await new Promise((r) => setTimeout(r, 500));
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === editingTemplate.id
          ? { ...t, html: editHtml, subject: editSubject }
          : t
      )
    );
    setSaving(false);
    setEditingTemplate(null);
    toast.success("Template saved. Note: custom template persistence requires database migration (future work).");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Templates"
        description="Customize the email templates used for candidate communication"
        breadcrumbs={[
          { label: "Settings", href: "/settings" },
          { label: "Email Templates" },
        ]}
      />

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Template: {editingTemplate?.name}</DialogTitle>
            <DialogDescription>
              Modify the HTML content below. Use placeholders like{" "}
              {"{candidateName}"}, {"{role}"}, {"{link}"} for dynamic values.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="tpl-subject">Subject Line</Label>
              <input
                id="tpl-subject"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tpl-html">HTML Content</Label>
              <Textarea
                id="tpl-html"
                value={editHtml}
                onChange={(e) => setEditHtml(e.target.value)}
                rows={12}
                className="font-mono text-xs"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTemplate(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
            <DialogDescription>
              Subject: {previewTemplate?.subject}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 bg-white">
            <div
              dangerouslySetInnerHTML={{
                __html: previewTemplate?.html || "",
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPreviewTemplate(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {template.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {template.id}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {template.description}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">
                <span className="font-medium">Subject:</span>{" "}
                {template.subject}
              </p>
              <div className="border rounded p-2 bg-muted/30 max-h-24 overflow-hidden text-xs text-muted-foreground font-mono mb-3">
                {template.html.slice(0, 200)}...
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
