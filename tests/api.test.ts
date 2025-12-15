import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import { Readable } from 'stream';
import { NapLink } from '../src';

describe('NapLink API wrappers', () => {
    let client: NapLink;
    let callSpy: any;

    beforeEach(() => {
        client = new NapLink({
            connection: {
                url: 'ws://localhost:3000',
                pingInterval: 0, // 测试场景不需要心跳
            },
        });
        callSpy = vi.spyOn((client as any).apiClient, 'call').mockResolvedValue(undefined);
    });

    it('setGroupBan should call set_group_ban', async () => {
        await client.setGroupBan('1', '2', 60);
        expect(callSpy).toHaveBeenCalledWith('set_group_ban', {
            group_id: '1',
            user_id: '2',
            duration: 60,
        });
    });

    it('unsetGroupBan should call set_group_ban with duration 0', async () => {
        await client.unsetGroupBan('1', '2');
        expect(callSpy).toHaveBeenCalledWith('set_group_ban', {
            group_id: '1',
            user_id: '2',
            duration: 0,
        });
    });

    it('setGroupAdmin should call set_group_admin via api facade', async () => {
        await client.api.setGroupAdmin('1', '2', false);
        expect(callSpy).toHaveBeenCalledWith('set_group_admin', {
            group_id: '1',
            user_id: '2',
            enable: false,
        });
    });

    it('setGroupAnonymousBan should call set_group_anonymous_ban', async () => {
        await client.setGroupAnonymousBan('1', 'flag', 10);
        expect(callSpy).toHaveBeenCalledWith('set_group_anonymous_ban', {
            group_id: '1',
            anonymous_flag: 'flag',
            duration: 10,
        });
    });

    it('setGroupSpecialTitle should call set_group_special_title', async () => {
        await client.setGroupSpecialTitle('1', '2', 'VIP', 100);
        expect(callSpy).toHaveBeenCalledWith('set_group_special_title', {
            group_id: '1',
            user_id: '2',
            special_title: 'VIP',
            duration: 100,
        });
    });

    it('setEssenceMessage should call set_essence_msg', async () => {
        await client.setEssenceMessage(123);
        expect(callSpy).toHaveBeenCalledWith('set_essence_msg', { message_id: 123 });
    });

    it('deleteEssenceMessage should call delete_essence_msg', async () => {
        await client.deleteEssenceMessage(456);
        expect(callSpy).toHaveBeenCalledWith('delete_essence_msg', { message_id: 456 });
    });

    it('getEssenceMessageList should call get_essence_msg_list', async () => {
        await client.getEssenceMessageList('789');
        expect(callSpy).toHaveBeenCalledWith('get_essence_msg_list', { group_id: '789' });
    });

    it('markMessageAsRead should call mark_msg_as_read', async () => {
        await client.markMessageAsRead(111);
        expect(callSpy).toHaveBeenCalledWith('mark_msg_as_read', { message_id: 111 });
    });

    it('markGroupMsgAsRead should call mark_group_msg_as_read', async () => {
        await client.markGroupMsgAsRead('123');
        expect(callSpy).toHaveBeenCalledWith('mark_group_msg_as_read', { group_id: '123' });
    });

    it('markPrivateMsgAsRead should call mark_private_msg_as_read', async () => {
        await client.markPrivateMsgAsRead('456');
        expect(callSpy).toHaveBeenCalledWith('mark_private_msg_as_read', { user_id: '456' });
    });

    it('markAllMsgAsRead should call _mark_all_as_read', async () => {
        await client.markAllMsgAsRead();
        expect(callSpy).toHaveBeenCalledWith('_mark_all_as_read');
    });

    it('getGroupAtAllRemain should call get_group_at_all_remain', async () => {
        await client.getGroupAtAllRemain('123');
        expect(callSpy).toHaveBeenCalledWith('get_group_at_all_remain', { group_id: '123' });
    });

    it('getGroupSystemMsg should call get_group_system_msg', async () => {
        await client.getGroupSystemMsg();
        expect(callSpy).toHaveBeenCalledWith('get_group_system_msg');
    });

    it('getGroupHonorInfo should call get_group_honor_info', async () => {
        await client.getGroupHonorInfo('1', 'talkative');
        expect(callSpy).toHaveBeenCalledWith('get_group_honor_info', { group_id: '1', type: 'talkative' });
    });

    it('group file system calls should proxy correctly', async () => {
        await client.getGroupFileSystemInfo('1');
        expect(callSpy).toHaveBeenCalledWith('get_group_file_system_info', { group_id: '1' });

        await client.getGroupRootFiles('1');
        expect(callSpy).toHaveBeenCalledWith('get_group_root_files', { group_id: '1' });

        await client.getGroupFilesByFolder('1', 'folder');
        expect(callSpy).toHaveBeenCalledWith('get_group_files_by_folder', { group_id: '1', folder_id: 'folder' });

        await client.getGroupFileUrl('1', 'fid', 100);
        expect(callSpy).toHaveBeenCalledWith('get_group_file_url', { group_id: '1', file_id: 'fid', busid: 100 });

        await client.deleteGroupFile('1', 'fid', 100);
        expect(callSpy).toHaveBeenCalledWith('delete_group_file', { group_id: '1', file_id: 'fid', busid: 100 });

        await client.createGroupFileFolder('1', 'name', 'parent');
        expect(callSpy).toHaveBeenCalledWith('create_group_file_folder', { group_id: '1', name: 'name', parent_id: 'parent' });

        await client.deleteGroupFolder('1', 'folder');
        expect(callSpy).toHaveBeenCalledWith('delete_group_folder', { group_id: '1', folder_id: 'folder' });
    });

    it('downloadFile should call download_file', async () => {
        await client.downloadFile('http://example.com/a', 2, { Foo: 'Bar' });
        expect(callSpy).toHaveBeenCalledWith('download_file', {
            url: 'http://example.com/a',
            thread_count: 2,
            headers: { Foo: 'Bar' },
        });
    });

    it('uploadFileStream should chunk buffer and send complete', async () => {
        const buf = Buffer.from('hellostream'); // length 11
        await client.uploadFileStream(buf, { chunkSize: 4, filename: 'x.bin', fileRetention: 1000, streamId: 'sid', reset: true, verifyOnly: true });

        // chunk calls + completion
        expect(callSpy).toHaveBeenCalledTimes(5);
        expect(callSpy.mock.calls[0][0]).toBe('upload_file_stream'); // reset
        expect(callSpy.mock.calls[0][1]).toEqual({ stream_id: 'sid', reset: true });

        const firstPayload = callSpy.mock.calls[1][1] as any;
        expect(firstPayload.stream_id).toBe('sid');
        expect(firstPayload.total_chunks).toBe(3);
        expect(firstPayload.chunk_index).toBe(0);
        expect(firstPayload.file_size).toBe(11);
        expect(firstPayload.filename).toBe('x.bin');
        expect(firstPayload.file_retention).toBe(1000);
        expect(firstPayload.verify_only).toBe(true);

        const completeCall = callSpy.mock.calls.at(-1);
        expect(completeCall?.[1]).toEqual({ stream_id: 'sid', is_complete: true });
    });

    it('getUploadStreamStatus should call upload_file_stream with verify_only', async () => {
        await client.getUploadStreamStatus('sid');
        expect(callSpy).toHaveBeenCalledWith('upload_file_stream', { stream_id: 'sid', verify_only: true });
    });

    it('sendGroupPoke should call group_poke', async () => {
        await client.sendGroupPoke('1', '2');
        expect(callSpy).toHaveBeenCalledWith('group_poke', { group_id: '1', user_id: '2' });
    });

    it('sendFriendPoke should call friend_poke', async () => {
        await client.sendFriendPoke('2');
        expect(callSpy).toHaveBeenCalledWith('friend_poke', { user_id: '2' });
    });

    it('sendPoke should call send_poke', async () => {
        await client.sendPoke('2');
        expect(callSpy).toHaveBeenCalledWith('send_poke', { user_id: '2' });
        await client.sendPoke('3', '999');
        expect(callSpy).toHaveBeenCalledWith('send_poke', { group_id: '999', target_id: '3' });
    });

    it('sendLike should call send_like', async () => {
        await client.sendLike('123', 5);
        expect(callSpy).toHaveBeenCalledWith('send_like', {
            user_id: '123',
            times: 5,
        });
    });

    it('uploadGroupFile should call upload_group_file', async () => {
        await client.uploadGroupFile('1', '/tmp/a.txt', 'a.txt');
        expect(callSpy).toHaveBeenCalledWith('upload_group_file', {
            group_id: '1',
            file: '/tmp/a.txt',
            name: 'a.txt',
        });
    });

    it('uploadGroupFile should accept buffer and write temp file', async () => {
        await client.uploadGroupFile('1', Buffer.from('demo'), 'buf.bin');
        const lastCall = callSpy.mock.calls.at(-1);
        const payload = lastCall?.[1] as any;
        expect(payload.file).toMatch(/buf\.bin$/);
        expect(fs.existsSync(payload.file)).toBe(true);
        fs.unlinkSync(payload.file);
    });

    it('uploadPrivateFile should call upload_private_file', async () => {
        await client.uploadPrivateFile('2', '/tmp/b.txt', 'b.txt');
        expect(callSpy).toHaveBeenCalledWith('upload_private_file', {
            user_id: '2',
            file: '/tmp/b.txt',
            name: 'b.txt',
        });
    });

    it('getStrangerInfo should call get_stranger_info', async () => {
        await client.getStrangerInfo('789', true);
        expect(callSpy).toHaveBeenCalledWith('get_stranger_info', {
            user_id: '789',
            no_cache: true,
        });
    });

    it('getVersionInfo should call get_version_info', async () => {
        await client.getVersionInfo();
        expect(callSpy).toHaveBeenCalledWith('get_version_info');
    });

    it('handleFriendRequest should call set_friend_add_request', async () => {
        await client.handleFriendRequest('flag123', true, 'hi');
        expect(callSpy).toHaveBeenCalledWith('set_friend_add_request', {
            flag: 'flag123',
            approve: true,
            remark: 'hi',
        });
    });

    it('handleGroupRequest should call set_group_add_request', async () => {
        await client.handleGroupRequest('flag456', 'add', false, 'nope');
        expect(callSpy).toHaveBeenCalledWith('set_group_add_request', {
            flag: 'flag456',
            sub_type: 'add',
            approve: false,
            reason: 'nope',
        });
    });

    it('getOnlineClients should call get_online_clients', async () => {
        await client.getOnlineClients(true);
        expect(callSpy).toHaveBeenCalledWith('get_online_clients', { no_cache: true });
    });

    it('getCsrfToken should call get_csrf_token', async () => {
        await client.getCsrfToken();
        expect(callSpy).toHaveBeenCalledWith('get_csrf_token');
    });

    it('getRkeyServer should call get_rkey_server', async () => {
        await client.getRkeyServer();
        expect(callSpy).toHaveBeenCalledWith('get_rkey_server');
    });
});
