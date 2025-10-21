# SakuraFrp API 客户端使用文档

## 📖 概述

这是一个基于 axios 和 TypeScript 构建的 SakuraFrp API v4 客户端，提供了完整的类型安全接口和便捷的 React Hook。客户端完全基于 SakuraFrp 官方 OpenAPI 规范构建，确保接口的准确性和兼容性。

## 🚀 快速开始

### 安装依赖

确保项目中已安装 axios：

```bash
npm install axios
# 或
yarn add axios
```

### 基础使用

```typescript
import { sakuraFrpApi } from './services/sakuraFrpApiClient';

// 设置 API Token
sakuraFrpApi.setToken('sk-your-api-token-here');

// 检查认证状态
console.log(sakuraFrpApi.isAuthenticated()); // true

// 获取用户信息
try {
  const userInfo = await sakuraFrpApi.getUserInfo();
  console.log('用户信息:', userInfo.data);
} catch (error) {
  console.error('获取失败:', sakuraFrpApi.getErrorMessage(error));
}
```

## 🔧 API 客户端详细用法

### 初始化和配置

```typescript
import { SakuraFrpApiClient } from './services/sakuraFrpApiClient';

// 使用默认配置
const api = new SakuraFrpApiClient();

// 自定义配置
const customApi = new SakuraFrpApiClient(
  'https://api.natfrp.com/v4',  // 基础 URL
  15000                          // 超时时间（毫秒）
);

// 设置认证
api.setToken('sk-your-token');
```

### 认证管理

```typescript
// 设置 Token
api.setToken('sk-your-api-token');

// 检查认证状态
if (api.isAuthenticated()) {
  console.log('已认证');
}

// 清除认证
api.clearToken();
```

### 系统信息 API

```typescript
// 获取平台公告（无需认证）
const bulletins = await api.getBulletins();
bulletins.data.forEach(bulletin => {
  console.log(`${bulletin.icon} ${bulletin.title}: ${bulletin.content}`);
});

// 获取客户端软件信息
const clients = await api.getClients(true); // true 表示包含下载链接
console.log('最新版本:', clients.data.windows?.ver);

// 获取服务条款
const tos = await api.getPolicy('tos');
console.log('服务条款:', tos.data.content);
```

### 用户信息 API

```typescript
// 获取用户基本信息
const userInfo = await api.getUserInfo();
console.log(`用户: ${userInfo.data.username} (ID: ${userInfo.data.id})`);

// 获取流量包信息
const dataPlans = await api.getDataPlans('valid'); // 'valid' | 'invalid' | 'all'
dataPlans.data.forEach(plan => {
  console.log(`流量包: ${plan.name}, 剩余: ${plan.traffic - plan.used}MB`);
});
```

### 节点管理 API

```typescript
// 获取节点列表
const nodes = await api.getNodes();
console.log(`共有 ${nodes.data.length} 个节点`);

// 筛选可用节点
const availableNodes = nodes.data.filter(node => (node.flag & (1 << 2)) !== 0);
console.log(`可用节点: ${availableNodes.length} 个`);

// 获取节点状态
const nodeStats = await api.getNodeStats();
const onlineNodes = nodeStats.data.nodes.filter(node => node.online >= 0);
console.log(`在线节点: ${onlineNodes.length} / ${nodeStats.data.nodes.length}`);
```

### 隧道管理 API

```typescript
// 获取隧道列表
const tunnels = await api.getTunnels();
console.log(`当前隧道数量: ${tunnels.data.length}`);

// 创建 TCP 隧道
const newTunnel = await api.createTunnel({
  name: 'Minecraft服务器',
  type: 'tcp',
  node: 1,
  local_ip: '127.0.0.1',
  local_port: 25565,
  note: 'MC服务器隧道'
});
console.log(`隧道创建成功，ID: ${newTunnel.data.id}`);

// 创建 HTTP 隧道
const httpTunnel = await api.createTunnel({
  name: '网站隧道',
  type: 'http',
  node: 1,
  local_ip: '127.0.0.1',
  local_port: 80,
  remote: 'my-website.example.com'
});

// 编辑隧道
await api.editTunnel({
  id: newTunnel.data.id,
  note: '更新后的备注',
  local_port: 25566
});

// 获取隧道配置文件
const config = await api.getTunnelConfig({
  query: `${newTunnel.data.id}`, // 可以是多个隧道ID，用逗号分隔
  frpc: '0.51.0-sakura-7.2'      // frpc 版本
});
console.log('配置文件内容:', config.data);

// 删除隧道
await api.deleteTunnel(newTunnel.data.id);
```

### 错误处理

