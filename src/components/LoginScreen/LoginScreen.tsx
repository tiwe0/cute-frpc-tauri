import React, { useState } from "react";
import styles from './LoginScreen.module.css';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onLogin(apiKey.trim());
    }
  };

  return (
    <div className={styles.loginScreen}>
      <div className={styles.loginContent}>
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>
            <img src="/assets/icon.png" alt="蓝连哈" className={styles.loginIcon} />
            <h1 className={styles.loginTitle}>蓝连哈</h1>
          </div>
          <p className={styles.loginSubtitle}>游戏联机工具</p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <div className={styles.loginFormGroup}>
            <label htmlFor="api-key" className={styles.loginLabel}>
              API Key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入您的 API Key"
              className={styles.loginInput}
              disabled={isLoading}
              autoFocus
            />
            {error && <div className={styles.loginError}>{error}</div>}
          </div>

          <button
            type="submit"
            className={styles.loginButton}
            disabled={isLoading || !apiKey.trim()}
          >
            {isLoading ? (
              <>
                <span className={styles.loginSpinner}>⏳</span>
                验证中...
              </>
            ) : (
              "登录"
            )}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p className={styles.loginHelp}>请联系管理员获取 API Key</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
