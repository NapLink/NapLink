import { NapLink } from '../src';

/**
 * 请求处理示例
 * 展示如何处理好友/群邀请请求
 */
async function requestExample() {
    const client = new NapLink({
        connection: {
            url: 'ws://localhost:3001',
        },
        logging: {
            level: 'info',
        },
    });

    // 接受好友请求
    client.on('request.friend', async (data: any) => {
        console.log('收到好友请求:', data.user_id);
        await client.handleFriendRequest(data.flag, true, '很高兴认识你');
    });

    // 接受入群申请
    client.on('request.group', async (data: any) => {
        console.log('收到入群请求:', data.user_id, 'reason:', data.comment);
        await client.handleGroupRequest(data.flag, data.sub_type, true, '欢迎加入');
    });

    client.on('connect', () => console.log('✅ NapLink 已连接，等待请求事件...'));

    await client.connect();
}

requestExample().catch(console.error);
