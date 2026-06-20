/**
 * @cdc-ats/embed-sdk — the postMessage protocol shared between the embedded
 * widget (running inside the CDC ATS iframe at `${host}/embed/<module>/<token>`)
 * and this host-side SDK (running on the customer's page).
 *
 * Two design rules govern everything here:
 *
 *   1. The protocol is NAMESPACED + VERSIONED. Every message carries the
 *      constant `source: "cdc-ats-embed"` and `v: PROTOCOL_VERSION`. The host
 *      SDK ignores any message whose source/version does not match, so unrelated
 *      postMessage traffic on the page (analytics SDKs, other widgets, browser
 *      extensions) can never be mistaken for a widget message.
 *
 *   2. It is STRICTLY ORIGIN-CHECKED. The SDK only ever accepts a message whose
 *      `event.origin` exactly equals the host origin it minted the iframe for,
 *      and it only ever postMessages TO that exact origin (never "*"). A widget
 *      cannot be spoofed by a frame on a different origin, and a token can never
 *      be posted to a wildcard target where another origin could read it.
 */

/** Discriminator stamped on every message in BOTH directions. */
export const EMBED_MESSAGE_SOURCE = "cdc-ats-embed" as const;

/** Protocol version. Bumped only on a breaking message-shape change. */
export const PROTOCOL_VERSION = 1 as const;

/** Messages the embedded widget sends OUT to the host SDK. */
export type WidgetOutboundType =
  /** Widget has loaded and is ready to receive the init handshake. */
  | "ready"
  /** Content height changed — host should resize the iframe to match. */
  | "resize"
  /** The short-lived embed token is near/at expiry; host must supply a fresh one. */
  | "token-refresh-request"
  /** User navigated inside the widget (host may mirror to its own URL/router). */
  | "navigate"
  /** An error occurred inside the widget (surfaced to the host onError callback). */
  | "error";

/** Messages the host SDK sends IN to the embedded widget. */
export type HostInboundType =
  /** Handshake: locked module/resource context + theme + customCSS. */
  | "init"
  /** A freshly minted token in response to token-refresh-request. */
  | "token-refresh"
  /** Push an updated theme/customCSS without remounting. */
  | "theme";

/** Theme passthrough applied to the widget's cd-tokens layer (var overrides). */
export interface EmbedTheme {
  /**
   * Brand hex (e.g. "#5B8C5A"). The widget feeds this through the same Aurora
   * brand-ramp the logged-in app uses, so --brand/--brand-2/... resolve to the
   * host's color inside the embedded .cd-scope.
   */
  brandPrimaryColor?: string;
  /** Force the widget color mode; omit to follow the widget's own default. */
  colorMode?: "light" | "dark";
  /**
   * Logo URL shown in widgets that have chrome. Must be an absolute https URL;
   * the widget validates it and ignores anything else.
   */
  logoUrl?: string;
}

/** Envelope every host->widget message is wrapped in. */
export interface HostInboundMessage {
  source: typeof EMBED_MESSAGE_SOURCE;
  v: typeof PROTOCOL_VERSION;
  type: HostInboundType;
  /** Correlates a token-refresh reply with its request. */
  requestId?: string;
  /** init payload (type === "init"). */
  init?: {
    module: string;
    resourceId: string;
    params: Record<string, unknown>;
    theme?: EmbedTheme;
    /** Raw CSS string injected into the widget's cd-tokens layer. */
    customCSS?: string;
  };
  /** Fresh token (type === "token-refresh"). */
  token?: string;
  /** New theme/customCSS (type === "theme"). */
  theme?: EmbedTheme;
  customCSS?: string;
}

/** Envelope every widget->host message arrives in. */
export interface WidgetOutboundMessage {
  source: typeof EMBED_MESSAGE_SOURCE;
  v: typeof PROTOCOL_VERSION;
  type: WidgetOutboundType;
  /** resize: the content height in CSS pixels. */
  height?: number;
  /** token-refresh-request: echoed back on the token-refresh reply. */
  requestId?: string;
  /** navigate: the in-widget path/route the user moved to. */
  path?: string;
  /** error: a human-readable message describing the failure. */
  message?: string;
}

/**
 * Type guard: is this an inbound message from a CDC ATS widget? Checks the
 * namespace + version + that `type` is a known widget-outbound type. Origin is
 * checked separately by the caller (it has the trusted host origin to compare).
 */
export function isWidgetMessage(data: unknown): data is WidgetOutboundMessage {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (d["source"] !== EMBED_MESSAGE_SOURCE) return false;
  if (d["v"] !== PROTOCOL_VERSION) return false;
  const t = d["type"];
  return (
    t === "ready" ||
    t === "resize" ||
    t === "token-refresh-request" ||
    t === "navigate" ||
    t === "error"
  );
}
