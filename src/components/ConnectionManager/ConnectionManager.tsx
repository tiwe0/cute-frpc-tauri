import React from 'react';
import { ConnectionState } from '../../types';
import styles from './ConnectionManager.module.css';

interface ConnectionManagerProps {
  gamePort: number | null;
  connectionState: ConnectionState;
  onConnect: () => void;
  onDisconnect: () => void;
}

const ConnectionManager: React.FC<ConnectionManagerProps> = ({
  gamePort,
  connectionState,
  onConnect,
  onDisconnect,
}) => {
  const { isConnecting, connectionStatus, connectionCompleted, isAnimating } = connectionState;

  const handleButtonClick = () => {
    if (isConnecting && connectionCompleted) {
      onDisconnect();
    } else if (!isConnecting) {
      // 如果不在连接状态，执行连接操作
      onConnect();
    }
  };

  // 调试信息
  console.log('ConnectionManager render:', { 
    isConnecting, 
    isAnimating, 
    connectionCompleted,
    shouldUseSmallWidth: (isConnecting || isAnimating),
    buttonWidth: (isConnecting || isAnimating) ? '60px' : '100%'
  });

  return (
    <div className={styles.formGroup}>
      <div className={styles.buttonContainer}>
        {(isConnecting || isAnimating) && (
          <div
            className={`${styles.statusDisplay} ${isAnimating ? styles.slideOut : ""}`}
          >
            <span className={styles.statusText}>{connectionStatus}</span>
          </div>
        )}
        <button
          type="button"
          className={`${styles.connectButton} ${
            isConnecting && !connectionCompleted
              ? `${styles.connecting} ${styles.waiting}`
              : isConnecting && connectionCompleted
              ? styles.connecting
              : ""
          }`}
          style={{
            width: (isConnecting || isAnimating) ? '60px' : '100%',
            marginLeft: (isConnecting || isAnimating) ? 'auto' : '0',
            transition: 'width 0.3s ease-out, margin-left 0.3s ease-out'
          }}
          disabled={
            (!gamePort && !isConnecting) ||
            (isConnecting && !connectionCompleted)
          }
          onClick={handleButtonClick}
        >
          {isConnecting && !connectionCompleted ? (
            <span className={styles.connectingSpinner}>⏳</span>
          ) : isConnecting && !isAnimating && connectionCompleted ? (
            "✕"
          ) : (
            "🚀 开始连接"
          )}
        </button>
      </div>
    </div>
  );
};

export default ConnectionManager;