import React from 'react';
import { Game } from '../types';

interface GameSelectorProps {
  gameList: Game[];
  gamePort: number | null;
  isConnecting: boolean;
  onGameSelect: (port: number, game: Game) => void;
}

const GameSelector: React.FC<GameSelectorProps> = ({
  gameList,
  gamePort,
  isConnecting,
  onGameSelect,
}) => {
  const handleGameChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPort = Number(e.currentTarget.value);
    const selectedGame = gameList.find(game => game.defaultPort === selectedPort);
    if (selectedGame) {
      onGameSelect(selectedPort, selectedGame);
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
        value={gamePort ?? ""}
        onChange={handleGameChange}
        disabled={isConnecting}
      >
        <option value="" disabled>
          请选择游戏...
        </option>
        {gameList.map((game) => (
          <option key={game.defaultPort} value={game.defaultPort}>
            {game.name} (端口: {game.defaultPort}) <button style={{fontSize: '0.8em'}}>×</button>
          </option>
        ))}
      </select>
    </div>
  );
};

export default GameSelector;