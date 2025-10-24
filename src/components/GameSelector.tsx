import React from 'react';
import { Game } from '../types';

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
    <div className="form-group">
      <label htmlFor="game-port" className="form-label">
        选择游戏端口:
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <select
          id="game-port"
          className="form-select"
          value={`${currentGame ? `${currentGame.name};${currentGame.defaultPort};${currentGame.type}` : ''}`}
          onChange={handleGameChange}
          disabled={isConnecting}
          style={{ 
            flex: '1',
            minWidth: '0', // 允许 flex item 收缩
            width: 'auto'
          }}
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
            className="delete-button"
            style={{
              padding: '12px 8px',
              background: '#e74c3c',
              color: 'white',
              border: '3px solid #2a2a2a',
              borderRadius: '0',
              fontSize: '14px',
              fontWeight: 'normal',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease-out',
              fontFamily: "'FusionPixel', monospace",
              boxShadow: '3px 3px 0px #2a2a2a, 6px 6px 0px #666666',
              textTransform: 'uppercase',
              width: '48px',
              minHeight: 'auto',
              boxSizing: 'border-box',
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              opacity: isConnecting ? 0.6 : 1
            }}
            title="删除当前游戏配置"
            onMouseEnter={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.background = '#c0392b';
                e.currentTarget.style.transform = 'translate(1px, 1px)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #2a2a2a, 4px 4px 0px #666666';
              }
            }}
            onMouseLeave={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.background = '#e74c3c';
                e.currentTarget.style.transform = 'translate(0px, 0px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #2a2a2a, 6px 6px 0px #666666';
              }
            }}
            onMouseDown={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.transform = 'translate(3px, 3px)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            onMouseUp={(e) => {
              if (!isConnecting) {
                e.currentTarget.style.transform = 'translate(1px, 1px)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #2a2a2a, 4px 4px 0px #666666';
              }
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default GameSelector;