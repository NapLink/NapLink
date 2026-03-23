import type { NapLinkConfig } from '../../types/config';

export function buildWebSocketUrl(config: NapLinkConfig): string {
    const { url, token } = config.connection;
    if (token) {
        try {
            // Prefer structured URL mutation so we overwrite any existing access_token.
            const parsed = new URL(url);
            parsed.searchParams.set('access_token', token);
            return parsed.toString();
        } catch {
            const separator = url.includes('?') ? '&' : '?';
            // Token may contain URL-sensitive chars (+, &, #, % ...), must be encoded.
            return `${url}${separator}access_token=${encodeURIComponent(token)}`;
        }
    }
    return url;
}
