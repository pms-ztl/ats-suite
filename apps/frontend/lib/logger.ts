type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = process.env.NODE_ENV === "development";
const isBrowser = typeof window !== "undefined";

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

function formatEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return { level, message, context, timestamp: new Date().toISOString() };
}

function shouldLog(level: LogLevel): boolean {
  if (!isDev && level === "debug") return false;
  return true;
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (!shouldLog("debug")) return;
    const entry = formatEntry("debug", message, context);
    if (isBrowser) console.debug(`[${entry.timestamp}] DEBUG:`, message, context ?? "");
    else console.debug(JSON.stringify(entry));
  },
  info(message: string, context?: Record<string, unknown>) {
    if (!shouldLog("info")) return;
    const entry = formatEntry("info", message, context);
    if (isBrowser) console.info(`[${entry.timestamp}] INFO:`, message, context ?? "");
    else console.info(JSON.stringify(entry));
  },
  warn(message: string, context?: Record<string, unknown>) {
    if (!shouldLog("warn")) return;
    const entry = formatEntry("warn", message, context);
    if (isBrowser) console.warn(`[${entry.timestamp}] WARN:`, message, context ?? "");
    else console.warn(JSON.stringify(entry));
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const entry = formatEntry("error", message, { ...context, error: error instanceof Error ? { message: error.message, stack: error.stack } : error });
    if (isBrowser) console.error(`[${entry.timestamp}] ERROR:`, message, error, context ?? "");
    else console.error(JSON.stringify(entry));
  },
};

export type { LogLevel, LogEntry };
