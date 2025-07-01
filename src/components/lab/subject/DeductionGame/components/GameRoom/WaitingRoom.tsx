import React from 'react';

interface WaitingRoomProps {
  roomCode: string;
  participants: any[];
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomCode, participants }) => {
  return (
    <div className="waiting-room">
      <h2>대기실</h2>
      <p>방 코드: {roomCode}</p>
      <div className="participants-list">
        {participants.map((participant, index) => (
          <div key={index} className="participant">
            {participant.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WaitingRoom;