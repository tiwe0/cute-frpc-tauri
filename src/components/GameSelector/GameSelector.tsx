import React from 'react';
import { Game } from '../../types';
import styles from './GameSelector.module.css';

interface GameSelectorProps {
  currentGame: Game | null;
  gameList: Game[];
  isConnecting: boolean;
  onGameSelect: (game: Game) => void;
  onGameDelete?: (game: Game) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({
  currentGame,
  gameList,
  isConnecting,
  onGameSelect,
  onGameDelete,
}) => {
  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTriplet = e.currentTarget.value.split(';');
    console.log('Selected triplet:', selectedTriplet);
    const selectedName = selectedTriplet[0];
    const selectedPort = Number(selectedTriplet[1]);
    const selectedType = selectedTriplet[2] as 'tcp' | 'udp';
    console.log(gameList)
    const selectedGame = gameList.find(game => (game.defaultPort === selectedPort && game.type === selectedType && game.name === selectedName));
    console.log('Selected game:', selectedGame);
    if (selectedGame) {
      onGameSelect(selectedGame);
    }
  };

  const handleDeleteGame = () => {
    if (currentGame && onGameDelete) {
      onGameDelete(currentGame);
    }
  };

  return (
    <div className={styles.formGroup}>
      <label htmlFor="game-port" className={styles.formLabel}>
        选择游戏端口:
      </label>
      <div className={styles.selectorContainer}>
        <select
          id="game-port"
          className={styles.formSelect}
          value={`${currentGame ? `${currentGame.name};${currentGame.defaultPort};${currentGame.type}` : ''}`}
          onChange={handleGameChange}
          disabled={isConnecting}
        >
          <option value="" disabled>
            请选择游戏...
          </option>
          {gameList.map((game) => (
            <option key={`${game.name};${game.defaultPort};${game.type}`} value={`${game.name};${game.defaultPort};${game.type}`}>
              {game.name} (端口: {game.defaultPort}; 类型: {game.type})
            </option>
          ))}
        </select>
        {currentGame && onGameDelete && (
          <button
            type="button"
            onClick={handleDeleteGame}
            disabled={isConnecting}
            className={styles.deleteButton}
            title="删除当前游戏配置"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default GameSelector;