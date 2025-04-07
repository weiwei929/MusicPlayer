const { spawn } = require('child_process');
const electron = require('electron');
const path = require('path');
const { createServer } = require('vite');

// 启动 Vite 开发服务器
(async () => {
    try {
        // 创建 Vite 开发服务器
        const vite = await createServer({
            configFile: path.join(__dirname, 'vite.config.ts'),
            mode: 'development',
            server: {
                port: 3000
            }
        });

        await vite.listen(3000);

        console.log('Vite 开发服务器已启动在 http://localhost:3000');

        // 等待 Vite 服务器完全启动
        setTimeout(() => {
            // 启动 Electron
            const electronProcess = spawn(electron, ['.'], {
                stdio: 'inherit'
            });

            electronProcess.on('close', () => {
                // 关闭 Vite 服务器
                vite.close();
                process.exit();
            });
        }, 1000);
    } catch (error) {
        console.error('启动失败:', error);
        process.exit(1);
    }
})();
