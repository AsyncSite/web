import React from 'react';

interface ScheduleSectionProps {
  data: any;
}

const ScheduleSection: React.FC<ScheduleSectionProps> = ({ data }) => {
  return (
    <div style={{ padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2>일정</h2>
        <p>일정 섹션은 준비 중입니다</p>
      </div>
    </div>
  );
};

export default ScheduleSection;