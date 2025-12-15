import { ApiTimeoutError } from '../../types/errors';

export interface PendingRequest {
    resolve: (data: any) => void;
    reject: (error: Error) => void;
    createdAt: number;
    method: string;
    timer: NodeJS.Timeout | number;
    timeoutMs: number;
    onPacket?: (packet: any) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}

export class ResponseRegistry {
    private pending = new Map<string, PendingRequest>();

    add(echo: string, request: Omit<PendingRequest, 'timer'>, timeout: number): PendingRequest {
        const timer = setTimeout(() => {
            this.pending.delete(echo);
            request.reject(new ApiTimeoutError(request.method, timeout));
        }, timeout);

        const entry: PendingRequest = { ...request, timer };
        this.pending.set(echo, entry);
        return entry;
    }

    get(echo: string): PendingRequest | undefined {
        return this.pending.get(echo);
    }

    refresh(echo: string): boolean {
        const req = this.pending.get(echo);
        if (!req) return false;

        clearTimeout(req.timer as NodeJS.Timeout);
        req.createdAt = Date.now();
        req.timer = setTimeout(() => {
            this.pending.delete(echo);
            req.reject(new ApiTimeoutError(req.method, req.timeoutMs));
        }, req.timeoutMs);
        return true;
    }

    resolve(echo: string, data: any) {
        const req = this.pending.get(echo);
        if (!req) return false;
        this.pending.delete(echo);
        clearTimeout(req.timer as NodeJS.Timeout);
        req.resolve(data);
        return true;
    }

    reject(echo: string, error: Error) {
        const req = this.pending.get(echo);
        if (!req) return false;
        this.pending.delete(echo);
        clearTimeout(req.timer as NodeJS.Timeout);
        req.reject(error);
        return true;
    }

    take(echo: string): PendingRequest | undefined {
        const req = this.pending.get(echo);
        if (req) {
            this.pending.delete(echo);
            clearTimeout(req.timer as NodeJS.Timeout);
        }
        return req;
    }

    clearAll(reason: string) {
        for (const [, req] of this.pending) {
            clearTimeout(req.timer as NodeJS.Timeout);
            req.reject(new Error(reason));
        }
        this.pending.clear();
    }

    cleanupStale(now: number, maxAge: number, onTimeout: (method: string, echo: string) => void) {
        for (const [echo, req] of this.pending) {
            if (now - req.createdAt > maxAge) {
                onTimeout(req.method, echo);
                this.reject(echo, new ApiTimeoutError(req.method, maxAge / 2));
            }
        }
    }
}
