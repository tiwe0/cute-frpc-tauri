import React from 'react';
import styles from './BackgroundManager.module.css';

interface BackgroundManagerProps {
  currentBackground: string;
  backgroundTransition: boolean;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({
  currentBackground,
}) => {
  return (
    <>
      <div
        className={`${styles.backgroundImage} ${
          currentBackground ? styles.backgroundVisible : ""
        }`}
        style={{
          backgroundImage: currentBackground
            ? `url(${currentBackground})`
            : "none",
        }}
      />
      <div className={styles.backgroundOverlay} />
    </>
  );
};

export default BackgroundManager;