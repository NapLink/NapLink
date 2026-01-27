import type { BaseEvent } from './base';
import type { FileInfo } from './shared';

export interface NoticeEvent extends BaseEvent {
    post_type: 'notice';
    notice_type: string;
}

export interface GroupRecallNotice extends NoticeEvent {
    notice_type: 'group_recall';
    group_id: number;
    user_id: number;
    operator_id: number;
    message_id: number;
}

export interface FriendRecallNotice extends NoticeEvent {
    notice_type: 'friend_recall';
    user_id: number;
    message_id: number;
}

export interface GroupUploadNotice extends NoticeEvent {
    notice_type: 'group_upload';
    group_id: number;
    user_id: number;
    file: FileInfo;
}

export interface GroupAdminNotice extends NoticeEvent {
    notice_type: 'group_admin';
    sub_type: 'set' | 'unset';
    group_id: number;
    user_id: number;
}

export interface GroupDecreaseNotice extends NoticeEvent {
    notice_type: 'group_decrease';
    sub_type: 'leave' | 'kick' | 'kick_me';
    group_id: number;
    operator_id: number;
    user_id: number;
}

export interface GroupIncreaseNotice extends NoticeEvent {
    notice_type: 'group_increase';
    sub_type: 'approve' | 'invite';
    group_id: number;
    operator_id: number;
    user_id: number;
}

export interface FriendAddNotice extends NoticeEvent {
    notice_type: 'friend_add';
    user_id: number;
}

export interface NotifyNotice extends NoticeEvent {
    notice_type: 'notify';
    sub_type: string;
    [key: string]: any;
}

export interface PokeNotice extends NotifyNotice {
    sub_type: 'poke';
    target_id: number;
    user_id: number; // Sender
    group_id?: number;
}

export interface GroupGrayTipNotice extends NotifyNotice {
    sub_type: 'gray_tip';
    group_id: number;
    user_id: number;        // 真实发送者QQ（如果是伪造的灰条，这就是攻击者）
    message_id: number;     // 消息ID，可用于撤回
    busi_id: string;        // 业务ID
    content: string;        // 灰条内容（JSON字符串）
    raw_info: unknown;      // 原始信息
}
