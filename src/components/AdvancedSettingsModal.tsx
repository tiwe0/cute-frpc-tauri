import React, { useState, useEffect } from 'react';
import { FRPCConfig } from '../types';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  frpcConfig: FRPCConfig | null;
  onConfigChange: (config: FRPCConfig) => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  onClose,
  frpcConfig,
  onConfigChange,
}) => {
  const [serverAddr, setServerAddr] = useState('');
  const [serverPort, setServerPort] = useState(7000);
  const [customPort, setCustomPort] = useState(25565);
  const [customGameName, setCustomGameName] = useState('');
  const [protocolType, setProtocolType] = useState<'tcp' | 'udp'>('tcp');

  useEffect(() => {
    if (frpcConfig) {
      setServerAddr(frpcConfig.serverAddr);
      setServerPort(frpcConfig.serverPort);
    }
  }, [frpcConfig]);

  const handleSave = () => {
    if (!frpcConfig) return;

    const newConfig = new FRPCConfig(
      serverAddr,
      serverPort,
      frpcConfig.proxies
    );

    onConfigChange(newConfig);
    onClose();
  };

  const handleAddCustomGame = () => {
    if (!customGameName.trim()) return;

    // 这里可以添加自定义游戏的逻辑
    // 暂时只是关闭弹窗
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚙️ 高级设置</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="settings-section">
            <h3>🌐 服务器设置</h3>
            <div className="form-group">
              <label htmlFor="server-addr">服务器地址:</label>
              <input
                id="server-addr"
                type="text"
                value={serverAddr}
                onChange={(e) => setServerAddr(e.target.value)}
                placeholder="frp.example.com"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="server-port">服务器端口:</label>
              <input
                id="server-port"
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(Number(e.target.value))}
                className="form-input"
              />
            </div>
          </div>

          <div className="settings-section">
            <h3>🎮 自定义游戏</h3>
            <div className="form-group">
              <label htmlFor="custom-game-name">游戏名称:</label>
              <input
                id="custom-game-name"
                type="text"
                value={customGameName}
                onChange={(e) => setCustomGameName(e.target.value)}
                placeholder="输入游戏名称"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="custom-port">端口号:</label>
              <input
                id="custom-port"
                type="number"
                value={customPort}
                onChange={(e) => setCustomPort(Number(e.target.value))}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="protocol-type">协议类型:</label>
              <select
                id="protocol-type"
                value={protocolType}
                onChange={(e) => setProtocolType(e.target.value as 'tcp' | 'udp')}
                className="form-select"
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            <button 
              className="add-game-button"
              onClick={handleAddCustomGame}
              disabled={!customGameName.trim()}
            >
              ➕ 添加自定义游戏
            </button>
          </div>

          <div className="settings-section">
            <h3>📋 配置信息</h3>
            <div className="config-preview">
              <pre>{frpcConfig?.toTOML() || '加载中...'}</pre>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="button-secondary" onClick={onClose}>
            取消
          </button>
          <button className="button-primary" onClick={handleSave}>
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal;