import React from 'react';

interface Participant {
  id: string;
  name: string;
  type: 'human' | 'ai';
  isReady: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
  return (
    <div className="participant-list">
      <h3>참가자 목록</h3>
      <div className="participants">
        {participants.map((participant) => (
          <div key={participant.id} className={`participant ${participant.type}`}>
            <span className="name">{participant.name}</span>
            <span className={`status ${participant.isReady ? 'ready' : 'not-ready'}`}>
              {participant.isReady ? '준비완료' : '준비중'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;