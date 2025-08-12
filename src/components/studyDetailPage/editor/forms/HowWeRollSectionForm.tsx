import React, { useState } from 'react';
import { 
  HowWeRollData, 
  MeetingOverviewItem, 
  ScheduleItem,
  howWeRollTemplates 
} from '../../types/howWeRollTypes';
import './HowWeRollSectionForm.css';

interface HowWeRollSectionFormProps {
  initialData?: HowWeRollData;
  onSave: (data: HowWeRollData) => void;
  onCancel: () => void;
}

const HowWeRollSectionForm: React.FC<HowWeRollSectionFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || '');
  const [tagHeader, setTagHeader] = useState(initialData?.tagHeader || '');
  const [scheduleIntro, setScheduleIntro] = useState(initialData?.scheduleIntro || '');
  const [subHeading, setSubHeading] = useState(initialData?.subHeading || '');
  const [closingMessage, setClosingMessage] = useState(initialData?.closingMessage || '');
  
  const [meetingOverview, setMeetingOverview] = useState<MeetingOverviewItem[]>(
    initialData?.meetingOverview || []
  );
  
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    initialData?.schedule || []
  );

  const [editingOverviewIndex, setEditingOverviewIndex] = useState<number | null>(null);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState<number | null>(null);

  const loadTemplate = (templateType: 'algorithm' | 'design' | 'language') => {
    const template = howWeRollTemplates[templateType];
    setTitle(template.title);
    setTagHeader(template.tagHeader);
    setScheduleIntro(template.scheduleIntro);
    setSubHeading(template.subHeading);
    setMeetingOverview(template.meetingOverview);
    setSchedule(template.schedule);
  };

  const addOverviewItem = () => {
    const newItem: MeetingOverviewItem = {
      icon: '📍',
      title: '',
      highlight: '',
      type: 'general'
    };
    setMeetingOverview([...meetingOverview, newItem]);
    setEditingOverviewIndex(meetingOverview.length);
  };

  const updateOverviewItem = (index: number, updates: Partial<MeetingOverviewItem>) => {
    const updated = [...meetingOverview];
    updated[index] = { ...updated[index], ...updates };
    setMeetingOverview(updated);
  };

  const deleteOverviewItem = (index: number) => {
    setMeetingOverview(meetingOverview.filter((_, i) => i !== index));
    setEditingOverviewIndex(null);
  };

  const addScheduleItem = () => {
    const newItem: ScheduleItem = {
      time: '',
      activity: '',
      detail: '',
      type: 'primary'
    };
    setSchedule([...schedule, newItem]);
    setEditingScheduleIndex(schedule.length);
  };

  const updateScheduleItem = (index: number, updates: Partial<ScheduleItem>) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], ...updates };
    setSchedule(updated);
  };

  const deleteScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
    setEditingScheduleIndex(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: HowWeRollData = {
      title,
      subtitle: subtitle || undefined,
      tagHeader: tagHeader || undefined,
      scheduleIntro: scheduleIntro || undefined,
      subHeading: subHeading || undefined,
      closingMessage: closingMessage || undefined,
      meetingOverview,
      schedule
    };

    onSave(data);
  };

  return (
    <form className="study-management-hwr-form" onSubmit={handleSubmit}>
      {/* 예시 데이터 버튼 - 우측 정렬 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <button 
          type="button" 
          onClick={() => loadTemplate('algorithm')}
          className="study-management-hwr-example-btn"
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))',
            border: '1px solid rgba(195, 232, 141, 0.3)',
            borderRadius: '6px',
            color: '#C3E88D',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(195, 232, 141, 0.2), rgba(130, 170, 255, 0.2))';
            e.currentTarget.style.borderColor = 'rgba(195, 232, 141, 0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(195, 232, 141, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))';
            e.currentTarget.style.borderColor = 'rgba(195, 232, 141, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          예시 데이터 불러오기
        </button>
      </div>

      <div className="study-management-hwr-form-group">
        <label>태그 헤더 (선택)</label>
        <input
          type="text"
          value={tagHeader}
          onChange={(e) => setTagHeader(e.target.value)}
          placeholder="예: 모임 상세 안내"
          className="study-management-hwr-input"
        />
      </div>

      <div className="study-management-hwr-form-group">
        <label>제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 특별한 건 없어요. 그냥 계속 모일 뿐이에요."
          required
          className="study-management-hwr-input"
        />
        <small className="study-management-hwr-help-text">줄바꿈은 입력 시 자동 처리됩니다</small>
      </div>

      <div className="study-management-hwr-form-group">
        <label>부제목 (선택)</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="섹션 부제목"
          className="study-management-hwr-input"
        />
      </div>

      <div className="study-management-hwr-form-section">
        <div className="study-management-hwr-section-header">
          <h4>모임 개요</h4>
          <button type="button" onClick={addOverviewItem} className="study-management-hwr-add-button">
            + 항목 추가
          </button>
        </div>
        
        <div className="study-management-hwr-overview-list">
          {meetingOverview.map((item, index) => (
            <div key={index} className="study-management-hwr-overview-item">
              {editingOverviewIndex === index ? (
                <div className="study-management-hwr-item-edit-grid">
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => updateOverviewItem(index, { icon: e.target.value })}
                    placeholder="아이콘 (이모지)"
                    className="study-management-hwr-icon-input"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateOverviewItem(index, { title: e.target.value })}
                    placeholder="제목"
                    className="study-management-hwr-input"
                  />
                  <input
                    type="text"
                    value={item.highlight}
                    onChange={(e) => updateOverviewItem(index, { highlight: e.target.value })}
                    placeholder="강조 텍스트"
                    className="study-management-hwr-input"
                  />
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => updateOverviewItem(index, { description: e.target.value })}
                    placeholder="설명 (선택)"
                    className="study-management-hwr-input"
                  />
                  <input
                    type="text"
                    value={item.subNote || ''}
                    onChange={(e) => updateOverviewItem(index, { subNote: e.target.value })}
                    placeholder="추가 메모 (선택)"
                    className="study-management-hwr-input"
                  />
                  <input
                    type="text"
                    value={item.link || ''}
                    onChange={(e) => updateOverviewItem(index, { link: e.target.value })}
                    placeholder="링크 (선택)"
                    className="study-management-hwr-input"
                  />
                  <select
                    value={item.type}
                    onChange={(e) => updateOverviewItem(index, { type: e.target.value })}
                    className="study-management-hwr-select"
                  >
                    <option value="general">일반</option>
                    <option value="main-meeting">정기 모임</option>
                    <option value="study-material">학습 자료</option>
                    <option value="cost-info">비용 정보</option>
                  </select>
                  <div className="study-management-hwr-item-actions">
                    <button type="button" onClick={() => setEditingOverviewIndex(null)} className="study-management-hwr-done-btn">
                      완료
                    </button>
                    <button type="button" onClick={() => deleteOverviewItem(index)} className="study-management-hwr-remove-button">
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="study-management-hwr-overview-display" onClick={() => setEditingOverviewIndex(index)}>
                  <span className="study-management-hwr-overview-icon">{item.icon}</span>
                  <div className="study-management-hwr-overview-content">
                    <strong>{item.title}</strong>
                    <span className="study-management-hwr-overview-highlight">{item.highlight}</span>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="study-management-hwr-form-group">
        <label>서브 헤딩 (선택)</label>
        <input
          type="text"
          value={subHeading}
          onChange={(e) => setSubHeading(e.target.value)}
          placeholder="예: 몰입, 해본 적 있으세요?"
          className="study-management-hwr-input"
        />
      </div>

      <div className="study-management-hwr-form-group">
        <label>스케줄 소개 (선택)</label>
        <textarea
          value={scheduleIntro}
          onChange={(e) => setScheduleIntro(e.target.value)}
          placeholder="스케줄 소개 문구"
          rows={2}
          className="study-management-hwr-textarea"
        />
      </div>

      <div className="study-management-hwr-form-section">
        <div className="study-management-hwr-section-header">
          <h4>스케줄</h4>
          <button type="button" onClick={addScheduleItem} className="study-management-hwr-add-button">
            + 시간표 추가
          </button>
        </div>
        
        <div className="study-management-hwr-schedule-list">
          {schedule.map((item, index) => (
            <div key={index} className="study-management-hwr-schedule-item">
              {editingScheduleIndex === index ? (
                <div className="study-management-hwr-item-edit-grid">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => updateScheduleItem(index, { time: e.target.value })}
                    placeholder="시간 (예: 19:30 ~ 20:20)"
                    className="study-management-hwr-input"
                  />
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => updateScheduleItem(index, { activity: e.target.value })}
                    placeholder="활동명"
                    className="study-management-hwr-input"
                  />
                  <textarea
                    value={item.detail}
                    onChange={(e) => updateScheduleItem(index, { detail: e.target.value })}
                    placeholder="상세 설명"
                    rows={2}
                    className="study-management-hwr-textarea"
                  />
                  <select
                    value={item.type}
                    onChange={(e) => updateScheduleItem(index, { type: e.target.value as 'primary' | 'secondary' })}
                    className="study-management-hwr-select"
                  >
                    <option value="primary">주요 활동</option>
                    <option value="secondary">부가 활동</option>
                  </select>
                  <div className="study-management-hwr-item-actions">
                    <button type="button" onClick={() => setEditingScheduleIndex(null)} className="study-management-hwr-done-btn">
                      완료
                    </button>
                    <button type="button" onClick={() => deleteScheduleItem(index)} className="study-management-hwr-remove-button">
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="study-management-hwr-schedule-display" onClick={() => setEditingScheduleIndex(index)}>
                  <strong className="study-management-hwr-schedule-time">{item.time}</strong>
                  <span className={`study-management-hwr-schedule-activity ${item.type}`}>{item.activity}</span>
                  <p className="study-management-hwr-schedule-detail">{item.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="study-management-hwr-form-group">
        <label>마무리 메시지 (선택)</label>
        <textarea
          value={closingMessage}
          onChange={(e) => setClosingMessage(e.target.value)}
          placeholder="섹션을 마무리하는 메시지"
          rows={3}
          className="study-management-hwr-textarea"
        />
      </div>

      <div className="study-management-hwr-form-actions">
        <button type="button" onClick={onCancel} className="study-management-hwr-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-hwr-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default HowWeRollSectionForm;