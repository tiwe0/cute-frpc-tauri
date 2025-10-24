import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../types';
import styles from './Logger.module.css';

interface LoggerProps {
  logs: LogEntry[];
  showLogger: boolean;
  loggerAnimating: boolean;
}

const Logger: React.FC<LoggerProps> = ({ logs, showLogger, loggerAnimating }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // 动画完成后启用滚动
  useEffect(() => {
    if (containerRef.current && loggerAnimating) {
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.overflow = 'visible';
        }
      }, 400); // 等待动画完成
      
      return () => clearTimeout(timer);
    }
  }, [loggerAnimating]);

  if (!showLogger) return null;

  return (
    <div
      ref={containerRef}
      className={`${styles.loggerFormGroup} ${
        loggerAnimating ? styles.loggerSlideIn : styles.loggerSlideOut
      }`}
    >
      <div className={styles.loggerContainer}>
        <div className={styles.loggerContent}>
          {logs.length === 0 ? (
            <div className={styles.noLogs}>正在初始化...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={styles.logEntry}>
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
  );
};

export default Logger;