import { useState, useCallback } from 'react';
import { LogEntry } from '../types';
import { parseAnsiColors, stripAnsiColors } from '../utils/ansiColors';

interface UseLoggerReturn {
  logs: LogEntry[];
  showLogger: boolean;
  loggerAnimating: boolean;
  setShowLogger: (show: boolean) => void;
  setLoggerAnimating: (animating: boolean) => void;
  addLog: (message: string, preserveColors?: boolean) => void;
  clearLogs: () => void;
  setLogs: (logs: LogEntry[]) => void;
}

export const useLogger = (): UseLoggerReturn => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogger, setShowLogger] = useState(false);
  const [loggerAnimating, setLoggerAnimating] = useState(false);

  const addLog = useCallback((message: string, preserveColors: boolean = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const hasColors = /\x1b\[[0-9;]*m/.test(message);
    
    let content: string;
    if (preserveColors && hasColors) {
      content = parseAnsiColors(message);
    } else {
      content = stripAnsiColors(message);
    }
    
    const logEntry: LogEntry = {
      id: Date.now() + Math.random(),
      timestamp,
      content: `[${timestamp}] ${content}`,
      hasColors: preserveColors && hasColors
    };
    
    setLogs(prev => [...prev, logEntry]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    showLogger,
    loggerAnimating,
    setShowLogger,
    setLoggerAnimating,
    addLog,
    clearLogs,
    setLogs,
  };
};