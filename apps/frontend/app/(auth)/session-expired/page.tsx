"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/auth-shell";

export default function SessionExpiredPage() {
  return (
    <AuthShell>
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-6">
          <div className="flex items-center gap-3 self-start">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">C</div>
            <div className="text-left">
              <div className="font-bold text-lg">CDC ATS</div>
              <div className="text-xs text-muted-foreground">AI-Powered Hiring</div>
            </div>
          </div>
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Session Expired</h1>
            <p className="text-sm text-muted-foreground">
              Your session has expired for security reasons. Please sign in again.
            </p>
          </div>
          <Button asChild className="w-full max-w-xs">
            <Link href="/login">Sign In Again</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