```typescript
import { SakuraFrpApiClient } from './services/sakuraFrpApiClient';

try {
  const result = await api.getUserInfo();
  console.log(result.data);
} catch (error) {
  // 使用静态方法获取错误信息
  const message = SakuraFrpApiClient.getErrorMessage(error);
  console.error('API 调用失败:', message);
  
  // 检查是否是 API 错误
  if (SakuraFrpApiClient.isApiError(error)) {
    console.error('服务器错误:', error.response.data.error);
  }
}
```

## ⚛️ React Hook 使用指南

### 基础用法

```typescript
import React from 'react';
import useSakuraFrpApi from './hooks/useSakuraFrpApi';

function Dashboard() {
  const {
    isAuthenticated,
    setToken,
    clearToken,
    userInfo,
    getUserInfo,
    tunnels,
    getTunnels,
    nodes,
    getNodes,
    refreshAll
  } = useSakuraFrpApi();

  // 登录处理
  const handleLogin = (token: string) => {
    setToken(token);
    // Hook 会自动刷新数据
  };

  // 登出处理
  const handleLogout = () => {
    clearToken();
    // Hook 会自动清空所有数据
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div>
      <h1>控制面板</h1>
      
      {/* 用户信息 */}
      <section>
        <h2>用户信息</h2>
        {userInfo.loading && <p>加载中...</p>}
        {userInfo.error && <p>错误: {userInfo.error}</p>}
        {userInfo.data && (
          <div>
            <p>用户名: {userInfo.data.username}</p>
            <p>邮箱: {userInfo.data.email}</p>
          </div>
        )}
        <button onClick={getUserInfo}>刷新用户信息</button>
      </section>

      {/* 隧道列表 */}
      <section>
        <h2>隧道管理</h2>
        {tunnels.loading && <p>加载中...</p>}
        {tunnels.error && <p>错误: {tunnels.error}</p>}
        {tunnels.data && (
          <div>
            <p>隧道数量: {tunnels.data.length}</p>
            {tunnels.data.map(tunnel => (
              <div key={tunnel.id}>
                <strong>{tunnel.name}</strong> ({tunnel.type})
                <p>本地: {tunnel.local_ip}:{tunnel.local_port}</p>
              </div>
            ))}
          </div>
        )}
        <button onClick={getTunnels}>刷新隧道列表</button>
      </section>

      {/* 控制按钮 */}
      <div>
        <button onClick={refreshAll}>刷新所有数据</button>
        <button onClick={handleLogout}>登出</button>
      </div>
    </div>
  );
}
```

### 高级用法

```typescript
function TunnelManager() {
  const {
    nodes,
    getNodes,
    tunnels,
    createTunnel,
    deleteTunnel,
    editTunnel
  } = useSakuraFrpApi();

  const [newTunnelData, setNewTunnelData] = useState({
    name: '',
    type: 'tcp' as const,
    node: 0,
    local_ip: '127.0.0.1',
    local_port: 25565
  });

  // 创建隧道
  const handleCreateTunnel = async () => {
    const result = await createTunnel(newTunnelData);
    if (result) {
      alert(`隧道创建成功！ID: ${result.id}`);
      setNewTunnelData(prev => ({ ...prev, name: '', node: 0 }));
    } else {
      alert('隧道创建失败');
    }
  };

  // 删除隧道
  const handleDeleteTunnel = async (id: number) => {
    if (confirm('确定要删除这个隧道吗？')) {
      const success = await deleteTunnel(id);
      if (success) {
        alert('隧道删除成功');
      } else {
        alert('隧道删除失败');
      }
    }
  };

  return (
    <div>
      {/* 创建隧道表单 */}
      <form onSubmit={(e) => { e.preventDefault(); handleCreateTunnel(); }}>
        <input
          type="text"
          placeholder="隧道名称"
          value={newTunnelData.name}
          onChange={(e) => setNewTunnelData(prev => ({ ...prev, name: e.target.value }))}
        />
        
        <select
          value={newTunnelData.node}
          onChange={(e) => setNewTunnelData(prev => ({ ...prev, node: parseInt(e.target.value) }))}
        >
          <option value={0}>选择节点</option>
          {nodes.data?.map(node => (
            <option key={node.id} value={node.id}>
              {node.name} - {node.host}
            </option>
          ))}
        </select>
        
        <button type="submit" disabled={!newTunnelData.name || !newTunnelData.node}>
          创建隧道
        </button>
      </form>

      {/* 隧道列表 */}
      <div>
        {tunnels.data?.map(tunnel => (
          <div key={tunnel.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
            <h3>{tunnel.name}</h3>
            <p>类型: {tunnel.type}</p>
            <p>节点: {tunnel.node}</p>
            <p>本地地址: {tunnel.local_ip}:{tunnel.local_port}</p>
            {tunnel.remote && <p>远程地址: {tunnel.remote}</p>}
            <button onClick={() => handleDeleteTunnel(tunnel.id)}>删除</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 📝 类型定义参考

### 隧道类型

```typescript
// 隧道类型枚举
type TunnelType = 'tcp' | 'udp' | 'http' | 'https' | 'wol' | 'etcp' | 'eudp';

