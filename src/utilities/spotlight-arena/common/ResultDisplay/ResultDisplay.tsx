import { useEffect, useState } from 'react';
import { Participant } from '../../shared/types';
import './ResultDisplay.css';

interface ResultDisplayProps {
  winners: Participant[];
  gameName: string;
  onReplay?: () => void;
  onNewGame?: () => void;
  onGoHome?: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  winners,
  gameName,
  onReplay,
  onNewGame,
  onGoHome,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const copyResults = () => {
    const resultText =
      `🎊 ${gameName} 추첨 결과 🎊\n\n` +
      winners
        .map((winner, index) => {
          const rank =
            index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}등`;
          return `${rank} ${winner.name}`;
        })
        .join('\n');

    navigator.clipboard.writeText(resultText);
    setCopiedToClipboard(true);
    setTimeout(() => setCopiedToClipboard(false), 2000);
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${index + 1}등`;
    }
  };

  return (
    <div className="result-display">
      {showConfetti && <div className="confetti-container" />}

      <div className="result-content">
        <h2 className="result-title">🎊 축하합니다! 🎊</h2>

        <div className="winners-list">
          {winners.map((winner, index) => (
            <div
              key={winner.id}
              className={`winner-item rank-${index + 1}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <span className="winner-rank">{getRankEmoji(index)}</span>
              <span className="winner-name">{winner.name}</span>
            </div>
          ))}
        </div>

        <div className="result-actions">
          <button className="result-button copy-button" onClick={copyResults}>
            {copiedToClipboard ? '✅ 복사됨!' : '📋 결과 복사'}
          </button>

          {onReplay && (
            <button className="result-button replay-button" onClick={onReplay}>
              🔄 다시 추첨
            </button>
          )}

          {onNewGame && (
            <button className="result-button new-game-button" onClick={onNewGame}>
              🎮 다른 게임
            </button>
          )}

          {onGoHome && (
            <button className="result-button home-button" onClick={onGoHome}>
              🏠 처음으로
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;
