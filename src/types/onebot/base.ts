/**
 * OneBot 11 Protocol Base Types
 */

export type PostType = 'message' | 'notice' | 'request' | 'meta_event';

export interface BaseEvent {
    time: number;
    self_id: number;
    post_type: PostType;
}

// Common message segment type (see message-segment.ts for full union)
export type MessageSegment = any;
