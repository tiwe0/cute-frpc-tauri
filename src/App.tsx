import "./App.css";

import { useState, useEffect, useRef } from "react";
import { resolveResource } from "@tauri-apps/api/path";
import { Child } from "@tauri-apps/plugin-shell";

// Components
import {
  LoadingScreen,
  BackgroundManager,
  GameSelector,
  Logger,
  ConnectionManager,
  Footer,
  AudioPlayer,
} from "./components";

// Hooks
import { useBackgroundTransition } from "./hooks/useBackgroundTransition";
import { useLogger } from "./hooks/useLogger";

// Types
import { Game, ConnectionState } from "./types";

// Services
import { createFRPCService } from "./services/frpcService";

function App() {
  // Game state
  const [gameList] = useState<Game[]>([
    { name: "Minecraft", defaultPort: 25565, background: "/assets/minecraft.webp", type: "tcp" },
    { name: "Terraria", defaultPort: 7777, background: "/assets/terraria.webp", type: "udp" },
    { name: "Stardew Valley", defaultPort: 24642, background: "/assets/stardewvalley.webp", type: "tcp" },
  ]);
  const [gamePort, setGamePort] = useState<number | null>(null);

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

  // Services
  const frpcService = createFRPCService();

  // Initialization
  const initConfig = async () => {
    try {
      // 模拟加载时间
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // 开始退出动画
      setLoadingExiting(true);
      
      // 等待退出动画完成后再隐藏加载屏幕、设置默认背景并播放音乐
      setTimeout(() => {
        setIsLoading(false);
        setLoadingExiting(false);
        
        // 设置默认背景
        setCurrentBackground("/assets/default.jpg");
        
        // 播放背景音乐
        if (audioRef.current) {
          audioRef.current.volume = 0.3; // 设置音量为30%
          audioRef.current.play().catch(error => {
            console.log('音乐播放失败，可能需要用户交互:', error);
          });
        }
      }, 600);
      
      const resourcePath = await resolveResource('resources/default_config.toml');
      console.log('Config path:', resourcePath);
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

  // Game selection handler
  const handleGameSelect = (port: number, game: Game) => {
    setGamePort(port);
    if (game.background) {
      changeBackground(game.background);
    }
  };

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

  const handleDisconnect = async () => {
    setConnectionState(prev => ({ ...prev, isAnimating: true }));
    
    await frpcService.stopConnection(FRPCProcessRef.current);
    FRPCProcessRef.current = null;
    
    setConnectionState(prev => ({
      ...prev,
      connectionStatus: "",
      connectionCompleted: false,
    }));
    addLog("断开连接");

    // 等待按钮动画完成后再重置状态
    setTimeout(() => {
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        isAnimating: false,
      }));
      addLog("连接已关闭");
      
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

  // Effects
  useEffect(() => {
    initConfig();
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

      <LoadingScreen
        isLoading={isLoading}
        loadingExiting={loadingExiting}
      />

      <div
        className={`content-wrapper ${
          isLoading ? "content-hidden" : "content-visible"
        }`}
      >
        <AudioPlayer audioRef={audioRef} />

        <h1>蓝联花</h1>

        <form className="form-container">
          <GameSelector
            gameList={gameList}
            gamePort={gamePort}
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

        <Footer />
      </div>
    </main>
  );
}

export default App;
