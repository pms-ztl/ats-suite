// Module F — pluggable KYC / bank-verification provider.
//
// The brief asks for PAN + HDFC/bank verification (Workday-style). Real
// verification requires a paid, India-specific KYC provider (Signzy, Karza,
// Cashfree, Razorpay, …) whose credentials are environment-gated. Per the agreed
// "framework + honest stubs" decision, the DEFAULT provider is a STUB that
// validates the SHAPE of the input and records an honest NEEDS_PROVIDER state —
// it NEVER fabricates a "verified" result. Wiring a real provider is a matter of
// implementing this interface and selecting it via KYC_PROVIDER.

import type { VerificationType } from "@cdc-ats/contracts";

export interface KycCheckInput {
  type: VerificationType;
  // PAN check
  pan?: string;
  nameOnPan?: string;
  // Bank check
  accountNumber?: string;
  ifsc?: string;
  accountHolder?: string;
}

export interface KycCheckResult {
  status: "VERIFIED" | "PENDING" | "FAILED" | "NEEDS_PROVIDER";
  provider: string;
  providerRef: string | null;
  maskedValue: string | null;
  message: string;
}

export interface KycProvider {
  readonly name: string;
  verify(input: KycCheckInput): Promise<KycCheckResult>;
}

function mask(value: string | undefined): string | null {
  if (!value) return null;
  const v = value.replace(/\s+/g, "");
  if (v.length <= 4) return v;
  return `•••• ${v.slice(-4)}`;
}

// STUB provider — shape-validates and returns an honest NEEDS_PROVIDER. The
// candidate's submission is recorded so a real provider can re-check later, but
// the case stays BLOCKED on this verification until a provider confirms it.
class StubKycProvider implements KycProvider {
  readonly name = "stub";
  async verify(input: KycCheckInput): Promise<KycCheckResult> {
    const masked = input.type === "PAN" ? mask(input.pan) : mask(input.accountNumber);
    return {
      status: "NEEDS_PROVIDER",
      provider: this.name,
      providerRef: null,
      maskedValue: masked,
      message:
        "Recorded. Automated verification needs a KYC provider API key " +
        "(set KYC_PROVIDER + credentials). Until then this is pending manual review — no result is fabricated.",
    };
  }
}

// Provider registry. Add real adapters here keyed by KYC_PROVIDER. They remain
// inert (never selected) unless their credentials are present, so the default
// build is honest by construction.
const PROVIDERS: Record<string, () => KycProvider> = {
  stub: () => new StubKycProvider(),
  // signzy: () => new SignzyProvider(...),  // implement KycProvider behind creds
};

export function getKycProvider(): KycProvider {
  const key = (process.env["KYC_PROVIDER"] ?? "stub").toLowerCase();
  const factory = PROVIDERS[key] ?? PROVIDERS["stub"]!;
  return factory();
}
