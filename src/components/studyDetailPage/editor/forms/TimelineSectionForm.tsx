import React, { useState } from 'react';
import './TimelineSectionForm.css';

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  type?: 'milestone' | 'deadline' | 'event' | 'info';
}

interface TimelineSectionFormProps {
  initialData?: {
    title?: string;
    events?: TimelineEvent[];
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const TimelineSectionForm: React.FC<TimelineSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '스터디 타임라인');
  const [events, setEvents] = useState<TimelineEvent[]>(
    initialData.events || [
      { date: '', title: '', description: '', type: 'event' }
    ]
  );

  const handleAddEvent = () => {
    setEvents([...events, { date: '', title: '', description: '', type: 'event' }]);
  };

  const handleRemoveEvent = (index: number) => {
    if (events.length > 1) {
      const newEvents = events.filter((_, i) => i !== index);
      setEvents(newEvents);
    }
  };

  const handleEventChange = (index: number, field: keyof TimelineEvent, value: string) => {
    const newEvents = [...events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEvents(newEvents);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty events
    const validEvents = events.filter(event => event.date && event.title);
    
    if (validEvents.length === 0) {
      alert('최소 한 개의 이벤트를 입력해주세요.');
      return;
    }

    // Sort events by date
    validEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    onSave({
      title,
      events: validEvents
    });
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('스터디 진행 일정');
    setEvents([
      {
        date: '2024-03-01',
        title: '모집 시작',
        description: '1기 참가자 모집을 시작합니다',
        type: 'milestone'
      },
      {
        date: '2024-03-15',
        title: '모집 마감',
        description: '참가 신청이 마감됩니다',
        type: 'deadline'
      },
      {
        date: '2024-03-20',
        title: '오리엔테이션',
        description: '첫 만남과 스터디 소개',
        type: 'event'
      },
      {
        date: '2024-03-22',
        title: '스터디 시작',
        description: '12주간의 여정이 시작됩니다',
        type: 'milestone'
      },
      {
        date: '2024-05-01',
        title: '중간 점검',
        description: '6주차 진행 상황 점검 및 피드백',
        type: 'info'
      },
      {
        date: '2024-06-14',
        title: '최종 발표',
        description: '학습 내용 공유 및 회고',
        type: 'event'
      },
      {
        date: '2024-06-15',
        title: '스터디 종료',
        description: '수료증 발급 및 네트워킹',
        type: 'milestone'
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-journey-form">
      <div className="study-management-journey-form-group">
        <label>섹션 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 스터디 진행 일정"
          className="study-management-journey-input"
        />
      </div>

      <div className="study-management-journey-form-group">
        <div className="study-management-journey-group-header">
          <label>타임라인 이벤트</label>
          <button 
            type="button" 
            onClick={loadExampleData}
            className="study-management-journey-example-btn"
          >
            예시 데이터 불러오기
          </button>
        </div>
        
        <div className="study-management-journey-list">
          {events.map((event, index) => (
            <div key={index} className="study-management-journey-item">
              <div className="study-management-journey-item-header">
                <h4>이벤트 {index + 1}</h4>
                {events.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEvent(index)}
                    className="study-management-journey-remove-button"
                  >
                    삭제
                  </button>
                )}
              </div>
              
              <div className="study-management-journey-item-fields">
                <div className="study-management-journey-field-row">
                  <div className="study-management-journey-field">
                    <label>날짜 *</label>
                    <input
                      type="date"
                      value={event.date}
                      onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                      className="study-management-journey-input"
                      required
                    />
                  </div>
                  
                  <div className="study-management-journey-field">
                    <label>이벤트 유형</label>
                    <select
                      value={event.type}
                      onChange={(e) => handleEventChange(index, 'type', e.target.value)}
                      className="study-management-journey-select"
                    >
                      <option value="event">일반 이벤트</option>
                      <option value="milestone">마일스톤</option>
                      <option value="deadline">마감일</option>
                      <option value="info">정보</option>
                    </select>
                  </div>
                </div>
                
                <div className="study-management-journey-field">
                  <label>제목 *</label>
                  <input
                    type="text"
                    value={event.title}
                    onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                    placeholder="예: 스터디 시작"
                    className="study-management-journey-input"
                    required
                  />
                </div>
                
                <div className="study-management-journey-field">
                  <label>설명</label>
                  <textarea
                    value={event.description}
                    onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                    placeholder="예: 12주간의 여정이 시작됩니다"
                    className="study-management-journey-textarea"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          onClick={handleAddEvent}
          className="study-management-journey-add-button"
        >
          + 이벤트 추가
        </button>
      </div>

      <div className="study-management-journey-form-actions">
        <button type="button" onClick={onCancel} className="study-management-journey-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-journey-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default TimelineSectionForm;