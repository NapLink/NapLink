export interface FileInfo {
    id: string;
    name: string;
    size: number;
    busid: number;
}

// Group system messages (get_group_system_msg)
export interface GroupInviteRequest {
    request_id?: number;
    invitor_uin: number;
    invitor_nick?: string;
    group_id: number;
    group_name?: string;
    checked: boolean;
    actor?: number;
}

export interface GroupJoinRequest {
    request_id?: number;
    user_id: number;
    nickname?: string;
    group_id: number;
    group_name?: string;
    comment?: string;
    checked: boolean;
    actor?: number;
}

export interface GroupSystemMessages {
    invited_requests: GroupInviteRequest[];
    join_requests: GroupJoinRequest[];
}
