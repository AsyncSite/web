import React from 'react';

interface Player {
  id: string;
  name: string;
  score: number;
  isActive: boolean;
}

interface PlayerStatusProps {
  players: Player[];
  currentPlayerId: string;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ players, currentPlayerId }) => {
  return (
    <div className="player-status">
      <h3>플레이어 상태</h3>
      <div className="players">
        {players.map((player) => (
          <div
            key={player.id}
            className={`player ${player.id === currentPlayerId ? 'current' : ''}`}
          >
            <span className="name">{player.name}</span>
            <span className="score">{player.score}점</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatus;
