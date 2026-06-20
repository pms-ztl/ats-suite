/**
 * @cdc-ats/embed-sdk — the iframe mount controller.
 *
 * A `MountController` is what every per-module helper (PipelineBoard, Screening,
 * Viz, Apply) returns. Calling `.render(target)` injects the iframe; the
 * controller then owns the full lifecycle: the postMessage handshake, strict
 * origin-checked message handling (height-autoresize, token-refresh, nav, error),
 * theme/customCSS push, and teardown.
 *
 * SECURITY POSTURE (all enforced here):
 *   - iframe sandbox = "allow-scripts allow-forms allow-same-origin" and nothing
 *     else. The widget can run its own JS and submit forms (the public Apply
 *     module needs forms), and allow-same-origin lets it reach its OWN backend
 *     under the host origin — but it gets no allow-popups, allow-top-navigation,
 *     allow-modals, or allow-downloads, so a compromised widget cannot break out
 *     of the frame, navigate the host page, or spawn popups.
 *   - The token rides in the iframe URL path (`/embed/<module>/<token>`), exactly
 *     where the gateway's embed-framing layer + extractEmbedToken look for it.
 *   - Inbound messages are accepted ONLY when event.source is THIS iframe's
 *     contentWindow AND event.origin === the resolved host origin AND the
 *     envelope passes isWidgetMessage. Anything else is ignored.
 *   - Outbound messages always target the exact host origin, never "*", so a
 *     token handed back on refresh can never be read by another origin.
 */
import { resolveHostOrigin } from "./origin.js";
import {
  EMBED_MESSAGE_SOURCE,
  PROTOCOL_VERSION,
  isWidgetMessage,
  type EmbedTheme,
  type HostInboundMessage,
  type WidgetOutboundMessage,
} from "./protocol.js";

/** The fixed sandbox attribute applied to every embedded iframe. */
export const IFRAME_SANDBOX = "allow-scripts allow-forms allow-same-origin" as const;

/** Lifecycle + event callbacks a caller can pass per mount. */
export interface MountCallbacks {
  /** Fired once when the widget completes its `ready` handshake. */
  onReady?: () => void;
  /** Fired on every height change (after the iframe is resized). */
  onResize?: (height: number) => void;
  /** Fired when the user navigates inside the widget. */
  onNavigate?: (path: string) => void;
  /** Fired on a widget-reported error or an SDK-side failure. */
  onError?: (message: string) => void;
}

/** Options accepted by the per-module helpers (merged with the locked resource). */
export interface MountOptions extends MountCallbacks {
  /** Theme passthrough into the widget's cd-tokens layer. */
  theme?: EmbedTheme;
  /** Raw CSS injected into the widget's cd-tokens layer. */
  customCSS?: string;
}

/** A live, rendered embed. Returned by `.render()` for theme push + teardown. */
export interface EmbedHandle {
  /** The injected iframe element (read-only convenience). */
  readonly iframe: HTMLIFrameElement;
  /** Push an updated theme/customCSS without remounting. */
  setTheme(theme: EmbedTheme, customCSS?: string): void;
  /** Remove the iframe + all listeners. Idempotent. */
  destroy(): void;
}

/** What a module helper holds before render: the resolved target URL + context. */
export interface MountController {
  /** Render the iframe into `target` (a CSS selector or an Element). */
  render(target: string | Element): EmbedHandle;
}

/** Internal config the SDK threads into every controller. */
export interface MountContext {
  /** Resolved, clean host origin (https, no wildcard). */
  hostOrigin: string;
  /** Host callback that fetches a fresh short-lived embed token. */
  getToken: GetTokenFn;
  /** Module key (e.g. "pipeline-board"). Used in the URL + init payload. */
  module: string;
  /** Locked resource id baked into the token request. */
  resourceId: string;
  /** Locked params baked into the token request. */
  params: Record<string, unknown>;
  /** Per-mount options (theme, customCSS, callbacks). */
  options: MountOptions;
}

/**
 * Host-supplied token fetcher. The host's backend proxies POST /api/embed/token
 * (so the auth session cookie never leaves the host's own origin); this callback
 * returns the minted token string. It is called on first render AND on every
 * token-refresh-request from the widget.
 */
export type GetTokenFn = (req: {
  module: string;
  resourceId: string;
  params: Record<string, unknown>;
}) => Promise<string> | string;

/** Resolve a selector-or-Element target into a concrete Element (or throw). */
function resolveTarget(target: string | Element): Element {
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) throw new Error(`[cdc-ats embed] no element matches selector "${target}"`);
    return el;
  }
  if (target instanceof Element) return target;
  throw new Error("[cdc-ats embed] render target must be a CSS selector or an Element");
}

/** Build the iframe src: `${hostOrigin}/embed/<module>/<token>`. */
function buildSrc(hostOrigin: string, module: string, token: string): string {
  return `${hostOrigin}/embed/${encodeURIComponent(module)}/${encodeURIComponent(token)}`;
}

/**
 * Create a MountController for one module/resource. The token is fetched lazily
 * on render (not at construction) so a helper can be built and rendered later,
 * and so each render gets a fresh token.
 */
