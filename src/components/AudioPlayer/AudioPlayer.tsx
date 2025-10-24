import React from 'react';

interface AudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioRef }) => {
  return (
    <audio ref={audioRef} preload="auto">
      <source src="/sound/music.mp3" type="audio/mpeg" />
      您的浏览器不支持音频播放。
    </audio>
  );
};

export default AudioPlayer;