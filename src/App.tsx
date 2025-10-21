import "./App.css";

import { useState, useEffect, useRef } from "react";
import { resolveResource } from "@tauri-apps/api/path";
import { Command, Child } from "@tauri-apps/plugin-shell";

function App() {
  const [gameList, setGameList] = useState<{name: string, defaultPort: number, background?: string}[]>([
    { name: "Minecraft", defaultPort: 25565, background: "/assets/minecraft.webp" },
    { name: "Terraria", defaultPort: 7777, background: "/assets/terraria.webp" },
    { name: "Stardew Valley", defaultPort: 24642, background: "/assets/stardewvalley.webp" },
  ]);
  const [gamePort, setGamePort] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [connectionCompleted, setConnectionCompleted] = useState(false);
  const [logs, setLogs] = useState<{id: number, timestamp: string, content: string, hasColors: boolean}[]>([]);
  const [showLogger, setShowLogger] = useState(false);
  const [loggerAnimating, setLoggerAnimating] = useState(false);
  const [currentBackground, setCurrentBackground] = useState<string>("");
  const [backgroundTransition, setBackgroundTransition] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingExiting, setLoadingExiting] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  let FRPCProcess: Child | null = null;

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

  const changeBackground = (backgroundUrl: string) => {
    if (backgroundUrl === currentBackground) return;
    
    setBackgroundTransition(true);
    setTimeout(() => {
      setCurrentBackground(backgroundUrl);
      setTimeout(() => {
        setBackgroundTransition(false);
      }, 50);
    }, 300);
  };



  const parseAnsiColors = (text: string): string => {
    // ANSI 颜色代码映射 - 使用更适合终端的颜色
    const ansiColorMap: { [key: string]: string } = {
      '30': '#2e3440',  // 黑色
      '31': '#bf616a',  // 红色
      '32': '#a3be8c',  // 绿色
      '33': '#ebcb8b',  // 黄色
      '34': '#5e81ac',  // 蓝色
      '35': '#b48ead',  // 洋红
      '36': '#88c0d0',  // 青色
      '37': '#d8dee9',  // 白色
      '90': '#4c566a',  // 亮黑色(灰色)
      '91': '#bf616a',  // 亮红色
      '92': '#a3be8c',  // 亮绿色
      '93': '#ebcb8b',  // 亮黄色
      '94': '#5e81ac',  // 亮蓝色
      '95': '#b48ead',  // 亮洋红
      '96': '#88c0d0',  // 亮青色
      '97': '#eceff4'   // 亮白色
    };

    let result = text;
    let openSpans = 0;

    // 处理 ANSI 转义序列
    result = result.replace(/\x1b\[[0-9;]*m/g, (match) => {
      const codes = match.slice(2, -1).split(';').filter(code => code !== '');
      
      if (codes.includes('0') || codes.length === 0) {
        // 重置所有样式
        const closeTags = '</span>'.repeat(openSpans);
        openSpans = 0;
        return closeTags;
      }

      const styles: string[] = [];
      for (const code of codes) {
        if (ansiColorMap[code]) {
          styles.push(`color: ${ansiColorMap[code]}`);
        } else if (code === '1') {
          styles.push('font-weight: bold');
        }
      }

      if (styles.length > 0) {
        openSpans++;
        return `<span style="${styles.join('; ')}">`;
      }
      return '';
    });

    // 确保所有打开的 span 都被关闭
    if (openSpans > 0) {
      result += '</span>'.repeat(openSpans);
    }

    return result;
  };

  const stripAnsiColors = (text: string): string => {
    // 简单移除所有 ANSI 转义序列
    return text.replace(/\x1b\[[0-9;]*m/g, '');
  };

  const addLog = (message: string, preserveColors: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const hasColors = /\x1b\[[0-9;]*m/.test(message);
    
    let content: string;
    if (preserveColors && hasColors) {
      content = parseAnsiColors(message);
    } else {
      content = stripAnsiColors(message);
    }
    
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      content: `[${timestamp}] ${content}`,
      hasColors: preserveColors && hasColors
    };
    
    setLogs(prev => [...prev, logEntry]);
  };

  const handleConnect = async () => {
    if (!gamePort) return;

    setIsConnecting(true);
    setConnectionCompleted(false); // 重置连接完成状态
    setConnectionStatus("正在连接...");
    
    // 启动 logger 显示动画
    setShowLogger(true);
    setLoggerAnimating(true);
    
    // 延迟一点再添加第一条日志，让动画更自然
    setTimeout(() => {
      addLog(`开始连接到端口 ${gamePort}`);
    }, 200);

    try {
      const command = Command.sidecar("bin/frpc", [
        "-c",
        await resolveResource("resources/default_config.toml"),
      ]);
      setTimeout(() => {
        addLog("正在执行 frpc 命令...");
      }, 500);
      command.on("close", (data) => {
        addLog(`frpc 进程已关闭，退出码: ${data.code}`);
        if (data.code === 0) {
          setConnectionStatus("连接成功!");
          addLog("连接建立成功!");
        } else {
          setConnectionStatus("连接失败");
          addLog("连接失败");
        }
        setConnectionCompleted(true); // 连接过程完成（无论成功或失败）
      });
      command.on("error", (error) => {
        addLog(`frpc 进程错误: ${error}`);
        setConnectionStatus("连接失败");
        setConnectionCompleted(true);
      });
      command.stdout.on("data", (line) => {
        addLog(line, true); // 保留颜色
      });
      command.stderr.on("data", (line) => {
        addLog(`错误: ${line}`, true); // 保留颜色
      });
      FRPCProcess = await command.spawn();

    } catch (error) {
      addLog(`连接失败: ${error}`);
      setConnectionStatus("连接失败");
      setConnectionCompleted(true);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsAnimating(true);
    if (FRPCProcess) {
      await FRPCProcess.kill();
      FRPCProcess = null;
    }
    setConnectionStatus("");
    setConnectionCompleted(false); // 重置连接完成状态
    addLog("断开连接");

    // 等待按钮动画完成后再重置状态
    setTimeout(() => {
      setIsConnecting(false);
      setIsAnimating(false);
      addLog("连接已关闭");
      
      // 延迟隐藏 logger，让用户能看到最后的状态
      setTimeout(() => {
        setLoggerAnimating(false);
        // 等待 logger 收缩动画完成后再完全隐藏和清空日志
        setTimeout(() => {
          setShowLogger(false);
          setLogs([]);
        }, 350); // 等待收缩动画完成 (0.3s + 50ms 缓冲)
      }, 1500); // 显示最终状态的时间
    }, 300); // 按钮动画持续时间
  };

  useEffect(() => {
    initConfig();
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // 当显示 logger 时，设置动画完成状态
  useEffect(() => {
    if (showLogger && !loggerAnimating && isConnecting) {
      // 只在连接状态下才自动设置 loggerAnimating 为 true
      const timer = setTimeout(() => {
        setLoggerAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showLogger, loggerAnimating, isConnecting]);

  return (
    <main
      className={`container ${
        backgroundTransition ? "background-transition" : ""
      }`}
    >
      <div
        className={`background-image ${
          currentBackground ? "background-visible" : ""
        }`}
        style={{
          backgroundImage: currentBackground
            ? `url(${currentBackground})`
            : "none",
        }}
      />
      <div className="background-overlay" />

      {/* 加载动画 */}
      {isLoading && (
        <div
          className={`loading-screen ${loadingExiting ? "loading-exit" : ""}`}
        >
          <div className="loading-content">
            <div className="loading-logo">
              <div className="loading-icon">🌸</div>
              <h1 className="loading-title">蓝联花</h1>
            </div>
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
              <div className="spinner-ring"></div>
            </div>
            <div className="loading-text">正在初始化...</div>
          </div>
        </div>
      )}

      <div
        className={`content-wrapper ${
          isLoading ? "content-hidden" : "content-visible"
        }`}
      >
        {/* 背景音乐 */}
        <audio ref={audioRef} loop preload="auto">
          <source src="/sound/music.mp3" type="audio/mpeg" />
          您的浏览器不支持音频播放。
        </audio>

        <h1>蓝联花</h1>

        <form
          className="form-container"
          onSubmit={(e) => {
            e.preventDefault();
            handleConnect();
          }}
        >
          <div className="form-group">
            <label htmlFor="game-port" className="form-label">
              选择游戏端口:
            </label>
          </div>

          <div className="form-group">
            <select
              id="game-port"
              className="form-select"
              value={gamePort ?? ""}
              onChange={(e) => {
                const selectedPort = Number(e.currentTarget.value);
                setGamePort(selectedPort);

                // 查找对应的游戏并切换背景
                const selectedGame = gameList.find(
                  (game) => game.defaultPort === selectedPort
                );
                if (selectedGame?.background) {
                  changeBackground(selectedGame.background);
                }
              }}
              disabled={isConnecting}
            >
              <option value="" disabled>
                请选择游戏...
              </option>
              {gameList.map((game: any) => (
                <option key={game.defaultPort} value={game.defaultPort}>
                  {game.name} (端口: {game.defaultPort})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <div className="button-container">
              {(isConnecting || isAnimating) && (
                <div
                  className={`status-display ${isAnimating ? "slideOut" : ""}`}
                >
                  <span className="status-text">{connectionStatus}</span>
                </div>
              )}
              <button
                type={isConnecting ? "button" : "submit"}
                className={`connect-button ${
                  isConnecting && !connectionCompleted
                    ? "connecting waiting"
                    : isConnecting && connectionCompleted
                    ? "connecting"
                    : ""
                }`}
                disabled={
                  (!gamePort && !isConnecting) ||
                  (isConnecting && !connectionCompleted)
                }
                onClick={
                  isConnecting && connectionCompleted
                    ? handleDisconnect
                    : undefined
                }
              >
                {isConnecting && !connectionCompleted ? (
                  <span className="connecting-spinner">⏳</span>
                ) : isConnecting && !isAnimating && connectionCompleted ? (
                  "✕"
                ) : (
                  "🚀 开始连接"
                )}
              </button>
            </div>
          </div>

          {showLogger && (
            <div
              className={`form-group logger-form-group ${
                loggerAnimating ? "logger-slide-in" : "logger-slide-out"
              }`}
            >
              <div className="logger-container">
                <div className="logger-content">
                  {logs.length === 0 ? (
                    <div className="no-logs">正在初始化...</div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="log-entry">
                        {log.hasColors ? (
                          <span
                            dangerouslySetInnerHTML={{ __html: log.content }}
                          />
                        ) : (
                          log.content
                        )}
                      </div>
                    ))
                  )}
                  <div ref={logEndRef} />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* 版权信息 */}
        <footer className="footer-section">
          <div className="copyright-info">
            <div className="copyright-text">© 2025 蓝联花 - 游戏联机工具</div>
            <div className="copyright-text">📧 contact@ivory.cafe | 💻 https://github.com/tiwe0/cute-frpc-tauri</div>
            <div className="copyright-text">v0.1.0 | Made with ❤️ by Ivory</div>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default App;
