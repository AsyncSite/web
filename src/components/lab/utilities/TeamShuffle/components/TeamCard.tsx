import React, { useEffect, useState } from 'react';
import './TeamCard.css';
import { Team } from '../utils';
import { EditableTeamName } from './EditableTeamName';

interface TeamCardProps {
  team: Team;
  index: number;
  isNewShuffle?: boolean;
  onTeamNameChange?: (teamId: string, newName: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  index,
  isNewShuffle = false,
  onTeamNameChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (isNewShuffle) {
      // 재셔플 시 플립 애니메이션
      setIsFlipping(true);
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }

    // 초기 등장 애니메이션
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 100);

    return () => clearTimeout(timer);
  }, [index, isNewShuffle]);

  return (
    <div
      className={`team-card ${isVisible ? 'visible' : ''} ${isFlipping ? 'flipping' : ''}`}
      style={{ '--team-index': index } as React.CSSProperties}
    >
      <div className="team-card-inner">
        <div className="team-card-front">
          {onTeamNameChange ? (
            <EditableTeamName
              teamName={team.name}
              teamId={team.id}
              onNameChange={onTeamNameChange}
            />
          ) : (
            <h4 className="team-name">{team.name}</h4>
          )}
          <ul className="team-members">
            {team.members.map((member, memberIndex) => (
              <li
                key={memberIndex}
                className="team-member"
                style={{ '--member-index': memberIndex } as React.CSSProperties}
              >
                {member}
              </li>
            ))}
          </ul>
          <div className="team-member-count">총 {team.members.length}명</div>
        </div>
        <div className="team-card-back">
          <div className="shuffle-animation">🔄</div>
        </div>
      </div>
    </div>
  );
};
