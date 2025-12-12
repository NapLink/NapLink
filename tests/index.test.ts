import { describe, it, expect } from 'vitest';
import { NapLink } from '../src/index';

describe('NapLink SDK', () => {
    it('should instantiate correctly', () => {
        const client = new NapLink({
            connection: {
                url: 'ws://localhost:3000',
            },
        });

        expect(client).toBeDefined();
        expect(client.connect).toBeDefined();
    });
});
