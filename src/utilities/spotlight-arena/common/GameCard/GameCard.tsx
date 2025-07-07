import { GameInfo } from '../../shared/types';
import './GameCard.css';

interface GameCardProps {
  game: GameInfo;
  onClick: () => void;
  participantCount?: number;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick, participantCount = 0 }) => {
  const isPlayable = game.available && 
    participantCount >= game.minPlayers && 
    participantCount <= game.maxPlayers;

  const getStatusMessage = () => {
    if (!game.available) return 'Coming Soon';
    if (participantCount < game.minPlayers) return `최소 ${game.minPlayers}명 필요`;
    if (participantCount > game.maxPlayers) return `최대 ${game.maxPlayers}명까지`;
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div 
      className={`game-card ${!isPlayable ? 'disabled' : ''} ${!game.available ? 'coming-soon' : ''}`}
      onClick={isPlayable ? onClick : undefined}
      data-game-id={game.id}
    >
      <div className="game-card-header">
        <div className="game-card-icon">{game.icon}</div>
        {statusMessage && (
          <div className="game-card-status">{statusMessage}</div>
        )}
      </div>
      
      <div className="game-card-body">
        <h3 className="game-card-title">{game.name}</h3>
        <p className="game-card-description">{game.description}</p>
      </div>
      
      <div className="game-card-footer">
        <div className="game-card-tags">
          {game.tags.map((tag, index) => (
            <span key={index} className="game-card-tag">{tag}</span>
          ))}
        </div>
        <div className="game-card-players">
          <span className="players-icon">👥</span>
          <span className="players-range">{game.minPlayers}-{game.maxPlayers}명</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;