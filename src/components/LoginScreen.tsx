import React, { useState } from "react";
import { useSakuraFrpApi } from "../hooks/useSakuraFrpApi";

interface LoginScreenProps {
  onLogin: (apiKey: string) => void;
  isLoading: boolean;
  error?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  isLoading,
  error,
}) => {
  const [apiKey, setApiKey] = useState("");

  const { setToken, userInfo, getUserInfo } = useSakuraFrpApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      // onLogin(apiKey.trim());
      setToken(apiKey.trim());
      await getUserInfo();
      console.log(userInfo)
    }
  };


  return (
    <div className="login-screen">
      <div className="login-content">
        <div className="login-header">
          <div className="login-logo">
            <img src="/assets/icon.png" alt="蓝联花" className="login-icon" />
            <h1 className="login-title">蓝联花</h1>
          </div>
          <p className="login-subtitle">游戏联机工具</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label htmlFor="api-key" className="login-label">
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 API Key"
              className="login-input"
              disabled={isLoading}
              autoFocus
            />
            {error && <div className="login-error">{error}</div>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? (
              <>
                <span className="login-spinner">⏳</span>
                验证中...
              </>
            ) : (
              "登录"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="login-help">请联系管理员获取 API Key</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
