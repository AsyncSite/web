import React from 'react';
import './MembersSection.css';

interface MembersSectionProps {
  data: {
    members: Array<{
      name: string;
      role: string;
      bio?: string;
      image?: string;
    }>;
    title?: string;
  };
}

const MembersSection: React.FC<MembersSectionProps> = ({ data }) => {
  const { members = [], title = '팀 멤버' } = data;
  
  if (members.length === 0) {
    return null;
  }
  
  return (
    <div className="study-detail-members-section">
      <div className="members-container">
        {title && <h2 className="members-title">{title}</h2>}
        
        <div className="members-grid">
          {members.map((member, index) => (
            <div key={index} className="member-card">
              {member.image && (
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
              )}
              <h3 className="member-name">{member.name}</h3>
              <p className="member-role">{member.role}</p>
              {member.bio && (
                <p className="member-bio">{member.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembersSection;