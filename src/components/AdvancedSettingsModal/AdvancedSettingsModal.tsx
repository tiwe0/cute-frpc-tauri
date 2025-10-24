import React, { useState, useEffect } from 'react';
import { FRPCConfig, Game } from '../../types';
import { APP_GAMELIST_PATH } from '../../utils/const';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import styles from './AdvancedSettingsModal.module.css';
import sharedStyles from '../../styles/shared.module.css';

interface AdvancedSettingsModalProps {
  isOpen: boolean;
  gameList: Game[];
  onClose: () => void;
  frpcConfig: FRPCConfig | null;
  onConfigChange: (config: FRPCConfig) => void;
}

const AdvancedSettingsModal: React.FC<AdvancedSettingsModalProps> = ({
  isOpen,
  gameList,
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

  const handleSave = async () => {
    if (!frpcConfig) return;

    const newConfig = new FRPCConfig(
      serverAddr,
      serverPort,
      frpcConfig.proxies
    );

    onConfigChange(newConfig);
    await writeTextFile(APP_GAMELIST_PATH, JSON.stringify(gameList, null, 2));
    onClose();
  };

  const handleAddCustomGame = () => {
    if (!customGameName.trim()) return;

    gameList.push({
      name: customGameName.trim(),
      defaultPort: customPort,
      type: protocolType,
    });

    // 这里可以添加自定义游戏的逻辑
    // 暂时只是关闭弹窗
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>⚙️ 高级设置</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.settingsSection}>
            <h3>🌐 服务器设置</h3>
            <div className={sharedStyles.formGroup}>
              <label htmlFor="server-addr" className={sharedStyles.formLabel}>服务器地址:</label>
              <input
                id="server-addr"
                type="text"
                value={serverAddr}
                onChange={(e) => setServerAddr(e.target.value)}
                placeholder="frp.example.com"
                className={styles.modalFormInput}
              />
            </div>
            <div className={sharedStyles.formGroup}>
              <label htmlFor="server-port" className={sharedStyles.formLabel}>服务器端口:</label>
              <input
                id="server-port"
                type="number"
                value={serverPort}
                onChange={(e) => setServerPort(Number(e.target.value))}
                className={styles.modalFormInput}
              />
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h3>🎮 自定义游戏</h3>
            <div className={sharedStyles.formGroup}>
              <label htmlFor="custom-game-name" className={sharedStyles.formLabel}>游戏名称:</label>
              <input
                id="custom-game-name"
                type="text"
                value={customGameName}
                onChange={(e) => setCustomGameName(e.target.value)}
                placeholder="输入游戏名称"
                className={styles.modalFormInput}
              />
            </div>
            <div className={sharedStyles.formGroup}>
              <label htmlFor="custom-port" className={sharedStyles.formLabel}>端口号:</label>
              <input
                id="custom-port"
                type="number"
                value={customPort}
                onChange={(e) => setCustomPort(Number(e.target.value))}
                className={styles.modalFormInput}
              />
            </div>
            <div className={sharedStyles.formGroup}>
              <label htmlFor="protocol-type" className={sharedStyles.formLabel}>协议类型:</label>
              <select
                id="protocol-type"
                value={protocolType}
                onChange={(e) => setProtocolType(e.target.value as 'tcp' | 'udp')}
                className={styles.modalFormSelect}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
              </select>
            </div>
            <button 
              className={styles.modalAddGameButton}
              onClick={handleAddCustomGame}
              disabled={!customGameName.trim()}
            >
              ➕ 添加自定义游戏
            </button>
          </div>

        </div>

        <div className={styles.modalFooter}>
          <button className={styles.modalButtonSecondary} onClick={onClose}>
            取消
          </button>
          <button className={styles.modalButtonPrimary} onClick={handleSave}>
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsModal;