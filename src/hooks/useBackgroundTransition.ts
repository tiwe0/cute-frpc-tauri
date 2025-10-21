import { useState, useCallback } from 'react';

interface UseBackgroundTransitionReturn {
  currentBackground: string;
  backgroundTransition: boolean;
  changeBackground: (backgroundUrl: string) => void;
  setCurrentBackground: (background: string) => void;
}

export const useBackgroundTransition = (initialBackground = ''): UseBackgroundTransitionReturn => {
  const [currentBackground, setCurrentBackgroundState] = useState<string>(initialBackground);
  const [backgroundTransition, setBackgroundTransition] = useState(false);

  const changeBackground = useCallback((backgroundUrl: string) => {
    if (backgroundUrl === currentBackground) return;
    
    setBackgroundTransition(true);
    setTimeout(() => {
      setCurrentBackgroundState(backgroundUrl);
      setTimeout(() => {
        setBackgroundTransition(false);
      }, 50);
    }, 300);
  }, [currentBackground]);

  const setCurrentBackground = useCallback((background: string) => {
    setCurrentBackgroundState(background);
  }, []);

  return {
    currentBackground,
    backgroundTransition,
    changeBackground,
    setCurrentBackground,
  };
};