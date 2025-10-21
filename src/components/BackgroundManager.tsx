import React from 'react';

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
        className={`background-image ${
          currentBackground ? "background-visible" : ""
        }`}
        style={{
          backgroundImage: currentBackground
            ? `url(${currentBackground})`
            : "none",
        }}
      />
      <div className="background-overlay" />
    </>
  );
};

export default BackgroundManager;