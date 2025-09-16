import React, { useState } from 'react';
import { JourneySectionData, Generation, journeyTemplates } from '../../types/journeyTypes';
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';
import StudyDetailRichTextEditor from '../../../common/richtext/StudyDetailRichTextEditor';
import { RichTextData } from '../../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../../common/richtext/RichTextConverter';
import './SectionForms.css';
import './JourneySectionForm.css';

interface JourneySectionFormProps {
  initialData?: JourneySectionData;
  onSave: (data: JourneySectionData) => void;
  onCancel: () => void;
}

const JourneySectionForm: React.FC<JourneySectionFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  // 기본값 설정
  const defaultData: JourneySectionData = {
    tagHeader: '우리의 여정',
    subtitle: '',
    startDate: new Date().toISOString().split('T')[0],
    calculateDays: true,
    generations: [],
    layout: 'list',
    showAchievements: true,
    showIcons: true,
    showStats: false
  };

  // initialData가 있으면 generations 필드가 반드시 존재하도록 보장
  const mergedData: JourneySectionData = initialData 
    ? {
        ...defaultData,
        ...initialData,
        generations: initialData.generations || []
      }
    : defaultData;

  const [data, setData] = useState<JourneySectionData>(mergedData);
  const [editingGenerationIndex, setEditingGenerationIndex] = useState<number | null>(null);
  
  // RichTextEditor states for title, subtitle, and closingMessage
  const [title, setTitle] = useState<RichTextData | string>(
    mergedData.title ? 
      (typeof mergedData.title === 'string' ? RichTextConverter.fromHTML(mergedData.title) : mergedData.title)
      : ''
  );
  const [subtitle, setSubtitle] = useState<RichTextData | string>(
    mergedData.subtitle ? 
      (typeof mergedData.subtitle === 'string' ? RichTextConverter.fromHTML(mergedData.subtitle) : mergedData.subtitle)
      : ''
  );
  const [closingMessage, setClosingMessage] = useState<RichTextData | string>(
    mergedData.closingMessage ? 
      (typeof mergedData.closingMessage === 'string' ? RichTextConverter.fromHTML(mergedData.closingMessage) : mergedData.closingMessage)
      : ''
  );

  // 템플릿 로드
  const loadTemplate = (templateKey: string) => {
    // Use templateData for algorithm template
    if (templateKey === 'algorithm') {
      const journeyData = algorithmTemplate.sections.journey;
      if (!journeyData) return;

      setData({
        ...data,
        ...journeyData,
        generations: [...journeyData.generations],
        layout: journeyData.layout as 'list' | 'timeline' | 'cards' | undefined
      });
      // Set RichTextEditor values
      if (journeyData.title) {
        setTitle(RichTextConverter.fromHTML(journeyData.title));
      }
      if (journeyData.subtitle) {
        setSubtitle(RichTextConverter.fromHTML(journeyData.subtitle));
      }
      if (journeyData.closingMessage) {
        setClosingMessage(RichTextConverter.fromHTML(journeyData.closingMessage));
      }
    } else if (templateKey === 'mogakup') {
      const journeyData = mogakupTemplate.sections.journey;
      if (!journeyData) return;

      setData({
        ...data,
        ...journeyData,
        generations: [...journeyData.generations],
        layout: journeyData.layout as 'list' | 'timeline' | 'cards' | undefined
      });
      // Set RichTextEditor values
      if (journeyData.title) {
        setTitle(RichTextConverter.fromHTML(journeyData.title));
      }
      if (journeyData.subtitle) {
        setSubtitle(RichTextConverter.fromHTML(journeyData.subtitle));
      }
      if (journeyData.closingMessage) {
        setClosingMessage(RichTextConverter.fromHTML(journeyData.closingMessage));
      }
    } else if (templateKey === 'bookStudy') {
      const journeyData = bookStudyTemplate.sections.journey;
      if (!journeyData) return;

      setData({
        ...data,
        ...journeyData,
        generations: [...journeyData.generations],
        layout: journeyData.layout as 'list' | 'timeline' | 'cards' | undefined
      });
      // Set RichTextEditor values
      if (journeyData.title) {
        setTitle(RichTextConverter.fromHTML(journeyData.title));
      }
      if (journeyData.subtitle) {
        setSubtitle(RichTextConverter.fromHTML(journeyData.subtitle));
      }
      if (journeyData.closingMessage) {
        setClosingMessage(RichTextConverter.fromHTML(journeyData.closingMessage));
      }
    } else {
      // Use original journeyTemplates for other templates
      const template = journeyTemplates[templateKey as keyof typeof journeyTemplates];
      setData({
        ...data,
        ...template,
        generations: [...template.generations]
      });
      // Set RichTextEditor values
      if (template.title) {
        setTitle(RichTextConverter.fromHTML(template.title));
      }
      if (template.subtitle) {
        setSubtitle(RichTextConverter.fromHTML(template.subtitle));
      }
      if (template.closingMessage) {
        setClosingMessage(RichTextConverter.fromHTML(template.closingMessage));
      }
    }
  };

  const handleClearTemplate = () => {
    setData(defaultData);
    setTitle(defaultData.title ? RichTextConverter.fromHTML(defaultData.title) : '');
    setSubtitle(defaultData.subtitle ? RichTextConverter.fromHTML(defaultData.subtitle) : '');
    setClosingMessage(defaultData.closingMessage ? RichTextConverter.fromHTML(defaultData.closingMessage) : '');
  };

  // Generation 추가
  const addGeneration = () => {
    const newGeneration: Generation = {
      title: `시즌 ${data.generations.length + 1}`,
      description: '새로운 여정의 시작입니다.',
      icon: '🌟',
      achievements: [],
      status: 'planned'
    };
    setData({
      ...data,
      generations: [...data.generations, newGeneration]
    });
    setEditingGenerationIndex(data.generations.length);
  };

  // Generation 수정
  const updateGeneration = (index: number, updatedGeneration: Generation) => {
    const newGenerations = [...data.generations];
    newGenerations[index] = updatedGeneration;
    setData({ ...data, generations: newGenerations });
  };

  // Generation 삭제
  const removeGeneration = (index: number) => {
    setData({
      ...data,
      generations: data.generations.filter((_, i) => i !== index)
    });
    if (editingGenerationIndex === index) {
      setEditingGenerationIndex(null);
    }
  };

  // Generation 순서 변경
  const moveGeneration = (index: number, direction: 'up' | 'down') => {
    const newGenerations = [...data.generations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newGenerations.length) {
      [newGenerations[index], newGenerations[targetIndex]] = 
      [newGenerations[targetIndex], newGenerations[index]];
      setData({ ...data, generations: newGenerations });
      
      if (editingGenerationIndex === index) {
        setEditingGenerationIndex(targetIndex);
      } else if (editingGenerationIndex === targetIndex) {
        setEditingGenerationIndex(index);
      }
    }
  };

  // Achievement 추가/수정
  const updateAchievements = (genIndex: number, achievements: string[]) => {
    const newGenerations = [...data.generations];
    newGenerations[genIndex].achievements = achievements;
    setData({ ...data, generations: newGenerations });
  };

  // 통계 커스텀 필드 추가
  const addCustomStat = () => {
    const newStats = {
      ...data.stats,
      customStats: [
        ...(data.stats?.customStats || []),
        { label: '새 지표', value: '0', icon: '📊' }
      ]
    };
    setData({ ...data, stats: newStats });
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (data.generations.length === 0) {
      // Validation failed - at least one generation is required
      return;
    }

    // Convert RichTextData to HTML strings
    const titleHtml = title ? (typeof title === 'string' ? title : RichTextConverter.toHTML(title)) : undefined;
    const subtitleHtml = subtitle ? (typeof subtitle === 'string' ? subtitle : RichTextConverter.toHTML(subtitle)) : undefined;
    const closingMessageHtml = closingMessage ? (typeof closingMessage === 'string' ? closingMessage : RichTextConverter.toHTML(closingMessage)) : undefined;

    // 제목 처리 - 경과일 플레이스홀더 포함 가능
    const processedData = {
      ...data,
      title: data.calculateDays && !titleHtml 
        ? '하루하루가 쌓이니 벌써 {days}이 되었어요.'
        : titleHtml,
      subtitle: subtitleHtml,
      closingMessage: closingMessageHtml
    };

    onSave(processedData);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form journey-section-form">
      <TemplateSelector
        onTemplateSelect={loadTemplate}
        onClear={handleClearTemplate}
      />

      {/* 기본 정보 */}
      <div className="form-group">
        <label>태그 헤더</label>
        <input
          type="text"
          value={data.tagHeader || ''}
          onChange={(e) => setData({ ...data, tagHeader: e.target.value })}
          placeholder="우리의 여정"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={data.calculateDays || false}
            onChange={(e) => setData({ ...data, calculateDays: e.target.checked })}
          />
          {' '}경과일 자동 계산
        </label>
      </div>

      {data.calculateDays && (
        <div className="form-group">
          <label>시작 날짜</label>
          <input
            type="date"
            value={data.startDate || ''}
            onChange={(e) => setData({ ...data, startDate: e.target.value })}
            className="form-input"
          />
          <small>제목에 {'{days}'} 사용 시 자동으로 경과일이 표시됩니다</small>
        </div>
      )}

      <div className="form-group">
        <label>제목</label>
        <StudyDetailRichTextEditor
          value={title}
          onChange={setTitle}
          placeholder="하루하루가 쌓이니 벌써 {days}이 되었어요."
          toolbar={['bold', 'italic', 'highlight', 'subtle-highlight', 'color', 'break']}
          maxLength={200}
        />
        {data.calculateDays && <small>제목에 {'{days}'} 사용 시 자동으로 경과일이 표시됩니다</small>}
      </div>

      <div className="form-group">
        <label>부제목</label>
        <StudyDetailRichTextEditor
          value={subtitle}
          onChange={setSubtitle}
          placeholder="작은 시작이 모여 의미 있는 변화를 만들어가고 있어요."
          toolbar={['bold', 'italic', 'highlight', 'subtle-highlight', 'color', 'break']}
          maxLength={300}
        />
      </div>

      {/* 레이아웃 */}
      <div className="form-group">
        <label>레이아웃</label>
        <select
          value={data.layout}
          onChange={(e) => setData({ ...data, layout: e.target.value as any })}
          className="form-select"
        >
          <option value="list">리스트</option>
          <option value="timeline">타임라인</option>
          <option value="cards">카드</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={data.showIcons || false}
            onChange={(e) => setData({ ...data, showIcons: e.target.checked })}
          />
          {' '}아이콘 표시
        </label>
        {' '}
        <label>
          <input
            type="checkbox"
            checked={data.showAchievements || false}
            onChange={(e) => setData({ ...data, showAchievements: e.target.checked })}
          />
          {' '}성과 배지 표시
        </label>
      </div>

      {/* 세대/시즌 관리 */}
      <div className="form-section">
        <div className="section-header">
          <h4>📅 세대/시즌 관리</h4>
          <button type="button" onClick={addGeneration} className="add-btn">
            + 세대 추가
          </button>
        </div>

        <div className="generations-list">
          {data.generations && data.generations.length > 0 ? data.generations.map((generation, index) => (
            <div key={index} className="generation-item">
              {editingGenerationIndex === index ? (
                // 편집 모드
                <div className="generation-edit">
                  <div className="form-row">
                    <input
                      type="text"
                      value={generation.icon || ''}
                      onChange={(e) => updateGeneration(index, { ...generation, icon: e.target.value })}
                      placeholder="아이콘"
                      className="form-input"
                      style={{ width: '80px', textAlign: 'center' }}
                    />
                    <input
                      type="text"
                      value={generation.title}
                      onChange={(e) => updateGeneration(index, { ...generation, title: e.target.value })}
                      placeholder="제목"
                      className="form-input"
                    />
                    <select
                      value={generation.status || 'planned'}
                      onChange={(e) => updateGeneration(index, { ...generation, status: e.target.value as any })}
                      className="form-select"
                      style={{ width: '120px' }}
                    >
                      <option value="completed">완료</option>
                      <option value="ongoing">진행중</option>
                      <option value="planned">계획</option>
                    </select>
                  </div>
                  
                  <textarea
                    value={generation.description}
                    onChange={(e) => updateGeneration(index, { ...generation, description: e.target.value })}
                    placeholder="설명"
                    className="form-textarea"
                    rows={2}
                  />
                  
                  <div className="form-group">
                    <label>성과 (쉼표로 구분)</label>
                    <input
                      type="text"
                      value={generation.achievements?.join(', ') || ''}
                      onChange={(e) => updateAchievements(
                        index,
                        e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      )}
                      placeholder="예: 기본 자료구조 마스터, 문제 해결 패턴 습득"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="item-actions">
                    <button
                      type="button"
                      onClick={() => setEditingGenerationIndex(null)}
                      className="save-btn"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => removeGeneration(index)}
                      className="delete-btn"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ) : (
                // 표시 모드
                <div className="generation-display" onClick={() => setEditingGenerationIndex(index)}>
                  <div className="generation-header">
                    {generation.icon && <span className="icon">{generation.icon}</span>}
                    <strong>{generation.title}</strong>
                    {generation.status && (
                      <span className={`status-badge ${generation.status}`}>
                        {generation.status === 'completed' && '완료'}
                        {generation.status === 'ongoing' && '진행중'}
                        {generation.status === 'planned' && '계획'}
                      </span>
                    )}
                  </div>
                  <p>{generation.description}</p>
                  {generation.achievements && generation.achievements.length > 0 && (
                    <div className="achievements-preview">
                      {generation.achievements.map((ach, i) => (
                        <span key={i} className="achievement-tag">{ach}</span>
                      ))}
                    </div>
                  )}
                  <div className="generation-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveGeneration(index, 'up');
                      }}
                      disabled={index === 0}
                      className="move-btn"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveGeneration(index, 'down');
                      }}
                      disabled={index === data.generations.length - 1}
                      className="move-btn"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
              세대/시즌을 추가하여 여정을 구성하세요
            </p>
          )}
        </div>
      </div>

      {/* 통계 섹션 */}
      <div className="form-section">
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={data.showStats || false}
              onChange={(e) => setData({ ...data, showStats: e.target.checked })}
            />
            {' '}통계 표시
          </label>
        </div>

        {data.showStats && (
          <div className="stats-fields">
            <h4>📊 통계 정보</h4>
            <div className="form-row">
              <div className="form-group">
                <label>해결한 문제</label>
                <input
                  type="text"
                  value={data.stats?.totalProblems || ''}
                  onChange={(e) => setData({
                    ...data,
                    stats: { ...data.stats, totalProblems: e.target.value }
                  })}
                  placeholder="예: 300+"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>함께한 시간</label>
                <input
                  type="text"
                  value={data.stats?.studyHours || ''}
                  onChange={(e) => setData({
                    ...data,
                    stats: { ...data.stats, studyHours: e.target.value }
                  })}
                  placeholder="예: 180+"
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>실력 향상</label>
                <input
                  type="text"
                  value={data.stats?.memberGrowth || ''}
                  onChange={(e) => setData({
                    ...data,
                    stats: { ...data.stats, memberGrowth: e.target.value }
                  })}
                  placeholder="예: 평균 50% 향상"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>팀 만족도</label>
                <input
                  type="text"
                  value={data.stats?.teamSpirit || ''}
                  onChange={(e) => setData({
                    ...data,
                    stats: { ...data.stats, teamSpirit: e.target.value }
                  })}
                  placeholder="예: 100%"
                  className="form-input"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 미래 계획 이미지 */}
      <div className="form-section">
        <h4>🖼️ 미래 계획 이미지 (선택사항)</h4>
        <div className="form-group">
          <label>이미지 URL</label>
          <input
            type="text"
            value={data.futureImage?.src || ''}
            onChange={(e) => setData({
              ...data,
              futureImage: { ...data.futureImage, src: e.target.value }
            })}
            placeholder="예: /images/roadmap.png"
            className="form-input"
          />
        </div>
        {data.futureImage?.src && (
          <>
            <div className="form-group">
              <label>이미지 제목</label>
              <input
                type="text"
                value={data.futureImage?.title || ''}
                onChange={(e) => setData({
                  ...data,
                  futureImage: { ...data.futureImage!, title: e.target.value }
                })}
                placeholder="예: 앞으로의 계획"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>이미지 설명</label>
              <input
                type="text"
                value={data.futureImage?.description || ''}
                onChange={(e) => setData({
                  ...data,
                  futureImage: { ...data.futureImage!, description: e.target.value }
                })}
                placeholder="예: 체계적이고 지속적인 성장을 위한 로드맵"
                className="form-input"
              />
            </div>
            <div className="image-preview">
              <img src={data.futureImage.src} alt="미리보기" />
            </div>
          </>
        )}
      </div>

      {/* 마무리 메시지 */}
      <div className="form-group">
        <label>마무리 메시지 (선택사항)</label>
        <StudyDetailRichTextEditor
          value={closingMessage}
          onChange={setClosingMessage}
          placeholder="작은 걸음이지만 꾸준히, 의미 있게."
          toolbar={['bold', 'italic', 'highlight', 'subtle-highlight', 'color', 'break']}
          maxLength={300}
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

export default JourneySectionForm;