import TOMLParser from "@iarna/toml";

export interface Game {
  name: string;
  defaultPort: number;
  background?: string;
  type: "tcp" | "udp";
}

export interface LogEntry {
  id: number;
  timestamp: string;
  content: string;
  hasColors: boolean;
}

export interface ConnectionState {
  isConnecting: boolean;
  connectionStatus: string;
  connectionCompleted: boolean;
  isAnimating: boolean;
}

class FPRCProxyConfig {
  name: string;
  type: "tcp" | "udp";
  localIp: string;
  localPort: number;
  remotePort: number;

  constructor(
    name: string,
    type: "tcp" | "udp",
    localIp: string,
    localPort: number,
    remotePort: number
  ) {
    this.name = name;
    this.type = type;
    this.localIp = localIp;
    this.localPort = localPort;
    this.remotePort = remotePort;
  }
}

export class FRPCConfig {
  serverAddr: string;
  serverPort: number;
  proxies: FPRCProxyConfig[];

  constructor(
    serverAddr: string,
    serverPort: number,
    proxies: FPRCProxyConfig[]
  ) {
    this.serverAddr = serverAddr;
    this.serverPort = serverPort;
    this.proxies = proxies;
  }

  static fromTOML(tomlString: string): FRPCConfig {
    const parsed = TOMLParser.parse(tomlString);
    const serverAddr = parsed["serverAddr"] as string;
    const serverPort = Number(parsed["serverPort"]);
    let proxies: FPRCProxyConfig[] = [];
    // 查看 proxies 键
    for (const proxy of (parsed["proxies"] as any[]) || []) {
      const name = proxy["name"] as string;
      const type = proxy["type"] as "tcp" | "udp";
      const localIp = proxy["localIp"] as string;
      const localPort = Number(proxy["localPort"]);
      const remotePort = Number(proxy["remotePort"]);
      proxies.push(
        new FPRCProxyConfig(name, type, localIp, localPort, remotePort)
      );
    }

    return new FRPCConfig(serverAddr, serverPort, proxies);
  }

  toTOML(): string {
    const tomlObject: any = {
      serverAddr: this.serverAddr,
      serverPort: this.serverPort,
      proxies: this.proxies.map((proxy) => ({
        name: proxy.name,
        type: proxy.type,
        localIp: proxy.localIp,
        localPort: proxy.localPort,
        remotePort: proxy.remotePort,
      })),
    };

    return TOMLParser.stringify(tomlObject);
  }
}
