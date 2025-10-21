import React, { useState } from 'react';
import useSakuraFrpApi from '../hooks/useSakuraFrpApi';
import { CreateTunnelRequest } from '../services/sakuraFrpApiClient';

/**
 * SakuraFrp API 客户端示例组件
 * 
 * 这个组件展示了如何使用 SakuraFrp API 客户端进行各种操作
 * 目前暂时不投入使用，仅作为参考和测试
 */
const SakuraFrpApiDemo: React.FC = () => {
  const {
    // 认证相关
    isAuthenticated,
    setToken,
    clearToken,

    // 系统信息
    bulletins,
    getBulletins,
    nodes,
    getNodes,
    nodeStats,
    getNodeStats,

    // 用户信息
    userInfo,
    getUserInfo,
    dataPlans,
    getDataPlans,

    // 隧道管理
    tunnels,
    getTunnels,
    createTunnel,
    // editTunnel,
    deleteTunnel,
    // lockTunnel,

    // 通用操作
    refreshAll,
    clearAllErrors,
  } = useSakuraFrpApi();

  const [apiToken, setApiToken] = useState('');
  const [newTunnel, setNewTunnel] = useState<CreateTunnelRequest>({
    name: '',
    type: 'tcp',
    node: 0,
    local_ip: '127.0.0.1',
    local_port: 25565,
    note: '',
  });

  // 处理登录
  const handleLogin = () => {
    if (apiToken.trim()) {
      setToken(apiToken.trim());
    }
  };

  // 处理登出
  const handleLogout = () => {
    clearToken();
    setApiToken('');
  };

  // 处理创建隧道
  const handleCreateTunnel = async () => {
    if (newTunnel.name && newTunnel.node > 0) {
      const result = await createTunnel(newTunnel);
      if (result) {
        alert(`隧道创建成功！ID: ${result.id}`);
        // 重置表单
        setNewTunnel({
          name: '',
          type: 'tcp',
          node: 0,
          local_ip: '127.0.0.1',
          local_port: 25565,
          note: '',
        });
      } else {
        alert('隧道创建失败');
      }
    }
  };

  // 处理删除隧道
  const handleDeleteTunnel = async (id: number) => {
    if (confirm(`确定要删除隧道 ${id} 吗？`)) {
      const success = await deleteTunnel(id);
      if (success) {
        alert('隧道删除成功');
      } else {
        alert('隧道删除失败');
      }
    }
  };

  return (
    <div className="sakura-frp-demo" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>SakuraFrp API 客户端示例</h1>
      
      {/* 认证部分 */}
      <div className="auth-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>认证</h2>
        <p>状态: {isAuthenticated ? '已认证' : '未认证'}</p>
        
        {!isAuthenticated ? (
          <div>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="输入 API Token"
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={handleLogin} style={{ padding: '5px 10px' }}>
              登录
            </button>
          </div>
        ) : (
          <div>
            <button onClick={handleLogout} style={{ padding: '5px 10px' }}>
              登出
            </button>
            <button onClick={refreshAll} style={{ marginLeft: '10px', padding: '5px 10px' }}>
              刷新所有数据
            </button>
            <button onClick={clearAllErrors} style={{ marginLeft: '10px', padding: '5px 10px' }}>
              清除所有错误
            </button>
          </div>
        )}
      </div>

      {/* 系统信息部分 */}
      <div className="system-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
        <h2>系统信息</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button onClick={getBulletins} disabled={bulletins.loading}>
            {bulletins.loading ? '加载中...' : '获取公告'}
          </button>
          {bulletins.error && <p style={{ color: 'red' }}>错误: {bulletins.error}</p>}
          {bulletins.data && (
            <div>
              <h4>平台公告 ({bulletins.data.length} 条)</h4>
              {bulletins.data.slice(0, 3).map((bulletin, index) => (
                <div key={index} style={{ padding: '10px', border: '1px solid #eee', margin: '5px 0' }}>
                  <strong>{bulletin.icon} {bulletin.title}</strong>
                  <p>{bulletin.content}</p>
                  <small>{bulletin.time}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button onClick={getNodes} disabled={nodes.loading}>
            {nodes.loading ? '加载中...' : '获取节点列表'}
          </button>
          {nodes.error && <p style={{ color: 'red' }}>错误: {nodes.error}</p>}
          {nodes.data && (
            <div>
              <h4>节点列表 ({nodes.data.length} 个)</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {nodes.data.slice(0, 5).map((node) => (
                  <div key={node.id} style={{ padding: '5px', border: '1px solid #eee', margin: '2px 0' }}>
                    <strong>#{node.id} {node.name}</strong> - {node.host}
                    <br />
                    <small>{node.description}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <button onClick={getNodeStats} disabled={nodeStats.loading}>
            {nodeStats.loading ? '加载中...' : '获取节点状态'}
          </button>
          {nodeStats.error && <p style={{ color: 'red' }}>错误: {nodeStats.error}</p>}
          {nodeStats.data && (
            <div>
              <h4>节点状态 (更新时间: {new Date(nodeStats.data.time * 1000).toLocaleString()})</h4>
              <p>在线节点: {nodeStats.data.nodes.filter(n => n.online >= 0).length} / {nodeStats.data.nodes.length}</p>
            </div>
          )}
        </div>
      </div>

      {/* 用户信息部分 - 需要认证 */}
      {isAuthenticated && (
        <div className="user-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
          <h2>用户信息</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <button onClick={getUserInfo} disabled={userInfo.loading}>
              {userInfo.loading ? '加载中...' : '获取用户信息'}
            </button>
            {userInfo.error && <p style={{ color: 'red' }}>错误: {userInfo.error}</p>}
            {userInfo.data && (
              <div>
                <h4>用户信息</h4>
                <p>用户名: {userInfo.data.username}</p>
                <p>邮箱: {userInfo.data.email}</p>
                <p>ID: {userInfo.data.id}</p>
              </div>
            )}
          </div>

          <div>
            <button onClick={() => getDataPlans('valid')} disabled={dataPlans.loading}>
              {dataPlans.loading ? '加载中...' : '获取流量包'}
            </button>
            {dataPlans.error && <p style={{ color: 'red' }}>错误: {dataPlans.error}</p>}
            {dataPlans.data && (
              <div>
                <h4>流量包 ({dataPlans.data.length} 个)</h4>
                {dataPlans.data.map((plan) => (
                  <div key={plan.id} style={{ padding: '5px', border: '1px solid #eee', margin: '2px 0' }}>
                    <strong>{plan.name}</strong> - 状态: {plan.status}
                    <br />
                    <small>流量: {plan.used} / {plan.traffic}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 隧道管理部分 - 需要认证 */}
      {isAuthenticated && (
        <div className="tunnel-section" style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc' }}>
          <h2>隧道管理</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <button onClick={getTunnels} disabled={tunnels.loading}>
              {tunnels.loading ? '加载中...' : '获取隧道列表'}
            </button>
            {tunnels.error && <p style={{ color: 'red' }}>错误: {tunnels.error}</p>}
            {tunnels.data && (
              <div>
                <h4>隧道列表 ({tunnels.data.length} 个)</h4>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {tunnels.data.map((tunnel) => (
                    <div key={tunnel.id} style={{ padding: '10px', border: '1px solid #eee', margin: '5px 0' }}>
                      <strong>#{tunnel.id} {tunnel.name}</strong> ({tunnel.type})
                      <br />
                      <small>
                        节点: {tunnel.node} | 本地: {tunnel.local_ip}:{tunnel.local_port}
                        {tunnel.remote && ` | 远程: ${tunnel.remote}`}
                      </small>
                      <br />
                      <button 
                        onClick={() => handleDeleteTunnel(tunnel.id)}
                        style={{ marginTop: '5px', padding: '2px 8px', fontSize: '12px' }}
                      >
                        删除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h4>创建新隧道</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                placeholder="隧道名称"
                value={newTunnel.name}
                onChange={(e) => setNewTunnel({ ...newTunnel, name: e.target.value })}
              />
              <select
                value={newTunnel.type}
                onChange={(e) => setNewTunnel({ ...newTunnel, type: e.target.value as any })}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="http">HTTP</option>
                <option value="https">HTTPS</option>
              </select>
              <input
                type="number"
                placeholder="节点 ID"
                value={newTunnel.node || ''}
                onChange={(e) => setNewTunnel({ ...newTunnel, node: parseInt(e.target.value) || 0 })}
              />
              <input
                type="text"
                placeholder="本地 IP"
                value={newTunnel.local_ip}
                onChange={(e) => setNewTunnel({ ...newTunnel, local_ip: e.target.value })}
              />
              <input
                type="number"
                placeholder="本地端口"
                value={newTunnel.local_port || ''}
                onChange={(e) => setNewTunnel({ ...newTunnel, local_port: parseInt(e.target.value) || 0 })}
              />
              <input
                type="text"
                placeholder="备注"
                value={newTunnel.note}
                onChange={(e) => setNewTunnel({ ...newTunnel, note: e.target.value })}
              />
            </div>
            <button onClick={handleCreateTunnel} style={{ padding: '10px 20px' }}>
              创建隧道
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SakuraFrpApiDemo;