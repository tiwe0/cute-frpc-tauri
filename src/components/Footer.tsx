import React from 'react';

interface FooterProps {
  onOpenAdvancedSettings?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenAdvancedSettings }) => {
  return (
    <footer className="footer-section">
      <div className="copyright-info">
        <div className="copyright-text">© 2025 蓝联花 - 游戏联机工具</div>
        <div className="copyright-text">📧 contact@ivory.cafe</div>
        <div className="copyright-text">💻 https://github.com/tiwe0/cute-frpc-tauri</div>
        <div 
          className="copyright-text version-clickable" 
          onClick={onOpenAdvancedSettings}
          title="点击打开高级设置"
        >
          v0.1.0 | Made with ❤️ by Ivory ⚙️
        </div>
      </div>
    </footer>
  );
};

export default Footer;