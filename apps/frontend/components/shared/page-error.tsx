"use client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function PageError({ message = "Failed to load data.", onRetry }: PageErrorProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center min-h-[300px] gap-4 text-center p-8">
      <div className="h-12 w-12 rounded-full bg-danger-tint flex items-center justify-center">
        <AlertTriangle className="h-6 w-6 text-danger" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">Something went wrong</h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
      )}
    </div>
  );
}
