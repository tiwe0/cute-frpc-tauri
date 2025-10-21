import { useState, useCallback, useEffect } from 'react';
import { 
  sakuraFrpApi, 
  SakuraFrpApiClient,
  ApiResponse,
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
} from '../services/sakuraFrpApiClient';

// API状态接口
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Hook返回值接口
interface UseSakuraFrpApiReturn {
  // 认证相关
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;

  // 系统信息
  bulletins: ApiState<Bulletin[]>;
  getBulletins: () => Promise<void>;
  
  clients: ApiState<ClientInfo>;
  getClients: (download?: boolean) => Promise<void>;
  
  policy: ApiState<Policy>;
  getPolicy: (type: 'tos' | 'content' | 'privacy' | 'rule' | 'refund') => Promise<void>;

  // 用户信息
  userInfo: ApiState<UserInfo>;
  getUserInfo: () => Promise<void>;
  
  dataPlans: ApiState<DataPlan[]>;
  getDataPlans: (status?: 'valid' | 'invalid' | 'all') => Promise<void>;

  // 节点管理
  nodes: ApiState<Node[]>;
  getNodes: () => Promise<void>;
  
  nodeStats: ApiState<NodeStats>;
  getNodeStats: () => Promise<void>;

  // 隧道管理
  tunnels: ApiState<Tunnel[]>;
  getTunnels: () => Promise<void>;
  
  createTunnel: (tunnelData: CreateTunnelRequest) => Promise<{ id: number; name: string; remote?: string } | null>;
  editTunnel: (editData: EditTunnelRequest) => Promise<{ extra: string } | null>;
  deleteTunnel: (id: number) => Promise<boolean>;
  lockTunnel: (id: number, edit?: boolean) => Promise<boolean>;
  
  tunnelConfig: ApiState<string>;
  getTunnelConfig: (configData: TunnelConfigRequest) => Promise<void>;

  // 通用操作
  refreshAll: () => Promise<void>;
  clearAllErrors: () => void;
}

// 创建初始状态
const createInitialState = <T>(): ApiState<T> => ({
  data: null,
  loading: false,
  error: null,
});

