import "./App.css";
import theGameListData from "./gamelist.json";

import { useState, useEffect, useRef, useCallback } from "react";
import { Child } from "@tauri-apps/plugin-shell";
import { copyFile, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { APP_FRPC_CONFIG_PATH, APP_SAKURA_API_KEY_PATH, APP_GAMELIST_PATH, APP_DEFAULT_GAMELIST_PATH } from "./utils/const";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

// Components
import {
  LoadingScreen,
  LoginScreen,
  BackgroundManager,
  GameSelector,
  Logger,
  ConnectionManager,
  Footer,
  AudioPlayer,
  AdvancedSettingsModal,
} from "./components";

// Hooks
import { useBackgroundTransition } from "./hooks/useBackgroundTransition";
import { useLogger } from "./hooks/useLogger";
import { useSakuraFrpApi } from "./hooks/useSakuraFrpApi";

// Types
import { Game, ConnectionState, FRPCConfig } from "./types";

// Services
import { createFRPCService } from "./services/frpcService";
import { sakuraFrpApi } from "./services/sakuraFrpApiClient";

function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Game state
  const [gameList, setGameList] = useState<Game[]>([]);
  const [gamePort, setGamePort] = useState<number | null>(null);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Connection state
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    connectionStatus: "",
    connectionCompleted: false,
    isAnimating: false,
  });

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [loadingExiting, setLoadingExiting] = useState(false);

  // Advanced settings state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [frpcConfig, setFrpcConfig] = useState<FRPCConfig | null>(null);

  // Audio reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // FRPC process reference
  const FRPCProcessRef = useRef<Child | null>(null);

  // Custom hooks
  const { currentBackground, backgroundTransition, changeBackground, setCurrentBackground } = 
    useBackgroundTransition();
  const { 
    logs, 
    showLogger, 
    loggerAnimating, 
    setShowLogger, 
    setLoggerAnimating, 
    addLog, 
    clearLogs 
  } = useLogger();

  const {
    setToken, getUserInfo
  } = useSakuraFrpApi();

  // Services
  const frpcService = createFRPCService();

  const loadSavedApiKey = async (): Promise<string | null> => {
    if(!(await exists(APP_SAKURA_API_KEY_PATH))) {
      return null;
    }
    try {
      const savedKey = await readTextFile(APP_SAKURA_API_KEY_PATH);
      return savedKey.trim() || null;
    } catch (error) {
      console.error('Failed to read saved API Key:', error);
      return null;
    }
  }

  const saveApiKey = async (apiKey: string) => {
    try {
      await writeTextFile(APP_SAKURA_API_KEY_PATH, apiKey);
      console.log('API Key 已保存');
    } catch (error) {
      console.error('Failed to save API Key:', error);
    }
  }


  // Initialization
  const initConfig = async () => {
    try {
      // 模拟加载时间
      await new Promise(resolve => setTimeout(resolve, 2500));

      // 加载游戏列表
      if (!(await exists(APP_GAMELIST_PATH))) {
        // 如果游戏列表文件不存在，复制默认文件
        await copyFile(APP_DEFAULT_GAMELIST_PATH, APP_GAMELIST_PATH);
        console.log("已复制默认游戏列表到:", APP_GAMELIST_PATH);
      }

      try {
        const gamelistContent = await readTextFile(APP_GAMELIST_PATH);
        const gameList = JSON.parse(gamelistContent);
        setGameList(gameList);
        console.log('游戏列表加载成功:', gameList);
      } catch (gamelistError) {
        console.warn('游戏列表加载失败，使用默认游戏列表:', gamelistError);
        // 设置默认游戏列表
        const defaultGameList = JSON.parse(await readTextFile(APP_DEFAULT_GAMELIST_PATH)) as Game[];
        setGameList(defaultGameList);
      }

      // 加载 FRPC 配置
      try {
        const configContent = await readTextFile(APP_FRPC_CONFIG_PATH);
        const config = FRPCConfig.fromTOML(configContent);
        setFrpcConfig(config);
        console.log('配置加载成功:', config);
      } catch (configError) {
        console.warn('配置加载失败，使用默认配置:', configError);
        // 设置默认配置
        const defaultConfig = new FRPCConfig(
          "frp.example.com",
          7000,
          []
        );
        setFrpcConfig(defaultConfig);
      }
      
      // 开始退出动画
      setLoadingExiting(true);
      
      // 等待退出动画完成后再隐藏加载屏幕、设置默认背景并播放音乐
      setTimeout(() => {
        setIsLoading(false);
        setLoadingExiting(false);
        
        // 播放背景音乐
        if (audioRef.current) {
          audioRef.current.volume = 0.3; // 设置音量为30%
          audioRef.current.play().catch(error => {
            console.log('音乐播放失败，可能需要用户交互:', error);
          });
        }
      }, 600);
    } catch (error) {
      console.error('Failed to initialize config:', error);
      setLoadingExiting(true);
      setTimeout(() => {
        setIsLoading(false);
        setLoadingExiting(false);
        
        // 设置默认背景
        setCurrentBackground("/assets/default.jpg");
        
        // 即使出错也尝试播放音乐
        if (audioRef.current) {
          audioRef.current.volume = 0.3;
          audioRef.current.play().catch(error => {
            console.log('音乐播放失败，可能需要用户交互:', error);
          });
        }
      }, 600);
    }
  };

  // Login handler
  const handleLogin = useCallback(async (apiKey: string) => {
    // 防止重复登录
    if (loginLoading || isAuthenticated) {
      console.log("登录正在进行中或已经认证，跳过此次登录请求");
      return;
    }

    console.log("Attempting login with API Key:", apiKey);
    setLoginLoading(true);
    setLoginError('');

    try {
      // 设置token（同步操作）
      setToken(apiKey);
      
      // 尝试获取用户信息来验证token
      let tries = 0;
      let userInfoResult = null;
      
      do {
        console.log("尝试获取用户信息，次数:", tries + 1);
        try {
          // 直接调用API验证token
          const response = await sakuraFrpApi.getUserInfo();
          userInfoResult = response.data;
          console.log("用户信息获取结果:", userInfoResult);
          
          if (userInfoResult) {
            break; // 成功获取到数据，跳出循环
          }
        } catch (apiError: any) {
          console.error("API调用失败:", apiError);
          // 如果是401错误，说明token无效，直接退出重试循环
          if (apiError.response?.status === 401) {
            console.log("Token无效，停止重试");
            break;
          }
        }
        
        // 网络错误等其他情况，等待后重试
        if (tries < 2) {
          console.log("等待500ms后重试...");
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        tries++;
      } while (tries < 3);
      
      // 验证登录结果
      if (userInfoResult) {
        setIsAuthenticated(true);
        // 登录成功，保存key
        await saveApiKey(apiKey);
        // 刷新Hook状态以同步数据
        await getUserInfo();
        console.log("登录成功，用户信息:", userInfoResult);
        // 登录成功后开始初始化
        initConfig();
      } else {
        setLoginError('无效的 API Key 或网络连接问题，请检查后重试');
      }
    } catch (error) {
      console.error("登录过程中出现错误:", error);
      setLoginError('验证失败，请稍后重试');
    } finally {
      setLoginLoading(false);
    }
  }, [loginLoading, isAuthenticated, setToken, getUserInfo, saveApiKey, initConfig]);

  // Game selection handler
  const handleGameSelect = (game: Game) => {
    setGamePort(game.defaultPort);
    setCurrentGame(game);
    if (game.background) {
      changeBackground(game.background);
    }
  };

  // Advanced settings handlers
  const handleOpenAdvancedSettings = () => {
    setShowAdvancedSettings(true);
  };

  const handleCloseAdvancedSettings = () => {
    setShowAdvancedSettings(false);
  };

  const handleConfigChange = (config: FRPCConfig) => {
    setFrpcConfig(config);
    // 这里可以添加保存配置到文件的逻辑
    console.log('配置已更新:', config);
  };

  const updateSakuraFrpcConfigFile = async () => {
    // 这里从 SakuraFrpAPI 获取最新配置并保存到本地文件
    // 1. 先检查当前用户是否有隧道
    if (!currentGame) { 
      return;
    }
    let tunnelType = currentGame.type;

    let tunnelsResponse = await sakuraFrpApi.getTunnels();
    let tunnelsArray = tunnelsResponse.data.filter(t => t.type === tunnelType);
    if (tunnelsArray.length === 0) {
      // 2. 如果没有隧道，自动申请一个免费隧道
      addLog("无可用隧道，正在申请免费隧道...");
      addLog("查看可用节点...");

      let nodesResponse = await sakuraFrpApi.getNodes();
      let nodesObject = nodesResponse.data;
      let nodes = [];
      for (let key in nodesObject) {
        if (nodesObject[key].flag == 46 && nodesObject[key].vip == 0) {
          nodes.push(Number(key));
        }
      }
      console.log("可用节点列表:", nodes);
      // 随机挑选一个
      let nodeId = nodes[Math.floor(Math.random() * nodes.length)];
      console.log("选择节点:", nodeId);

      let createTunnelResponse = await sakuraFrpApi.createTunnel({
        name: `bluelotus_${tunnelType}`, type: tunnelType, node: nodeId, local_ip: "127.0.0.1", local_port: currentGame.defaultPort
      });
      console.log("隧道创建结果:", createTunnelResponse.data);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待隧道创建稳定
      // 重新获取隧道列表
      let tunnelsResponse = await sakuraFrpApi.getTunnels();
      tunnelsArray = tunnelsResponse.data.filter(t => t.type === tunnelType);
    } else {
      addLog("找到可用隧道，准备使用第一条隧道...");
    }

    let tunnel = tunnelsArray[0];
    // 3. 如果有，那么根据用户配置修改隧道配置并保存
    addLog("修改隧道配置...")
    let frpcEditResponse = await sakuraFrpApi.editTunnel({
      id: tunnel.id, local_ip: "127.0.0.1", local_port: currentGame?.defaultPort
    });
    let frpcEditData = frpcEditResponse.data;
    console.log("隧道编辑结果:", frpcEditData);

    // 4. 从隧道获取frpc配置并保存到 APP_FRPC_CONFIG_PATH
    addLog("获取当前隧道配置文件...");
    let frpcConfigResponse = await sakuraFrpApi.getTunnelConfig({ query: String(tunnel.id), frpc: "0.65.0" })
    let frpcConfigContent = frpcConfigResponse.data;
    await writeTextFile(APP_FRPC_CONFIG_PATH, frpcConfigContent);
    handleConfigChange(FRPCConfig.fromTOML(frpcConfigContent));
    let url = `${frpcConfig?.serverAddr}:${frpcConfig?.proxies[0]?.remotePort}`;
    await writeText(url);
    addLog("已更新本地 FRPC 配置文件");
    addLog(`联机地址已复制到粘贴板: ${url}`);
  }

  // Connection handlers
  const handleConnect = async () => {
    if (!gamePort) return;

    setConnectionState(prev => ({
      ...prev,
      isConnecting: true,
      connectionCompleted: false,
      connectionStatus: "正在连接...",
    }));
    
    // 启动 logger 显示动画
    setShowLogger(true);
    setLoggerAnimating(true);
    
    await updateSakuraFrpcConfigFile();

    // 延迟一点再添加第一条日志，让动画更自然
    setTimeout(() => {
      addLog(`开始连接到端口 ${gamePort}`);
    }, 200);

    try {
      const process = await frpcService.startConnection(
        gamePort,
        addLog,
        (status) => setConnectionState(prev => ({ ...prev, connectionStatus: status })),
        () => setConnectionState(prev => ({ ...prev, connectionCompleted: true }))
      );
      FRPCProcessRef.current = process;
    } catch (error) {
      addLog(`连接失败: ${error}`);
      setConnectionState(prev => ({
        ...prev,
        connectionStatus: "连接失败",
        connectionCompleted: true,
        isConnecting: false,
      }));
    }
  };

  const killFRPCProcessIfExists = async () => {
    if (FRPCProcessRef.current) {
      await frpcService.stopConnection(FRPCProcessRef.current);
      FRPCProcessRef.current = null;
    }
  }

  getCurrentWindow().listen("tauri://destroyed", killFRPCProcessIfExists)

  const handleDisconnect = async () => {
    setConnectionState(prev => ({ ...prev, isAnimating: true }));
    
    await frpcService.stopConnection(FRPCProcessRef.current);
    FRPCProcessRef.current = null;
    
    addLog("断开连接");

    // 等待一个短暂的延迟后完全重置连接状态
    setTimeout(() => {
      addLog("连接已关闭");
      
      // 完全重置连接状态
      setConnectionState({
        isConnecting: false,
        connectionStatus: "",
        connectionCompleted: false,
        isAnimating: false,
      });
      
      // 延迟隐藏 logger，让用户能看到最后的状态
      setTimeout(() => {
        setLoggerAnimating(false);
        // 等待 logger 收缩动画完成后再完全隐藏和清空日志
        setTimeout(() => {
          setShowLogger(false);
          clearLogs();
        }, 350); // 等待收缩动画完成 (0.3s + 50ms 缓冲)
      }, 1500); // 显示最终状态的时间
    }, 300); // 按钮动画持续时间
  };

  // before login
  useEffect(() => {
    // 只在未尝试过自动登录且未认证时尝试自动登录
    if (!autoLoginAttempted && !isAuthenticated) {
      const tryAutoLogin = async () => {
        setAutoLoginAttempted(true);
        const savedApiKey = await loadSavedApiKey();
        if (savedApiKey) {
          console.log("找到保存的API Key，开始自动登录");
          handleLogin(savedApiKey);
        } else {
          console.log("未找到保存的API Key");
        }
      };
      tryAutoLogin();
    }
  }, [autoLoginAttempted, isAuthenticated, handleLogin]);

  // Effects
  useEffect(() => {
    // 设置默认背景
    setCurrentBackground("/assets/default.jpg");

  }, []);

  // 当显示 logger 时，设置动画完成状态
  useEffect(() => {
    if (showLogger && !loggerAnimating && connectionState.isConnecting) {
      // 只在连接状态下才自动设置 loggerAnimating 为 true
      const timer = setTimeout(() => {
        setLoggerAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showLogger, loggerAnimating, connectionState.isConnecting]);

  return (
    <main
      className={`container ${
        backgroundTransition ? "background-transition" : ""
      }`}
    >
      <BackgroundManager
        currentBackground={currentBackground}
        backgroundTransition={backgroundTransition}
      />

      {/* 登录界面 */}
      {!isAuthenticated && (
        <LoginScreen
          onLogin={handleLogin}
          isLoading={loginLoading}
          error={loginError}
        />
      )}

      {/* 加载界面 - 只在已登录且正在加载时显示 */}
      {isAuthenticated && (
        <LoadingScreen
          isLoading={isLoading}
          loadingExiting={loadingExiting}
        />
      )}

      {/* 主界面内容 - 只在已登录且加载完成时显示 */}
      {isAuthenticated && (
        <div
          className={`content-wrapper ${
            isLoading ? "content-hidden" : "content-visible"
          }`}
        >
          <AudioPlayer audioRef={audioRef} />

          <h1>蓝连哈</h1>

        <form className="form-container">
          <GameSelector
            currentGame={currentGame}
            gameList={gameList}
            isConnecting={connectionState.isConnecting}
            onGameSelect={handleGameSelect}
          />

          <ConnectionManager
            gamePort={gamePort}
            connectionState={connectionState}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />

          <Logger
            logs={logs}
            showLogger={showLogger}
            loggerAnimating={loggerAnimating}
          />
        </form>

        <Footer onOpenAdvancedSettings={handleOpenAdvancedSettings} />

        {/* 高级设置弹窗 */}
        <AdvancedSettingsModal
          isOpen={showAdvancedSettings}
          gameList={gameList}
          onClose={handleCloseAdvancedSettings}
          frpcConfig={frpcConfig}
          onConfigChange={handleConfigChange}
        />
        </div>
      )}
    </main>
  );
}

export default App;
