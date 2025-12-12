import { ApiTimeoutError, ApiError } from '../../types/errors';
import type { Logger } from '../../types/config';

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number,
    method: string,
    logger: Logger,
    delayFn: (ms: number) => Promise<void>,
) {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            // 最后一次尝试，直接抛出错误
            if (attempt === retries) {
                break;
            }

            // 如果是超时错误或API错误，进行重试
            if (
                error instanceof ApiTimeoutError ||
                error instanceof ApiError
            ) {
                logger.warn(
                    `API调用失败，重试 ${attempt + 1}/${retries}: ${method}`,
                    error
                );
                // 简单的延迟重试
                await delayFn(Math.min(1000 * (attempt + 1), 5000));
            } else {
                // 其他错误不重试
                throw error;
            }
        }
    }

    throw lastError;
}