export function createController(ctx: MountContext): MountController {
  return {
    render(target: string | Element): EmbedHandle {
      const parent = resolveTarget(target);

      // Build the iframe shell up front; its src is set once the token resolves.
      const iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", IFRAME_SANDBOX);
      iframe.setAttribute("title", `CDC ATS ${ctx.module}`);
      iframe.setAttribute("loading", "lazy");
      iframe.style.width = "100%";
      iframe.style.border = "0";
      iframe.style.display = "block";
      // Sensible initial height before the first resize message arrives.
      iframe.style.height = "320px";

      let destroyed = false;
      let messageListener: ((e: MessageEvent) => void) | null = null;

      const fail = (msg: string) => {
        ctx.options.onError?.(msg);
      };

      // Strict inbound handler. Gate on (1) it is THIS iframe's window, (2) the
      // origin is exactly our host origin, (3) the envelope is a valid widget
      // message. Only then act on it.
      const onMessage = (event: MessageEvent) => {
        if (destroyed) return;
        if (event.source !== iframe.contentWindow) return;
        if (event.origin !== ctx.hostOrigin) return;
        if (!isWidgetMessage(event.data)) return;
        const msg = event.data as WidgetOutboundMessage;
        switch (msg.type) {
          case "ready":
            // Send the locked init context as soon as the widget says it is ready.
            postToWidget({
              source: EMBED_MESSAGE_SOURCE,
              v: PROTOCOL_VERSION,
              type: "init",
              init: {
                module: ctx.module,
                resourceId: ctx.resourceId,
                params: ctx.params,
                theme: ctx.options.theme,
                customCSS: ctx.options.customCSS,
              },
            });
            ctx.options.onReady?.();
            break;
          case "resize":
            if (typeof msg.height === "number" && msg.height > 0) {
              // Clamp to a sane ceiling so a runaway widget cannot grow without bound.
              const h = Math.min(Math.ceil(msg.height), 20000);
              iframe.style.height = `${h}px`;
              ctx.options.onResize?.(h);
            }
            break;
          case "token-refresh-request":
            // Re-fetch a fresh token via the host callback and hand it back,
            // correlated by requestId so the widget can match the reply.
            void refreshToken(msg.requestId);
            break;
          case "navigate":
            if (typeof msg.path === "string") ctx.options.onNavigate?.(msg.path);
            break;
          case "error":
            fail(typeof msg.message === "string" ? msg.message : "widget error");
            break;
          default:
            break;
        }
      };

      // Post to the widget, always targeting the EXACT host origin (never "*").
      const postToWidget = (message: HostInboundMessage) => {
        if (destroyed) return;
        const win = iframe.contentWindow;
        if (!win) return;
        win.postMessage(message, ctx.hostOrigin);
      };

      const refreshToken = async (requestId?: string) => {
        try {
          const token = await ctx.getToken({
            module: ctx.module,
            resourceId: ctx.resourceId,
            params: ctx.params,
          });
          if (destroyed) return;
          if (typeof token !== "string" || token.length === 0) {
            fail("getToken returned an empty token");
            return;
          }
          postToWidget({
            source: EMBED_MESSAGE_SOURCE,
            v: PROTOCOL_VERSION,
            type: "token-refresh",
            requestId,
            token,
          });
        } catch (err) {
          fail(`token refresh failed: ${(err as Error)?.message ?? String(err)}`);
        }
      };

      // Wire the listener BEFORE injecting the iframe so we never miss `ready`.
      messageListener = onMessage;
      window.addEventListener("message", messageListener);

      const handle: EmbedHandle = {
        iframe,
        setTheme(theme: EmbedTheme, customCSS?: string) {
          // Keep the controller's copy current so a later token-refresh re-init
          // (if the widget reloads) carries the latest theme too.
          ctx.options.theme = theme;
          if (customCSS !== undefined) ctx.options.customCSS = customCSS;
          postToWidget({
            source: EMBED_MESSAGE_SOURCE,
            v: PROTOCOL_VERSION,
            type: "theme",
            theme,
            customCSS,
          });
        },
        destroy() {
          if (destroyed) return;
          destroyed = true;
          if (messageListener) window.removeEventListener("message", messageListener);
          messageListener = null;
          iframe.remove();
        },
      };

      // Resolve the first token, then set src. Mint failures surface via onError
      // and leave the (empty) iframe out of the DOM — fail closed, nothing framed.
      Promise.resolve()
        .then(() =>
          ctx.getToken({ module: ctx.module, resourceId: ctx.resourceId, params: ctx.params }),
        )
        .then((token) => {
          if (destroyed) return;
          if (typeof token !== "string" || token.length === 0) {
            fail("getToken returned an empty token");
            return;
          }
          iframe.src = buildSrc(ctx.hostOrigin, ctx.module, token);
          parent.appendChild(iframe);
        })
        .catch((err: unknown) => {
          fail(`token mint failed: ${(err as Error)?.message ?? String(err)}`);
        });

      return handle;
    },
  };
}

export { resolveHostOrigin };
