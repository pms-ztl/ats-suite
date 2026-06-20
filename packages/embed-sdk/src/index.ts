/**
 * @cdc-ats/embed-sdk — public entry point.
 *
 * A tiny, dependency-free browser SDK that lets a HOST application embed CDC ATS
 * modules as scoped, token-authorized iframes. Usage:
 *
 *   import { ATS } from "@cdc-ats/embed-sdk";
 *
 *   const ats = ATS.init({
 *     host: "https://app.cdc-ats.com",
 *     // getToken proxies POST /api/embed/token on the HOST's backend, so the
 *     // CDC ATS auth session cookie never leaves the host's own origin.
 *     getToken: ({ module, resourceId, params }) =>
 *       fetch("/my-backend/embed-token", {
 *         method: "POST",
 *         headers: { "content-type": "application/json" },
 *         body: JSON.stringify({ module, resourceId, params }),
 *       }).then((r) => r.json()).then((d) => d.token),
 *   });
 *
 *   const board = ats.PipelineBoard({ requisitionId: "req_123" }).render("#board");
 *   // later
 *   board.setTheme({ brandPrimaryColor: "#5B8C5A", colorMode: "dark" });
 *   board.destroy();
 *
 * The module keys used here ("pipeline-board", "screening", "viz", "apply") are
 * the embed surface routes the gateway/frontend serve under /embed/<module>/...
 * Each helper bakes the locked resource id + params into the token REQUEST; the
 * gateway re-resolves and locks them server-side at mint time, so a host can
 * never widen its own scope by editing the iframe URL.
 */
import {
  createController,
  resolveHostOrigin,
  type EmbedHandle,
  type GetTokenFn,
  type MountController,
  type MountOptions,
} from "./mount.js";

export type {
  EmbedHandle,
  GetTokenFn,
  MountController,
  MountOptions,
} from "./mount.js";
export { IFRAME_SANDBOX } from "./mount.js";
export type { MountCallbacks } from "./mount.js";
export type {
  EmbedTheme,
  HostInboundMessage,
  WidgetOutboundMessage,
  HostInboundType,
  WidgetOutboundType,
} from "./protocol.js";
export { EMBED_MESSAGE_SOURCE, PROTOCOL_VERSION } from "./protocol.js";

/** Module keys exposed by the embed surface. Kept in sync with /embed/<module>. */
export const EMBED_MODULES = {
  pipelineBoard: "pipeline-board",
  screening: "screening",
  viz: "viz",
  apply: "apply",
} as const;

/** Config for `ATS.init`. */
export interface AtsInitConfig {
  /** The CDC ATS app origin to frame, e.g. "https://app.cdc-ats.com". */
  host: string;
  /**
   * Host callback that returns a short-lived embed token. It should call the
   * host's OWN backend, which proxies POST /api/embed/token with the host user's
   * CDC ATS session. Called on first render and on every token-refresh-request.
   */
  getToken: GetTokenFn;
}

/** A configured SDK instance with one helper per embeddable module. */
export interface AtsInstance {
  /** Resolved clean host origin used for all framing + origin checks. */
  readonly host: string;
  /** Embed the candidate pipeline board for one requisition. */
  PipelineBoard(args: { requisitionId: string } & MountOptions): MountController;
  /** Embed the AI screening results view for one requisition. */
  Screening(args: { requisitionId: string } & MountOptions): MountController;
  /**
   * Embed a single analytics/house visualization. `model` selects which viz
   * (e.g. "funnel-conversion"); `resourceId` defaults to the model when omitted.
   */
  Viz(args: { model: string; resourceId?: string } & MountOptions): MountController;
  /** Embed the public application form for one requisition/job. */
  Apply(args: { requisitionId: string } & MountOptions): MountController;
}

/** Split MountOptions out of a per-helper args object. */
function splitOptions<T extends MountOptions>(args: T): MountOptions {
  return {
    theme: args.theme,
    customCSS: args.customCSS,
    onReady: args.onReady,
    onResize: args.onResize,
    onNavigate: args.onNavigate,
    onError: args.onError,
  };
}

/**
 * Initialize the SDK against a host. Resolves + validates the host origin once
 * (throws on a malformed/non-https/wildcard host) and returns an instance whose
 * helpers are bound to that origin and the supplied getToken callback.
 */
function init(config: AtsInitConfig): AtsInstance {
  if (!config || typeof config !== "object") {
    throw new Error("[cdc-ats embed] init(config) requires a config object");
  }
  if (typeof config.getToken !== "function") {
    throw new Error("[cdc-ats embed] init requires a getToken function");
  }
  const hostOrigin = resolveHostOrigin(config.host);
  const getToken = config.getToken;

  const make = (
    module: string,
    resourceId: string,
    params: Record<string, unknown>,
    options: MountOptions,
  ): MountController =>
    createController({ hostOrigin, getToken, module, resourceId, params, options });

  return {
    host: hostOrigin,
    PipelineBoard(args) {
      return make(
        EMBED_MODULES.pipelineBoard,
        args.requisitionId,
        { requisitionId: args.requisitionId },
        splitOptions(args),
      );
    },
    Screening(args) {
      return make(
        EMBED_MODULES.screening,
        args.requisitionId,
        { requisitionId: args.requisitionId },
        splitOptions(args),
      );
    },
    Viz(args) {
      const resourceId = args.resourceId ?? args.model;
      return make(
        EMBED_MODULES.viz,
        resourceId,
        { model: args.model },
        splitOptions(args),
      );
    },
    Apply(args) {
      return make(
        EMBED_MODULES.apply,
        args.requisitionId,
        { requisitionId: args.requisitionId },
        splitOptions(args),
      );
    },
  };
}

/** The single public namespace, mirroring `ATS.init(...)` from the docs. */
export const ATS = { init } as const;

export default ATS;
