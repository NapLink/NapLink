import type { BaseEvent } from './base';

export interface RequestEvent extends BaseEvent {
    post_type: 'request';
    request_type: string;
}

export interface FriendRequest extends RequestEvent {
    request_type: 'friend';
    user_id: number;
    comment: string;
    flag: string;
}

export interface GroupRequest extends RequestEvent {
    request_type: 'group';
    sub_type: 'add' | 'invite';
    group_id: number;
    user_id: number;
    comment: string;
    flag: string;
}
