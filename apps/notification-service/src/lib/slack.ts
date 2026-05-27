/**
 * Slack delivery via Incoming Webhooks.
 *
 * Each tenant stores their own webhook URL in TenantIntegration{kind:"slack"}.
 * sendSlack POSTs a Block Kit message to that URL.
 *
 * No global Slack app needed — incoming webhooks are the simplest path and
 * work for both free + paid Slack workspaces. Add `chat:write` scope only
 * if you want richer messages later.
 */
import { createLogger } from "@cdc-ats/common";

const logger = createLogger({ serviceName: "notification-service:slack" });

export interface SendSlackInput {
  webhookUrl: string;
  title: string;
  body?: string | null;
  link?: string | null;
  /** Optional channel override if the webhook allows it. */
  channel?: string;
  /** Optional emoji prefix like ":bell:" or ":rocket:". */
  iconEmoji?: string;
}

export interface SendSlackResult {
  ok: boolean;
  error?: string;
}

export async function sendSlack(input: SendSlackInput): Promise<SendSlackResult> {
  if (!input.webhookUrl.startsWith("https://hooks.slack.com/")) {
    return { ok: false, error: "webhookUrl is not a hooks.slack.com URL" };
  }
  const payload: any = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: input.title, emoji: true },
      },
      ...(input.body
        ? [{ type: "section", text: { type: "mrkdwn", text: input.body } }]
        : []),
      ...(input.link
        ? [
            {
              type: "actions",
              elements: [
                {
                  type: "button",
                  text: { type: "plain_text", text: "View in dashboard" },
                  url: input.link,
                  style: "primary",
                },
              ],
            },
          ]
        : []),
      { type: "context", elements: [{ type: "mrkdwn", text: "_via CDC ATS_" }] },
    ],
    // Fallback for clients that don't render blocks
    text: `${input.title}${input.body ? ` — ${input.body}` : ""}`,
  };
  if (input.channel) payload.channel = input.channel;
  if (input.iconEmoji) payload.icon_emoji = input.iconEmoji;

  try {
    const res = await fetch(input.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const msg = `Slack returned ${res.status}: ${text.slice(0, 200)}`;
      logger.error({ status: res.status, text }, "slack send failed");
      return { ok: false, error: msg };
    }
    logger.info({ title: input.title }, "slack message sent");
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err }, "slack send failed");
    return { ok: false, error: message };
  }
}
