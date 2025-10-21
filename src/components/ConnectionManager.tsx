import React from 'react';
import { ConnectionState } from '../types';

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

  return (
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
          type="button"
          className={`connect-button ${
            isConnecting && !connectionCompleted
              ? "connecting waiting"
              : isConnecting && connectionCompleted
              ? "connecting"
              : ""
          }`}
          style={{
            width: (isConnecting || isAnimating) ? '60px' : '100%',
            marginLeft: (isConnecting || isAnimating) ? 'auto' : '0'
          }}
          disabled={
            (!gamePort && !isConnecting) ||
            (isConnecting && !connectionCompleted)
          }
          onClick={handleButtonClick}
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
  );
};

export default ConnectionManager;