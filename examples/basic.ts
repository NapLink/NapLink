import { NapLink } from '../src';

/**
 * 基础示例
 * 演示如何连接到NapCat并处理消息
 */
async function basicExample() {
    // 创建客户端
    const client = new NapLink({
        connection: {
            url: 'ws://localhost:3001',
            token: 'your_token', // 如果配置了token
        },
        logging: {
            level: 'info',
        },
    });

    // 监听连接事件
    client.on('connect', () => {
        console.log('✅ 已连接到 NapCat');
    });

    client.on('disconnect', () => {
        console.log('❌ 连接已断开');
    });

    client.on('reconnecting', () => {
        console.log('🔄 正在重连...');
    });

    // 监听消息事件
    client.on('message.group', async (data) => {
        console.log(`[群${data.group_id}] ${data.sender.nickname}: ${data.raw_message}`);

        // 简单的复读机器人
        if (data.raw_message === '你好') {
            await client.sendGroupMessage(data.group_id, '你好！');
        }
    });

    client.on('message.private', async (data) => {
        console.log(`[私聊] ${data.sender.nickname}: ${data.raw_message}`);
    });

    // 连接
    try {
        await client.connect();
        console.log('🚀 NapLink 客户端已启动');

        // 获取登录信息
        const loginInfo = await client.getLoginInfo();
        console.log('登录信息:', loginInfo);

        // 获取群列表
        const groups = await client.getGroupList();
        console.log(`加入了 ${groups.length} 个群`);
    } catch (error) {
        console.error('连接失败:', error);
        process.exit(1);
    }
}

// 运行示例
basicExample().catch(console.error);
