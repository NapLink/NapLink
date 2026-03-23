export * from './base';
export * from './message';
export * from './notice';
export * from './request';
export * from './meta';
export * from './shared';
export * from './group';

import type { FriendRecallNotice, FriendAddNotice, GroupAdminNotice, GroupDecreaseNotice, GroupGrayTipNotice, GroupIncreaseNotice, GroupRecallNotice, GroupUploadNotice, PokeNotice } from './notice';
import type { HeartbeatMetaEvent, LifecycleMetaEvent, MetaEvent } from './meta';
import type { GroupMessageEvent, MessageEvent, PrivateMessageEvent } from './message';
import type { FriendRequest, GroupRequest, RequestEvent } from './request';
import type { NoticeEvent } from './notice';

export type OneBotEvent =
    | MessageEvent
    | PrivateMessageEvent
    | GroupMessageEvent
    | NoticeEvent
    | GroupRecallNotice
    | FriendRecallNotice
    | GroupUploadNotice
    | GroupAdminNotice
    | GroupDecreaseNotice
    | GroupIncreaseNotice
    | FriendAddNotice
    | PokeNotice
    | GroupGrayTipNotice
    | RequestEvent
    | FriendRequest
    | GroupRequest
    | MetaEvent
    | LifecycleMetaEvent
    | HeartbeatMetaEvent;
