import { resolveResource } from "@tauri-apps/api/path";
import { Command, Child } from "@tauri-apps/plugin-shell";

export interface FRPCService {
  startConnection: (
    gamePort: number,
    onLog: (message: string, preserveColors?: boolean) => void,
    onStatusChange: (status: string) => void,
    onConnectionComplete: () => void
  ) => Promise<Child | null>;
  stopConnection: (process: Child | null) => Promise<void>;
}

export const createFRPCService = (): FRPCService => {
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