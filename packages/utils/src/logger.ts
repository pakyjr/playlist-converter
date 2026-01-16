/**
 * Centralized Logger
 *
 * Provides consistent logging format across the application.
 * Format: [Context] message
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_LEVEL_LABELS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
};

// Default to INFO in production, DEBUG in development
const currentLevel: LogLevel = process.env.NODE_ENV === 'production'
  ? LogLevel.INFO
  : LogLevel.DEBUG;

/**
 * Logger instance for a specific context.
 */
export class Logger {
  constructor(private context: string) {}

  private formatMessage(message: string): string {
    return `[${this.context}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= currentLevel;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(message), ...args);
    }
  }

  /**
   * Log a match result (common pattern in conversion strategies)
   */
  match(trackName: string, matchedName: string): void {
    this.info(`  [MATCH] ${trackName} -> ${matchedName}`);
  }

  /**
   * Log a no-match result
   */
  noMatch(trackName: string): void {
    this.info(`  [NO MATCH] ${trackName}`);
  }

  /**
   * Create a child logger with extended context
   */
  child(subContext: string): Logger {
    return new Logger(`${this.context}/${subContext}`);
  }
}

/**
 * Create a logger for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
