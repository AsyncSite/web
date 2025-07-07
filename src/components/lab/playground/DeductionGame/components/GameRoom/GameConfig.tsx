import React from 'react';

interface GameConfigProps {
  config: any;
  onConfigChange: (config: any) => void;
}

const GameConfig: React.FC<GameConfigProps> = ({ config, onConfigChange }) => {
  return (
    <div className="game-config">
      <h3>게임 설정</h3>
      <div className="config-options">
        <label>
          키워드 풀 크기:
          <input
            type="number"
            value={config.keywordPoolSize}
            onChange={(e) =>
              onConfigChange({ ...config, keywordPoolSize: parseInt(e.target.value) })
            }
          />
        </label>
        <label>
          정답 개수:
          <input
            type="number"
            value={config.answerCount}
            onChange={(e) => onConfigChange({ ...config, answerCount: parseInt(e.target.value) })}
          />
        </label>
      </div>
    </div>
  );
};

export default GameConfig;