// 隧道对象
interface Tunnel {
  id: number;
  name: string;
  type: TunnelType;
  node: number;
  local_ip: string;
  local_port: number;
  remote?: string;      // HTTP/HTTPS 隧道的绑定域名
  note?: string;        // 备注信息
  extra?: string;       // 额外配置
  status?: string;      // 隧道状态
}

// 创建隧道请求
interface CreateTunnelRequest {
  name: string;         // 隧道名称
  type: TunnelType;     // 隧道类型
  node: number;         // 节点 ID
  note?: string;        // 备注
  extra?: string;       // 额外配置
  local_ip?: string;    // 本地 IP，默认 127.0.0.1
  local_port?: number;  // 本地端口
  remote?: string;      // 远程信息（HTTP/HTTPS 必填）
}
```

### 节点类型

```typescript
interface Node {
  id: number;
  name: string;         // 节点名称
  host: string;         // 节点地址
  description: string;  // 节点说明
  vip: number;          // VIP 等级
  flag: number;         // 节点标志位
}

// 节点标志位说明
// flag & 0b11: 允许 HTTP 隧道
// flag & (1 << 2): 允许创建隧道
// flag & (1 << 3): 是否为内地节点
// flag & (1 << 4): 是否为无防节点
// flag & (1 << 5): 允许 UDP 流量
// flag & (1 << 6): 是否为私有节点
// flag & (1 << 9): 是否离线
// flag & (1 << 10): 是否为 BETA 节点
```

### 用户信息类型

```typescript
interface UserInfo {
  id: number;
  username: string;
  email: string;
  // 更多字段请参考实际 API 响应
}

interface DataPlan {
  id: number;
  name: string;
  traffic: number;      // 总流量 (MB)
  used: number;         // 已用流量 (MB)
  status: string;       // 状态
  // 更多字段请参考实际 API 响应
}
```

## 🛠️ 高级配置

### 自定义拦截器

```typescript
import { SakuraFrpApiClient } from './services/sakuraFrpApiClient';

const api = new SakuraFrpApiClient();

// 添加请求日志
api.axiosInstance.interceptors.request.use(config => {
  console.log(`发送请求: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// 添加响应处理
api.axiosInstance.interceptors.response.use(
  response => {
    console.log(`请求成功: ${response.status}`);
    return response;
  },
  error => {
    console.error(`请求失败: ${error.message}`);
    return Promise.reject(error);
  }
);
```

### 批量操作

```typescript
// 批量创建隧道
const tunnelConfigs = [
  { name: 'MC服务器', type: 'tcp', node: 1, local_port: 25565 },
  { name: 'Web服务器', type: 'http', node: 1, local_port: 80, remote: 'my-site.com' },
  { name: 'SSH服务器', type: 'tcp', node: 1, local_port: 22 }
];

const createMultipleTunnels = async () => {
  const results = await Promise.allSettled(
    tunnelConfigs.map(config => api.createTunnel(config))
  );
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`隧道 ${tunnelConfigs[index].name} 创建成功`);
    } else {
      console.error(`隧道 ${tunnelConfigs[index].name} 创建失败:`, result.reason);
    }
  });
};
```

## ⚠️ 注意事项

### API 限制

1. **认证要求**: 除系统信息外，其他 API 都需要有效的 API Token
2. **权限控制**: 部分操作需要特定的用户权限
3. **频率限制**: API 可能有调用频率限制，请合理控制请求频率
4. **配额限制**: 隧道创建受用户配额限制

### 最佳实践

1. **错误处理**: 始终使用 try-catch 包装 API 调用
2. **加载状态**: 在 UI 中显示加载状态，提升用户体验
3. **数据缓存**: 利用 Hook 的状态管理减少不必要的 API 调用
4. **安全性**: 不要在客户端代码中硬编码 API Token

### 常见问题

**Q: 如何处理 Token 过期？**
A: 客户端会自动检测 401 错误并清除无效 Token，你需要提示用户重新登录。

**Q: 如何处理网络错误？**
A: 使用 `SakuraFrpApiClient.getErrorMessage()` 获取友好的错误信息。

**Q: 如何实现自动重试？**
A: 可以通过 axios 的拦截器或第三方库实现重试机制。

## 📄 许可证

本项目遵循 MIT 许可证。SakuraFrp API 使用请遵守其服务条款。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个客户端！