/**
 * Centralized logging utility.
 * In production, logs errors with structured data (ready for Sentry/Datadog integration).
 * In development, uses console.error for convenience.
 */

type LogLevel = 'error' | 'warn' | 'info'

interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  error?: unknown
  timestamp: string
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack || ''}`
  }
  return String(error)
}

function log(level: LogLevel, message: string, error?: unknown, context?: string) {
  const entry: LogEntry = {
    level,
    message,
    context,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    timestamp: new Date().toISOString(),
  }

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON logging for production (parseable by log aggregators)
    // Avoids leaking stack traces to stdout while still recording them
    const safeEntry = {
      level: entry.level,
      message: entry.message,
      context: entry.context,
      error: error instanceof Error ? error.message : undefined,
      timestamp: entry.timestamp,
    }
    if (level === 'error') {
      console.error(JSON.stringify(safeEntry))
    } else if (level === 'warn') {
      console.warn(JSON.stringify(safeEntry))
    } else {
      console.log(JSON.stringify(safeEntry))
    }
  } else {
    // Development: verbose logging
    const prefix = `[${level.toUpperCase()}] ${entry.context || ''}`
    if (error) {
      console.error(prefix, message, formatError(error))
    } else {
      console.log(prefix, message)
    }
  }
}

export const logger = {
  error: (message: string, error?: unknown, context?: string) =>
    log('error', message, error, context),
  warn: (message: string, error?: unknown, context?: string) =>
    log('warn', message, error, context),
  info: (message: string, context?: string) =>
    log('info', message, undefined, context),
}
