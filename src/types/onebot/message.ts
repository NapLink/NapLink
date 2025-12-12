import type { BaseEvent, MessageSegment } from './base';

export interface MessageEvent extends BaseEvent {
    post_type: 'message';
    message_type: 'private' | 'group';
    sub_type: string;
    message_id: number;
    user_id: number;
    message: MessageSegment[]; // OneBot segments
    raw_message: string;
    font: number;
    sender: Sender;
}

export interface PrivateMessageEvent extends MessageEvent {
    message_type: 'private';
    sub_type: 'friend' | 'group' | 'other';
    target_id: number; // Receiver ID
}

export interface GroupMessageEvent extends MessageEvent {
    message_type: 'group';
    sub_type: 'normal' | 'anonymous' | 'notice';
    group_id: number;
    anonymous?: Anonymous;
}

export interface Sender {
    user_id?: number;
    nickname?: string;
    sex?: 'male' | 'female' | 'unknown';
    age?: number;
    card?: string; // Group card
    area?: string;
    level?: string;
    role?: 'owner' | 'admin' | 'member';
    title?: string;
}

export interface Anonymous {
    id: number;
    name: string;
    flag: string;
}
