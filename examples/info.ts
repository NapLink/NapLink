import { NapLink } from '../src';

/**
 * 信息查询示例
 * 展示如何获取基础信息/版本信息/陌生人资料
 */
async function infoExample() {
    const client = new NapLink({
        connection: {
            url: 'ws://localhost:3001',
        },
        logging: { level: 'info' },
    });

    client.on('connect', async () => {
        console.log('✅ 已连接，查询信息...');

        const version = await client.getVersionInfo();
        console.log('版本信息:', version);

        const login = await client.getLoginInfo();
        console.log('登录信息:', login);

        const stranger = await client.getStrangerInfo('123456789', true);
        console.log('陌生人信息:', stranger);

        client.disconnect();
    });

    await client.connect();
}

infoExample().catch(console.error);
