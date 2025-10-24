import React from 'react';
import styles from './Footer.module.css';

interface FooterProps {
  onOpenAdvancedSettings?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAdvancedSettings }) => {
  return (
    <footer className={styles.footerSection}>
      <div className={styles.copyrightInfo}>
        <div className={styles.copyrightText}>© 2025 蓝连哈 - 游戏联机工具</div>
        <div className={styles.copyrightText}>
          📧 <a href="mailto:contact@ivory.cafe">contact@ivory.cafe</a>
        </div>
        <div className={styles.copyrightText}>
          💻 <a
            href="https://github.com/tiwe0/cute-frpc-tauri"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://github.com/tiwe0/cute-frpc-tauri
          </a>
        </div>
        <div
          className={`${styles.copyrightText} ${styles.versionClickable}`}
          onClick={onOpenAdvancedSettings}
          title="点击打开高级设置"
        >
          v0.2.5 | Made with ❤️ by Ivory
        </div>
      </div>
    </footer>
  );
};

export default Footer;