export const useSakuraFrpApi = (): UseSakuraFrpApiReturn => {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(sakuraFrpApi.isAuthenticated());

  // 各种API状态
  const [bulletins, setBulletins] = useState<ApiState<Bulletin[]>>(createInitialState);
  const [clients, setClients] = useState<ApiState<ClientInfo>>(createInitialState);
  const [policy, setPolicy] = useState<ApiState<Policy>>(createInitialState);
  const [userInfo, setUserInfo] = useState<ApiState<UserInfo>>(createInitialState);
  const [dataPlans, setDataPlans] = useState<ApiState<DataPlan[]>>(createInitialState);
  const [nodes, setNodes] = useState<ApiState<Node[]>>(createInitialState);
  const [nodeStats, setNodeStats] = useState<ApiState<NodeStats>>(createInitialState);
  const [tunnels, setTunnels] = useState<ApiState<Tunnel[]>>(createInitialState);
  const [tunnelConfig, setTunnelConfig] = useState<ApiState<string>>(createInitialState);

  // 通用错误处理
  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    setState: React.Dispatch<React.SetStateAction<ApiState<T>>>
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      setState(prev => ({ ...prev, data: response.data, loading: false }));
      return response.data;
    } catch (error) {
      const errorMessage = SakuraFrpApiClient.getErrorMessage(error);
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // 认证相关方法
  const setToken = useCallback((token: string) => {
    sakuraFrpApi.setToken(token);
    setIsAuthenticated(true);
  }, []);

  const clearToken = useCallback(() => {
    sakuraFrpApi.clearToken();
    setIsAuthenticated(false);
    // 清除所有数据
    setBulletins(createInitialState);
    setClients(createInitialState);
    setPolicy(createInitialState);
    setUserInfo(createInitialState);
    setDataPlans(createInitialState);
    setNodes(createInitialState);
    setNodeStats(createInitialState);
    setTunnels(createInitialState);
    setTunnelConfig(createInitialState);
  }, []);

  // 系统信息API
  const getBulletins = useCallback(async () => {
    await handleApiCall(() => sakuraFrpApi.getBulletins(), setBulletins);
  }, [handleApiCall]);

  const getClients = useCallback(async (download: boolean = false) => {
    await handleApiCall(() => sakuraFrpApi.getClients(download), setClients);
  }, [handleApiCall]);

  const getPolicy = useCallback(async (type: 'tos' | 'content' | 'privacy' | 'rule' | 'refund') => {
    await handleApiCall(() => sakuraFrpApi.getPolicy(type), setPolicy);
  }, [handleApiCall]);

  // 用户信息API
  const getUserInfo = useCallback(async () => {
    await handleApiCall(() => sakuraFrpApi.getUserInfo(), setUserInfo);
  }, [handleApiCall]);

  const getDataPlans = useCallback(async (status: 'valid' | 'invalid' | 'all' = 'valid') => {
    await handleApiCall(() => sakuraFrpApi.getDataPlans(status), setDataPlans);
  }, [handleApiCall]);

  // 节点管理API
  const getNodes = useCallback(async () => {
    await handleApiCall(() => sakuraFrpApi.getNodes(), setNodes);
  }, [handleApiCall]);

  const getNodeStats = useCallback(async () => {
    await handleApiCall(() => sakuraFrpApi.getNodeStats(), setNodeStats);
  }, [handleApiCall]);

  // 隧道管理API
  const getTunnels = useCallback(async () => {
    await handleApiCall(() => sakuraFrpApi.getTunnels(), setTunnels);
  }, [handleApiCall]);

  const createTunnel = useCallback(async (tunnelData: CreateTunnelRequest) => {
    try {
      const response = await sakuraFrpApi.createTunnel(tunnelData);
      // 创建成功后刷新隧道列表
      await getTunnels();
      return response.data;
    } catch (error) {
      console.error('创建隧道失败:', SakuraFrpApiClient.getErrorMessage(error));
      return null;
    }
  }, [getTunnels]);

  const editTunnel = useCallback(async (editData: EditTunnelRequest) => {
    try {
      const response = await sakuraFrpApi.editTunnel(editData);
      // 编辑成功后刷新隧道列表
      await getTunnels();
      return response.data;
    } catch (error) {
      console.error('编辑隧道失败:', SakuraFrpApiClient.getErrorMessage(error));
      return null;
    }
  }, [getTunnels]);

  const deleteTunnel = useCallback(async (id: number) => {
    try {
      await sakuraFrpApi.deleteTunnel(id);
      // 删除成功后刷新隧道列表
      await getTunnels();
      return true;
    } catch (error) {
      console.error('删除隧道失败:', SakuraFrpApiClient.getErrorMessage(error));
      return false;
    }
  }, [getTunnels]);

  const lockTunnel = useCallback(async (id: number, edit?: boolean) => {
    try {
      await sakuraFrpApi.lockTunnel(id, edit);
      // 锁定成功后刷新隧道列表
      await getTunnels();
      return true;
    } catch (error) {
      console.error('锁定隧道失败:', SakuraFrpApiClient.getErrorMessage(error));
      return false;
    }
  }, [getTunnels]);

  const getTunnelConfig = useCallback(async (configData: TunnelConfigRequest) => {
    await handleApiCall(() => sakuraFrpApi.getTunnelConfig(configData), setTunnelConfig);
  }, [handleApiCall]);

  // 刷新所有数据
  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return;

    const promises: Promise<void>[] = [
      getUserInfo(),
      getDataPlans(),
      getNodes(),
      getNodeStats(),
      getTunnels(),
    ];

    // 系统信息不需要认证，总是可以获取
    promises.push(getBulletins());

    await Promise.allSettled(promises);
  }, [isAuthenticated, getUserInfo, getDataPlans, getNodes, getNodeStats, getTunnels, getBulletins]);

  // 清除所有错误
  const clearAllErrors = useCallback(() => {
    setBulletins(prev => ({ ...prev, error: null }));
    setClients(prev => ({ ...prev, error: null }));
    setPolicy(prev => ({ ...prev, error: null }));
    setUserInfo(prev => ({ ...prev, error: null }));
    setDataPlans(prev => ({ ...prev, error: null }));
    setNodes(prev => ({ ...prev, error: null }));
    setNodeStats(prev => ({ ...prev, error: null }));
    setTunnels(prev => ({ ...prev, error: null }));
    setTunnelConfig(prev => ({ ...prev, error: null }));
  }, []);

  // 当认证状态改变时，自动刷新数据
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated, refreshAll]);

  return {
    // 认证相关
    isAuthenticated,
    setToken,
    clearToken,

    // 系统信息
    bulletins,
    getBulletins,
    clients,
    getClients,
    policy,
    getPolicy,

    // 用户信息
    userInfo,
    getUserInfo,
    dataPlans,
    getDataPlans,

    // 节点管理
    nodes,
    getNodes,
    nodeStats,
    getNodeStats,

    // 隧道管理
    tunnels,
    getTunnels,
    createTunnel,
    editTunnel,
    deleteTunnel,
    lockTunnel,
    tunnelConfig,
    getTunnelConfig,

    // 通用操作
    refreshAll,
    clearAllErrors,
  };
};

export default useSakuraFrpApi;