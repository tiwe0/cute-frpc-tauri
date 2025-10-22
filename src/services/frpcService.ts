import { resolveResource } from "@tauri-apps/api/path";
import { exists, copyFile } from "@tauri-apps/plugin-fs";
import { Command, Child } from "@tauri-apps/plugin-shell";
import { APP_DEFAULT_FRPC_CONFIG_PATH, APP_FRPC_CONFIG_PATH } from "../utils/const";

export interface FRPCService {
  startConnection: (
    gamePort: number,
    onLog: (message: string, preserveColors?: boolean) => void,
    onStatusChange: (status: string) => void,
    onConnectionComplete: () => void
  ) => Promise<Child | null>;
  stopConnection: (process: Child | null) => Promise<void>;
}

async function copyDefaultConfigIfNeeded() {
  if (!(await exists(APP_FRPC_CONFIG_PATH))) {
    await copyFile(APP_DEFAULT_FRPC_CONFIG_PATH, APP_FRPC_CONFIG_PATH);
    console.log("已复制默认配置文件到:", APP_FRPC_CONFIG_PATH);
  } else {
    console.log("配置文件已存在，无需复制:", APP_FRPC_CONFIG_PATH);
  }
}

export const createFRPCService = (): FRPCService => {
  copyDefaultConfigIfNeeded();
  return {
    async startConnection(gamePort, onLog, onStatusChange, onConnectionComplete) {
      try {
        onLog(`准备连接到端口 ${gamePort}`);
        
        const command = Command.sidecar("bin/frpc", [
          "-c",
          await resolveResource("resources/default_config.toml"),
        ]);
        
        setTimeout(() => {
          onLog("正在执行 frpc 命令...");
        }, 500);
        
        command.on("close", (data) => {
          onLog(`frpc 进程已关闭，退出码: ${data.code}`);
          if (data.code === 0) {
            onStatusChange("连接成功!");
            onLog("连接建立成功!");
          } else {
            onStatusChange("连接失败");
            onLog("连接失败");
          }
          onConnectionComplete();
        });
        
        command.on("error", (error) => {
          onLog(`frpc 进程错误: ${error}`);
          onStatusChange("连接失败");
          onConnectionComplete();
        });
        
        command.stdout.on("data", (line) => {
          onLog(line, true); // 保留颜色
        });
        
        command.stderr.on("data", (line) => {
          onLog(`错误: ${line}`, true); // 保留颜色
        });
        
        return await command.spawn();
      } catch (error) {
        onLog(`连接失败: ${error}`);
        onStatusChange("连接失败");
        onConnectionComplete();
        return null;
      }
    },

    async stopConnection(process) {
      if (process) {
        await process.kill();
      }
    }
  };
};