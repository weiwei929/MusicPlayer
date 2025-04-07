// 为Electron提供类型支持
declare module 'electron' {
  export const ipcRenderer: {
    invoke(channel: string, ...args: any[]): Promise<any>;
    on(channel: string, listener: (event: any, ...args: any[]) => void): void;
    once(channel: string, listener: (event: any, ...args: any[]) => void): void;
    removeListener(channel: string, listener: Function): void;
    removeAllListeners(channel: string): void;
  };
}

// 为vite-plugin-electron提供类型支持
declare module 'vite-plugin-electron' {
  interface ElectronOptions {
    entry?: string;
    vite?: any;
    outDir?: string;
    external?: string[];
    [key: string]: any;
  }
  
  function electron(options: ElectronOptions | ElectronOptions[]): any;
  export default electron;
}
