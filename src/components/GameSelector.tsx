import React from 'react';
import { Game } from '../types';

interface GameSelectorProps {
  currentGame: Game | null;
  gameList: Game[];
  isConnecting: boolean;
  onGameSelect: (game: Game) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({
  currentGame,
  gameList,
  isConnecting,
  onGameSelect,
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

  return (
    <div className="form-group">
      <label htmlFor="game-port" className="form-label">
        选择游戏端口:
      </label>
      <select
        id="game-port"
        className="form-select"
        value={`${currentGame ? `${currentGame.name};${currentGame.defaultPort};${currentGame.type}` : ''}`}
        onChange={handleGameChange}
        disabled={isConnecting}
      >
        <option value="" disabled>
          请选择游戏...
        </option>
        {gameList.map((game) => (
          <option key={`${game.name};${game.defaultPort};${game.type}`} value={`${game.name};${game.defaultPort};${game.type}`}>
            {game.name} (端口: {game.defaultPort}; 类型: {game.type}) <button style={{fontSize: '0.8em'}}>×</button>
          </option>
        ))}
      </select>
    </div>
  );
};

export default GameSelector;