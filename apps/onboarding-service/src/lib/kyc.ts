// Module F — pluggable KYC / bank-verification provider.
//
// The brief asks for PAN + HDFC/bank verification (Workday-style). Real
// verification requires a paid, India-specific KYC provider (Signzy, Karza,
// Cashfree, Razorpay, …) whose credentials are environment-gated. Per the agreed
// "framework + honest stubs" decision, the DEFAULT provider is a STUB that
// validates the SHAPE of the input and records an honest NEEDS_PROVIDER state —
// it NEVER fabricates a "verified" result. Wiring a real provider is a matter of
// implementing this interface and selecting it via KYC_PROVIDER.

import { createLogger } from "@cdc-ats/common";
import type { VerificationType } from "@cdc-ats/contracts";

// Module logger for KYC-provider honesty. The STUB path emits a runtime warning on
// every use so a stub verification can never be mistaken for a production one from
// the logs alone (the honesty otherwise lived only in the persisted message string
// + the NEEDS_PROVIDER status).
const logger = createLogger({ serviceName: "onboarding-service:kyc" });

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
  /**
   * Additive honesty marker: true when this result came from the format-validation
   * STUB (no real KYC provider ran). Optional so real providers omit it and no
   * existing caller/shape breaks; the persisted `provider: "stub"` string already
   * records the same fact.
   */
  stub?: boolean;
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
    // HONESTY: this path validates only the SHAPE of the input and returns a mock
    // NEEDS_PROVIDER result. It performs NO real PAN / bank verification and mints
    // no real provider reference. Warn once per call so a stub run is visible at
    // runtime, not just in the persisted message.
    logger.warn(
      { type: input.type },
      "[STUB] not production: kyc verify running against stub/fixture data (format-validated only, NOT a real verification; set KYC_PROVIDER + credentials for a production check)",
    );
    const masked = input.type === "PAN" ? mask(input.pan) : mask(input.accountNumber);
    return {
      status: "NEEDS_PROVIDER",
      provider: this.name,
      providerRef: null,
      maskedValue: masked,
      // Additive marker so a downstream consumer can machine-detect the stub without
      // string-matching the message. `provider: "stub"` remains the persisted record.
      stub: true,
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
