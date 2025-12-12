import type { BaseEvent } from './base';

export interface MetaEvent extends BaseEvent {
    post_type: 'meta_event';
    meta_event_type: string;
}

export interface LifecycleMetaEvent extends MetaEvent {
    meta_event_type: 'lifecycle';
    sub_type: 'enable' | 'disable' | 'connect';
}

export interface HeartbeatMetaEvent extends MetaEvent {
    meta_event_type: 'heartbeat';
    status: any;
    interval: number;
}
