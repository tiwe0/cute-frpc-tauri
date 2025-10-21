import React from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  loadingExiting: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, loadingExiting }) => {
  if (!isLoading) return null;

  return (
    <div className={`loading-screen ${loadingExiting ? "loading-exit" : ""}`}>
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
  );
};

export default LoadingScreen;