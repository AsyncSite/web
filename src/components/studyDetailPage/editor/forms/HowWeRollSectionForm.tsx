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
  const [theme, setTheme] = useState<'tecoteco' | 'modern' | 'classic'>(initialData?.theme || 'tecoteco');
  
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
      theme,
      meetingOverview,
      schedule
    };

    onSave(data);
  };

  return (
    <form className="how-we-roll-section-form study-management-how-we-roll-section-editor" onSubmit={handleSubmit}>
      <div className="form-header">
        <h3>모임 진행 방식 섹션 편집</h3>
        <div className="template-buttons">
          <button type="button" onClick={() => loadTemplate('algorithm')} className="template-btn">
            알고리즘 템플릿
          </button>
          <button type="button" onClick={() => loadTemplate('design')} className="template-btn">
            디자인 템플릿
          </button>
          <button type="button" onClick={() => loadTemplate('language')} className="template-btn">
            언어 템플릿
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>테마</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
          <option value="tecoteco">TecoTeco (다크)</option>
          <option value="modern">Modern (밝은)</option>
          <option value="classic">Classic (심플)</option>
        </select>
      </div>

      <div className="form-group">
        <label>태그 헤더 (선택)</label>
        <input
          type="text"
          value={tagHeader}
          onChange={(e) => setTagHeader(e.target.value)}
          placeholder="예: 모임 상세 안내"
        />
      </div>

      <div className="form-group">
        <label>제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 특별한 건 없어요. 그냥 계속 모일 뿐이에요."
          required
        />
        <small>줄바꿈은 입력 시 자동 처리됩니다</small>
      </div>

      <div className="form-group">
        <label>부제목 (선택)</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="섹션 부제목"
        />
      </div>

      <div className="form-section">
        <div className="section-header">
          <h4>모임 개요</h4>
          <button type="button" onClick={addOverviewItem} className="study-management-how-we-roll-section-editor__add-button">
            + 항목 추가
          </button>
        </div>
        
        <div className="study-management-how-we-roll-section-editor__overview-list">
          {meetingOverview.map((item, index) => (
            <div key={index} className="study-management-how-we-roll-section-editor__overview-item">
              {editingOverviewIndex === index ? (
                <div className="study-management-how-we-roll-section-editor__item-edit-grid">
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => updateOverviewItem(index, { icon: e.target.value })}
                    placeholder="아이콘 (이모지)"
                    className="study-management-how-we-roll-section-editor__icon-input"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateOverviewItem(index, { title: e.target.value })}
                    placeholder="제목"
                  />
                  <input
                    type="text"
                    value={item.highlight}
                    onChange={(e) => updateOverviewItem(index, { highlight: e.target.value })}
                    placeholder="강조 텍스트"
                  />
                  <input
                    type="text"
                    value={item.description || ''}
                    onChange={(e) => updateOverviewItem(index, { description: e.target.value })}
                    placeholder="설명 (선택)"
                  />
                  <input
                    type="text"
                    value={item.subNote || ''}
                    onChange={(e) => updateOverviewItem(index, { subNote: e.target.value })}
                    placeholder="추가 메모 (선택)"
                  />
                  <input
                    type="text"
                    value={item.link || ''}
                    onChange={(e) => updateOverviewItem(index, { link: e.target.value })}
                    placeholder="링크 (선택)"
                  />
                  <select
                    value={item.type}
                    onChange={(e) => updateOverviewItem(index, { type: e.target.value })}
                  >
                    <option value="general">일반</option>
                    <option value="main-meeting">정기 모임</option>
                    <option value="study-material">학습 자료</option>
                    <option value="cost-info">비용 정보</option>
                  </select>
                  <div className="item-actions">
                    <button type="button" onClick={() => setEditingOverviewIndex(null)}>
                      완료
                    </button>
                    <button type="button" onClick={() => deleteOverviewItem(index)} className="study-management-how-we-roll-section-editor__remove-button">
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overview-display" onClick={() => setEditingOverviewIndex(index)}>
                  <span className="icon">{item.icon}</span>
                  <div className="content">
                    <strong>{item.title}</strong>
                    <span className="highlight">{item.highlight}</span>
                    {item.description && <p>{item.description}</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>서브 헤딩 (선택)</label>
        <input
          type="text"
          value={subHeading}
          onChange={(e) => setSubHeading(e.target.value)}
          placeholder="예: 몰입, 해본 적 있으세요?"
        />
      </div>

      <div className="form-group">
        <label>스케줄 소개 (선택)</label>
        <textarea
          value={scheduleIntro}
          onChange={(e) => setScheduleIntro(e.target.value)}
          placeholder="스케줄 소개 문구"
          rows={2}
        />
      </div>

      <div className="form-section">
        <div className="section-header">
          <h4>스케줄</h4>
          <button type="button" onClick={addScheduleItem} className="study-management-how-we-roll-section-editor__add-button">
            + 시간표 추가
          </button>
        </div>
        
        <div className="study-management-how-we-roll-section-editor__schedule-list">
          {schedule.map((item, index) => (
            <div key={index} className="study-management-how-we-roll-section-editor__schedule-item">
              {editingScheduleIndex === index ? (
                <div className="study-management-how-we-roll-section-editor__item-edit-grid">
                  <input
                    type="text"
                    value={item.time}
                    onChange={(e) => updateScheduleItem(index, { time: e.target.value })}
                    placeholder="시간 (예: 19:30 ~ 20:20)"
                  />
                  <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => updateScheduleItem(index, { activity: e.target.value })}
                    placeholder="활동명"
                  />
                  <textarea
                    value={item.detail}
                    onChange={(e) => updateScheduleItem(index, { detail: e.target.value })}
                    placeholder="상세 설명"
                    rows={2}
                  />
                  <select
                    value={item.type}
                    onChange={(e) => updateScheduleItem(index, { type: e.target.value as 'primary' | 'secondary' })}
                  >
                    <option value="primary">주요 활동</option>
                    <option value="secondary">부가 활동</option>
                  </select>
                  <div className="item-actions">
                    <button type="button" onClick={() => setEditingScheduleIndex(null)}>
                      완료
                    </button>
                    <button type="button" onClick={() => deleteScheduleItem(index)} className="study-management-how-we-roll-section-editor__remove-button">
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                <div className="schedule-display" onClick={() => setEditingScheduleIndex(index)}>
                  <strong>{item.time}</strong>
                  <span className={`activity ${item.type}`}>{item.activity}</span>
                  <p>{item.detail}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>마무리 메시지 (선택)</label>
        <textarea
          value={closingMessage}
          onChange={(e) => setClosingMessage(e.target.value)}
          placeholder="섹션을 마무리하는 메시지"
          rows={3}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          취소
        </button>
        <button type="submit" className="save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default HowWeRollSectionForm;