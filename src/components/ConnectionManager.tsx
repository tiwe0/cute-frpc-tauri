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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect();
  };

  const handleButtonClick = () => {
    if (isConnecting && connectionCompleted) {
      onDisconnect();
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
        <form onSubmit={handleSubmit}>
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
                ? handleButtonClick
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
        </form>
      </div>
    </div>
  );
};

export default ConnectionManager;