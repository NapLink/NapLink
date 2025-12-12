import type { NapLinkConfig } from '../../types/config';

export function buildWebSocketUrl(config: NapLinkConfig): string {
    const { url, token } = config.connection;
    if (token) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}access_token=${token}`;
    }
    return url;
}
