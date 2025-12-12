/**
 * NapLink 错误基类
 * 所有SDK错误都继承自此类
 */
export class NapLinkError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: any
    ) {
        super(message);
        this.name = this.constructor.name;

        // 保持正确的原型链
        Object.setPrototypeOf(this, new.target.prototype);
    }

    /**
     * 转换为JSON格式
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
        };
    }
}

/**
 * 连接错误
 * 当WebSocket连接失败时抛出
 */
export class ConnectionError extends NapLinkError {
    constructor(message: string, cause?: any) {
        super(message, 'E_CONNECTION', cause);
    }
}

/**
 * API超时错误
 * 当API调用超过设定时间时抛出
 */
export class ApiTimeoutError extends NapLinkError {
    constructor(method: string, timeout: number) {
        super(
            `API调用 ${method} 超时 (${timeout}ms)`,
            'E_API_TIMEOUT',
            { method, timeout }
        );
    }
}

/**
 * API错误
 * 当API调用返回错误时抛出
 */
export class ApiError extends NapLinkError {
    constructor(
        method: string,
        retcode: number,
        message: string,
        wording?: string
    ) {
        super(
            wording || message || `API调用失败: ${method}`,
            'E_API_FAILED',
            { method, retcode, message, wording }
        );
    }
}

/**
 * 达到最大重连次数错误
 */
export class MaxReconnectAttemptsError extends NapLinkError {
    constructor(attempts: number) {
        super(
            `达到最大重连次数 (${attempts})`,
            'E_MAX_RECONNECT',
            { attempts }
        );
    }
}

/**
 * 连接关闭错误
 */
export class ConnectionClosedError extends NapLinkError {
    constructor(code: number, reason: string) {
        super(
            `连接已关闭: ${reason} (code: ${code})`,
            'E_CONNECTION_CLOSED',
            { code, reason }
        );
    }
}

/**
 * 无效配置错误
 */
export class InvalidConfigError extends NapLinkError {
    constructor(field: string, reason: string) {
        super(
            `无效的配置: ${field} - ${reason}`,
            'E_INVALID_CONFIG',
            { field, reason }
        );
    }
}
