# SakuraFrp API 客户端

基于 OpenAPI 规范和 axios 库构建的 SakuraFrp API 客户端组件，提供类型安全的 API 调用接口。

## 功能特性

- 🔐 **认证管理**: 支持 Bearer Token 认证
- 📡 **完整的 API 覆盖**: 涵盖系统信息、用户管理、节点管理、隧道管理等所有API
- 🎯 **TypeScript 支持**: 完整的类型定义和智能提示
- 🔄 **自动重试**: 内置错误处理和重试机制
- 📱 **React Hook**: 提供开箱即用的 React Hook
- 🛡️ **类型安全**: 基于 OpenAPI 规范的严格类型检查

## 文件结构

```
src/
├── services/
│   └── sakuraFrpApiClient.ts    # API 客户端核心类
├── hooks/
│   └── useSakuraFrpApi.ts       # React Hook
├── components/
│   └── SakuraFrpApiDemo.tsx     # 示例组件
└── openapi.yaml                 # OpenAPI 规范文件
```

## 基础用法

### 1. 直接使用 API 客户端

```typescript
import { sakuraFrpApi } from '../services/sakuraFrpApiClient';

// 设置认证token
sakuraFrpApi.setToken('your-api-token');

// 获取用户信息
const userInfo = await sakuraFrpApi.getUserInfo();
console.log(userInfo.data);

// 获取隧道列表
const tunnels = await sakuraFrpApi.getTunnels();
console.log(tunnels.data);

// 创建隧道
const newTunnel = await sakuraFrpApi.createTunnel({
  name: 'MyTunnel',
  type: 'tcp',
  node: 1,
  local_ip: '127.0.0.1',
  local_port: 25565
});
```

### 2. 使用 React Hook

```typescript
import useSakuraFrpApi from '../hooks/useSakuraFrpApi';

function MyComponent() {
  const {
    isAuthenticated,
    setToken,
    userInfo,
    getUserInfo,
    tunnels,
    getTunnels,
    createTunnel
  } = useSakuraFrpApi();

  // 登录
  const handleLogin = () => {
    setToken('your-api-token');
  };

  // 获取数据
  const handleLoadData = async () => {
    await getUserInfo();
    await getTunnels();
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleLogin}>登录</button>
      ) : (
        <div>
          <button onClick={handleLoadData}>加载数据</button>
          {userInfo.data && <p>用户: {userInfo.data.username}</p>}
          {tunnels.data && <p>隧道数量: {tunnels.data.length}</p>}
        </div>
      )}
    </div>
  );
}
```

## API 接口说明

### 认证管理

```typescript
// 设置token
setToken(token: string): void

// 清除token
clearToken(): void

// 检查认证状态
isAuthenticated(): boolean
```

### 系统信息

```typescript
// 获取平台公告
getBulletins(): Promise<ApiResponse<Bulletin[]>>

// 获取客户端软件信息
getClients(download?: boolean): Promise<ApiResponse<ClientInfo>>

// 获取服务条款和策略
getPolicy(type: 'tos' | 'content' | 'privacy' | 'rule' | 'refund'): Promise<ApiResponse<Policy>>
```

### 用户信息

```typescript
// 获取用户基本信息
getUserInfo(): Promise<ApiResponse<UserInfo>>

// 获取用户流量包
getDataPlans(status?: 'valid' | 'invalid' | 'all'): Promise<ApiResponse<DataPlan[]>>
```

### 节点管理

```typescript
// 获取节点列表
getNodes(): Promise<ApiResponse<Node[]>>

// 获取节点状态
getNodeStats(): Promise<ApiResponse<NodeStats>>
```

### 隧道管理

```typescript
// 获取隧道列表
getTunnels(): Promise<ApiResponse<Tunnel[]>>

// 创建隧道
createTunnel(tunnelData: CreateTunnelRequest): Promise<ApiResponse<{id: number; name: string; remote?: string}>>

// 编辑隧道
editTunnel(editData: EditTunnelRequest): Promise<ApiResponse<{extra: string}>>

// 删除隧道
deleteTunnel(id: number): Promise<ApiResponse<any>>

// 锁定隧道
lockTunnel(id: number, edit?: boolean): Promise<ApiResponse<any>>

// 获取隧道配置
getTunnelConfig(configData: TunnelConfigRequest): Promise<ApiResponse<string>>
```

## 类型定义

### 隧道相关类型

```typescript
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
}

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
```

### 节点相关类型

```typescript
interface Node {
  id: number;
  name: string;
  host: string;
  description: string;
  vip: number;
  flag: number;
}

interface NodeStats {
  time: number;
  nodes: Array<{
    id: number;
    online: number;
    uptime: number;
    load: number;
  }>;
}
```

## 错误处理

### 1. 使用静态方法处理错误

```typescript
try {
  const response = await sakuraFrpApi.getUserInfo();
} catch (error) {
  const message = SakuraFrpApiClient.getErrorMessage(error);
  console.error('获取用户信息失败:', message);
}
```

### 2. Hook 中的错误处理

```typescript
const { userInfo } = useSakuraFrpApi();

if (userInfo.error) {
  console.error('用户信息错误:', userInfo.error);
}

if (userInfo.loading) {
  console.log('正在加载用户信息...');
}
```

## 配置选项

### 自定义 API 客户端

```typescript
const customApi = new SakuraFrpApiClient(
  'https://api.natfrp.com/v4',  // 自定义基础URL
  15000                          // 自定义超时时间(毫秒)
);
```

### 拦截器配置

客户端已内置请求和响应拦截器：

- **请求拦截器**: 自动添加 Authorization header
- **响应拦截器**: 自动处理401错误并清除无效token

## 示例组件

查看 `SakuraFrpApiDemo.tsx` 获取完整的使用示例，包括：

- 认证流程
- 数据获取
- 隧道创建和管理
- 错误处理
- 加载状态

## 注意事项

1. **认证**: 大部分API需要有效的 SakuraFrp API Token
2. **权限**: 某些操作需要特定的用户权限
3. **频率限制**: 请注意API的调用频率限制
4. **错误处理**: 始终处理可能的网络错误和API错误
5. **类型安全**: 利用TypeScript的类型检查确保代码质量

## 开发说明

这个组件目前暂时不投入使用，主要用于：

- 学习和理解 SakuraFrp API 结构
- 为未来可能的集成做准备
- 提供 API 调用的最佳实践示例

如需在项目中使用，请确保：

1. 有效的 SakuraFrp API Token
2. 正确的错误处理逻辑
3. 适当的用户界面集成
4. 符合 SakuraFrp 的使用条款