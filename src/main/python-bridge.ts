import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import { app, ipcMain } from 'electron';
import * as fs from 'fs';

class PythonBridge {
    private pythonProcess: ChildProcess | null = null;
    private isProduction: boolean;

    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production';
    }

    init() {
        this.setupIpcHandlers();
    }

    private getPythonPath(): string {
        if (this.isProduction) {
            // 在生产环境中使用打包的Python
            return path.join(process.resourcesPath, 'python_dist', 'python');
        } else {
            // 在开发环境中使用系统Python
            return 'python';
        }
    }

    private getScriptPath(): string {
        if (this.isProduction) {
            return path.join(process.resourcesPath, 'music_player.py');
        } else {
            return path.join(app.getAppPath(), 'music_player.py');
        }
    }

    private setupIpcHandlers() {
        ipcMain.handle('python:analyze-music', async (_, filePath) => {
            try {
                return await this.runPythonScript(['--analyze', filePath]);
            } catch (error) {
                console.error('Python music analysis error:', error);
                throw error;
            }
        });

        ipcMain.handle('python:process-music', async (_, filePath, options) => {
            try {
                return await this.runPythonScript(['--process', filePath, '--options', JSON.stringify(options)]);
            } catch (error) {
                console.error('Python music processing error:', error);
                throw error;
            }
        });
    }

    private runPythonScript(args: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const pythonPath = this.getPythonPath();
            const scriptPath = this.getScriptPath();

            if (!fs.existsSync(scriptPath)) {
                reject(new Error(`Python script not found: ${scriptPath}`));
                return;
            }

            const process = spawn(pythonPath, [scriptPath, ...args]);

            let outputData = '';
            let errorData = '';

            process.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            process.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Python process exited with code ${code}: ${errorData}`));
                } else {
                    try {
                        resolve(JSON.parse(outputData));
                    } catch (error) {
                        resolve(outputData);
                    }
                }
            });
        });
    }

    shutdown() {
        if (this.pythonProcess && !this.pythonProcess.killed) {
            this.pythonProcess.kill();
        }
    }
}

export const pythonBridge = new PythonBridge();
export default pythonBridge;
