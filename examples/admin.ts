import { NapLink } from '../src';

/**
 * 群管理示例
 * 展示常见管理操作的调用方式
 */
async function adminExample() {
    const client = new NapLink({
        connection: {
            url: 'ws://localhost:3001',
            token: 'your_token',
        },
        logging: {
            level: 'info',
        },
    });

    client.on('connect', async () => {
        console.log('✅ 已连接，执行管理操作');
        const groupId = '123456';
        const userId = '654321';

        // 禁言 10 分钟
        await client.setGroupBan(groupId, userId, 10 * 60);

        // 设置管理员
        await client.setGroupAdmin(groupId, userId, true);

        // 设置群名片
        await client.setGroupCard(groupId, userId, 'NapLink Bot');

        // 设置群头衔
        await client.setGroupSpecialTitle(groupId, userId, '活跃成员', 3600);

        // 取消全员禁言
        await client.setGroupWholeBan(groupId, false);

        console.log('✅ 管理操作完成');
        client.disconnect();
    });

    client.on('disconnect', () => console.log('🔌 连接已断开'));

    await client.connect();
}

adminExample().catch(console.error);
