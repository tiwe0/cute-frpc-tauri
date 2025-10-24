import React from 'react';

interface SettingsButtonProps {
  onClick: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button 
      className="settings-button"
      onClick={onClick}
      title="高级设置"
    >
      ⚙️
    </button>
  );
};

export default SettingsButton;