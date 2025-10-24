import React from 'react';
import styles from './LoadingScreen.module.css';

interface LoadingScreenProps {
  isLoading: boolean;
  loadingExiting: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isLoading, loadingExiting }) => {
  if (!isLoading) return null;

  return (
    <div className={`${styles.loadingScreen} ${loadingExiting ? styles.loadingExit : ""}`}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingLogo}>
          <div className={styles.loadingIcon}>
            <img src="/assets/icon.png" alt="蓝连哈" />
          </div>
          <h1 className={styles.loadingTitle}>蓝连哈</h1>
        </div>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
          <div className={styles.spinnerRing}></div>
        </div>
        <div className={styles.loadingText}>正在初始化...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;