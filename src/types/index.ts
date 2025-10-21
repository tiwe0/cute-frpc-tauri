export interface Game {
  name: string;
  defaultPort: number;
  background?: string;
}

export interface LogEntry {
  id: number;
  timestamp: string;
  content: string;
  hasColors: boolean;
}

export interface ConnectionState {
  isConnecting: boolean;
  connectionStatus: string;
  connectionCompleted: boolean;
  isAnimating: boolean;
}