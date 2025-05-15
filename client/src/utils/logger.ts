export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

type LogMode = 'silent' | 'minimal' | 'normal' | 'verbose';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

// CSS color codes for browser console
const colors = {
  reset: '%c',
  info: 'color: #2196F3; font-weight: bold;',
  warn: 'color: #FFC107; font-weight: bold;',
  error: 'color: #F44336; font-weight: bold;',
  debug: 'color: #9C27B0; font-weight: bold;',
  gray: 'color: #9E9E9E;',
  context: 'color: #757575; font-style: italic;'
};

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private mode: LogMode;
  private levelEmojis: Record<LogLevel, string>;

  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.mode = (import.meta.env.VITE_LOG_MODE as LogMode) || 'normal';
    
    this.levelEmojis = {
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.DEBUG]: '🔍'
    };
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setMode(mode: LogMode) {
    this.mode = mode;
  }

  private shouldLog(level: LogLevel): boolean {
    const silent = [LogLevel.ERROR];
    const minimal = [LogLevel.ERROR, LogLevel.WARN];
    const normal = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO];

    if (this.mode === 'silent') return silent.includes(level);
    if (this.mode === 'minimal') return minimal.includes(level);
    if (this.mode === 'normal') return normal.includes(level);
    return true; // verbose mode
  }

  private formatMessage(logMessage: LogMessage): [string, ...string[]] {
    const { level, message, timestamp, context } = logMessage;
    const color = colors[level];
    const emoji = this.levelEmojis[level];
    
    const timestampStr = `[${timestamp}]`;
    const levelStr = `[${level.toUpperCase()}]`;
    const messageStr = `${emoji} ${message}`;
    
    const contextStr = context 
      ? `\nContext: ${JSON.stringify(context, null, 2)}`
      : '';

    return [
      `${timestampStr} ${levelStr} ${messageStr}${contextStr}`,
      colors.reset,
      color,
      colors.gray,
      colors.context
    ];
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    };

    const formattedMessage = this.formatMessage(logMessage);

    switch (level) {
      case LogLevel.ERROR:
        console.error(...formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(...formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(...formattedMessage);
        }
        break;
      default:
        console.log(...formattedMessage);
    }
  }

  public info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  public error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context);
  }

  public debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }
}

export const logger = Logger.getInstance(); 