"use client";
// app/(dashboard)/requisitions/[id]/form-builder/page.tsx, application form builder.
import { useParams } from "next/navigation";
import { Button, Card } from "@/components/aurora";

const FIELDS = [
  ["Full name", "Text", true],
  ["Email", "Email", true],
  ["Résumé", "File upload", true],
  ["Years of experience", "Number", false],
  ["Work authorization", "Select", true],
  ["Why this role?", "Long text", false],
] as const;

export default function FormBuilderPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="mx-auto grid w-full max-w-[1100px] grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div>
        <header className="mb-5 flex items-end justify-between">
          <div><h1 className="text-2xl font-extrabold tracking-tight">Application form</h1><p className="mt-1 text-ink-2">Fields candidates fill for requisition {id}.</p></div>
          <Button variant="primary" size="sm">Save form</Button>
        </header>
        <div className="flex flex-col gap-2">
          {FIELDS.map(([label, type, req]) => (
            <Card key={label} material="flat" className="flex items-center gap-3 rounded-xl border border-line p-3">
              <span className="cursor-grab text-ink-3" aria-hidden="true">::</span>
              <div className="flex-1"><div className="text-sm font-semibold">{label}{req && <span className="ml-1 text-danger">*</span>}</div><div className="text-xs text-ink-3">{type}</div></div>
              <Button variant="ghost" size="sm">Edit</Button>
            </Card>
          ))}
        </div>
      </div>
      <aside className="rounded-xl border border-dashed border-line-strong bg-surface-2 p-4 text-sm text-ink-3">
        Drag a field type here to add it. The requisition's custom screening criteria are appended automatically.
      </aside>
    </div>
  );
}
