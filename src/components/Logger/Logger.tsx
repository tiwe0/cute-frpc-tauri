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

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  if (!showLogger) return null;

  return (
    <div
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