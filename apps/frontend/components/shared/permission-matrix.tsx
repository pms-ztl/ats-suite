import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";

interface PermissionMatrixProps {
  roles: string[];
  resources: string[];
  permissions: Record<string, Record<string, "full" | "read" | "none">>;
  className?: string;
}

export function PermissionMatrix({ roles, resources, permissions, className }: PermissionMatrixProps) {
  const cellIcon = (level: "full" | "read" | "none") => {
    if (level === "full") return <Check className="h-4 w-4 text-ok" />;
    if (level === "read") return <Minus className="h-4 w-4 text-warn" />;
    return <X className="h-4 w-4 text-ink-3" />;
  };

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 text-2xs font-semibold text-muted-foreground uppercase">Resource</th>
            {roles.map(role => (
              <th key={role} className="text-center p-2 text-2xs font-semibold text-muted-foreground uppercase">{role}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map(resource => (
            <tr key={resource} className="border-b hover:bg-muted/50">
              <td className="p-2 font-medium">{resource}</td>
              {roles.map(role => (
                <td key={role} className="text-center p-2">
                  {cellIcon(permissions[resource]?.[role] || "none")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
