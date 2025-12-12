import type { Logger } from '../types/config';

/**
 * 日志等级枚举
 */
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    OFF = 4,
}

/**
 * 日志等级映射
 */
const LOG_LEVEL_MAP: Record<string, LogLevel> = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    error: LogLevel.ERROR,
    off: LogLevel.OFF,
};

/**
 * 默认Logger实现
 * 支持日志等级控制和漂亮的格式化输出
 */
export class DefaultLogger implements Logger {
    private level: LogLevel;

    constructor(level: 'debug' | 'info' | 'warn' | 'error' | 'off' = 'info') {
        this.level = LOG_LEVEL_MAP[level];
    }

    /**
     * 设置日志等级
     */
    setLevel(level: 'debug' | 'info' | 'warn' | 'error' | 'off'): void {
        this.level = LOG_LEVEL_MAP[level];
    }

    debug(message: string, ...meta: any[]): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.debug(this.format('DEBUG', message), ...meta);
        }
    }

    info(message: string, ...meta: any[]): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(this.format('INFO', message), ...meta);
        }
    }

    warn(message: string, ...meta: any[]): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(this.format('WARN', message), ...meta);
        }
    }

    error(message: string, error?: Error, ...meta: any[]): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            console.error(this.format('ERROR', message), error || '', ...meta);
        }
    }

    /**
     * 检查是否应该输出日志
     */
    private shouldLog(level: LogLevel): boolean {
        return level >= this.level;
    }

    /**
     * 格式化日志消息
     */
    private format(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [NapLink] ${level}: ${message}`;
    }
}
