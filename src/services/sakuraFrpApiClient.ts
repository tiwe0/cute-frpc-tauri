import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 基础响应类型
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

// 用户信息类型
interface UserInfo {
  id: number;
  username: string;
  email: string;
  // 根据实际 schema 定义补充更多字段
}

// 流量包类型
interface DataPlan {
  id: number;
  name: string;
  traffic: number;
  used: number;
  status: string;
  // 根据实际 schema 定义补充更多字段
}

// 节点信息类型
interface Node {
  id: number;
  name: string;
  host: string;
  description: string;
  vip: number;
  flag: number;
}

// 节点状态类型
interface NodeStats {
  time: number;
  nodes: Array<{
    id: number;
    online: number;
    uptime: number;
    load: number;
  }>;
}

// 隧道类型
interface Tunnel {
  id: number;
  name: string;
  type: 'tcp' | 'udp' | 'http' | 'https' | 'wol' | 'etcp' | 'eudp';
  node: number;
  local_ip: string;
  local_port: number;
  remote?: string;
  note?: string;
  extra?: string;
  status?: string;
  // 根据实际 schema 定义补充更多字段
}

// 创建隧道请求参数
interface CreateTunnelRequest {
  name: string;
  type: 'tcp' | 'udp' | 'http' | 'https' | 'wol' | 'etcp' | 'eudp';
  node: number;
  note?: string;
  extra?: string;
  local_ip?: string;
  local_port?: number;
  remote?: string;
}

// 编辑隧道请求参数
interface EditTunnelRequest {
  id: number;
  note?: string;
  local_ip?: string;
  local_port?: number;
  extra?: string;
}

// 隧道配置请求参数
interface TunnelConfigRequest {
  query: string;
  frpc: string;
}

// 公告类型
interface Bulletin {
  title: string;
  content: string;
  icon: string;
  time: string;
  expand: boolean;
}

// 客户端软件信息类型
interface ClientInfo {
  [category: string]: {
    ver: string;
    time: number;
    note?: string;
    archs?: {
      [arch: string]: {
        title: string;
        url: string;
        hash: string;
        size: number;
      };
    };
  };
}

// 策略类型
interface Policy {
  alert?: string;
  updated?: string;
  content: string;
}

export class SakuraFrpApiClient {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;

  constructor(baseURL: string = 'https://api.natfrp.com/v4', timeout: number = 10000) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout
    });

    // 请求拦截器 - 添加认证token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 处理错误
    this.axiosInstance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token过期或无效，清除token
          this.token = null;
        }
        return Promise.reject(error);
      }
    );
  }

  // 设置认证token
  setToken(token: string): void {
    this.token = token;
  }

  // 清除认证token
  clearToken(): void {
    this.token = null;
  }

  // 检查是否已认证
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // 系统信息相关API
  async getBulletins(): Promise<ApiResponse<Bulletin[]>> {
    const response: AxiosResponse<Bulletin[]> = await this.axiosInstance.get('/system/bulletin');
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getClients(download: boolean = false): Promise<ApiResponse<ClientInfo>> {
    const response: AxiosResponse<ClientInfo> = await this.axiosInstance.get('/system/clients', {
      params: { download },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getPolicy(type: 'tos' | 'content' | 'privacy' | 'rule' | 'refund'): Promise<ApiResponse<Policy>> {
    const response: AxiosResponse<Policy> = await this.axiosInstance.get('/system/policy', {
      params: { type },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // 用户信息相关API
  async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    const response: AxiosResponse<UserInfo> = await this.axiosInstance.get('/user/info');
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getDataPlans(status: 'valid' | 'invalid' | 'all' = 'valid'): Promise<ApiResponse<DataPlan[]>> {
    const response: AxiosResponse<DataPlan[]> = await this.axiosInstance.get('/user/data_plans', {
      params: { status },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // 节点管理相关API
  async getNodes(): Promise<ApiResponse<Node[]>> {
    const response: AxiosResponse<Node[]> = await this.axiosInstance.get('/nodes');
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getNodeStats(): Promise<ApiResponse<NodeStats>> {
    const response: AxiosResponse<NodeStats> = await this.axiosInstance.get('/node/stats');
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // 隧道管理相关API
  async getTunnels(): Promise<ApiResponse<Tunnel[]>> {
    const response: AxiosResponse<Tunnel[]> = await this.axiosInstance.get('/tunnels');
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async createTunnel(tunnelData: CreateTunnelRequest): Promise<ApiResponse<{ id: number; name: string; remote?: string }>> {
    const response = await this.axiosInstance.post('/tunnels', tunnelData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async getTunnelConfig(configData: TunnelConfigRequest): Promise<ApiResponse<string>> {
    const response: AxiosResponse<string> = await this.axiosInstance.post('/tunnel/config', configData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      responseType: 'text',
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async editTunnel(editData: EditTunnelRequest): Promise<ApiResponse<{ extra: string }>> {
    const response = await this.axiosInstance.post('/tunnel/edit', editData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async lockTunnel(id: number, edit?: boolean): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.post('/tunnel/lock', { id, edit }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  async deleteTunnel(id: number): Promise<ApiResponse<any>> {
    const response = await this.axiosInstance.post('/tunnel/delete', { id }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // 通用请求方法
  async request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response: AxiosResponse<T> = await this.axiosInstance.request(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  // 错误处理辅助方法
  static isApiError(error: any): error is { response: { data: ErrorResponse } } {
    return error.response && error.response.data && typeof error.response.data.error === 'string';
  }

  static getErrorMessage(error: any): string {
    if (this.isApiError(error)) {
      return error.response.data.message || error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return '未知错误';
  }
}

// 创建单例实例
export const sakuraFrpApi = new SakuraFrpApiClient();

// 导出类型定义
export type {
  ApiResponse,
  ErrorResponse,
  UserInfo,
  DataPlan,
  Node,
  NodeStats,
  Tunnel,
  CreateTunnelRequest,
  EditTunnelRequest,
  TunnelConfigRequest,
  Bulletin,
  ClientInfo,
  Policy,
};