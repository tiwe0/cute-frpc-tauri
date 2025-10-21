import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';

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
  );
};

export default Logger;