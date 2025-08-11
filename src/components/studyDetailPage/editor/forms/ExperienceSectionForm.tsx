import React, { useState } from 'react';
import { ExperienceSectionData, StepContent, experienceTemplates } from '../../types/experienceTypes';
import './SectionForm.css';

interface ExperienceSectionFormProps {
  initialData?: ExperienceSectionData;
  onSave: (data: ExperienceSectionData) => void;
  onCancel: () => void;
}

const ExperienceSectionForm: React.FC<ExperienceSectionFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ExperienceSectionData>(
    initialData || {
      tagHeader: '성장을 위한 스텝',
      title: '테코테코 모임을 한다는 건',
      subtitle: '매주 금요일 저녁, 이런 루틴으로 함께 성장해요.',
      highlightText: '이런 루틴',
      steps: [],
      theme: 'tecoteco',
      layout: 'horizontal',
      enableAnimation: true,
      animationType: 'fadeIn',
      defaultActiveStep: 0,
      navigationStyle: 'numbers',
      mobileCollapse: false
    }
  );

  const handleInputChange = (field: keyof ExperienceSectionData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStepChange = (index: number, field: keyof StepContent, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
    const newStep: StepContent = {
      label: '새로운 단계',
      title: '단계 제목',
      description: '단계 설명을 입력하세요.',
      illustrationType: 'problem'
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSteps.length) {
      [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
      setFormData(prev => ({
        ...prev,
        steps: newSteps
      }));
    }
  };

  const loadTemplate = (templateKey: keyof typeof experienceTemplates) => {
    const template = experienceTemplates[templateKey];
    setFormData(template);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="section-form experience-section-form">
      <h3 className="form-title">Experience 섹션 편집</h3>
      
      <form onSubmit={handleSubmit}>
        {/* 템플릿 선택 */}
        <div className="form-group">
          <label>템플릿 불러오기</label>
          <div className="template-buttons">
            <button
              type="button"
              onClick={() => loadTemplate('algorithm')}
              className="template-btn"
            >
              알고리즘 스터디
            </button>
            <button
              type="button"
              onClick={() => loadTemplate('design')}
              className="template-btn"
            >
              디자인 프로세스
            </button>
            <button
              type="button"
              onClick={() => loadTemplate('project')}
              className="template-btn"
            >
              프로젝트 진행
            </button>
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="form-group">
          <label>태그 헤더</label>
          <input
            type="text"
            value={formData.tagHeader || ''}
            onChange={(e) => handleInputChange('tagHeader', e.target.value)}
            placeholder="예: 성장을 위한 스텝"
          />
        </div>

        <div className="form-group">
          <label>제목 *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            placeholder="섹션 제목을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label>부제목</label>
          <textarea
            value={formData.subtitle || ''}
            onChange={(e) => handleInputChange('subtitle', e.target.value)}
            rows={2}
            placeholder="부제목을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label>하이라이트 텍스트</label>
          <input
            type="text"
            value={formData.highlightText || ''}
            onChange={(e) => handleInputChange('highlightText', e.target.value)}
            placeholder="부제목 내에서 강조할 텍스트"
          />
          <small>부제목 내에 포함된 텍스트를 강조 표시합니다</small>
        </div>

        {/* 스텝 관리 */}
        <div className="form-group">
          <label>스텝 단계</label>
          <div className="steps-editor">
            {formData.steps.map((step, index) => (
              <div key={index} className="step-editor-item">
                <div className="step-header">
                  <span className="step-number">스텝 {index + 1}</span>
                  <div className="step-actions">
                    <button
                      type="button"
                      onClick={() => moveStep(index, 'up')}
                      disabled={index === 0}
                      className="move-btn"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveStep(index, 'down')}
                      disabled={index === formData.steps.length - 1}
                      className="move-btn"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                <div className="step-fields">
                  <div className="field-row">
                    <div className="field-col">
                      <label>라벨</label>
                      <input
                        type="text"
                        value={step.label}
                        onChange={(e) => handleStepChange(index, 'label', e.target.value)}
                        placeholder="예: 문제를 만나고"
                      />
                    </div>
                    <div className="field-col">
                      <label>일러스트 타입</label>
                      <select
                        value={step.illustrationType || 'problem'}
                        onChange={(e) => handleStepChange(index, 'illustrationType', e.target.value as any)}
                      >
                        <option value="problem">문제</option>
                        <option value="question">질문</option>
                        <option value="explore">탐구</option>
                        <option value="review">리뷰</option>
                        <option value="grow">성장</option>
                        <option value="custom">커스텀</option>
                      </select>
                    </div>
                  </div>
                  
                  <label>제목</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => handleStepChange(index, 'title', e.target.value)}
                    placeholder="스텝 제목"
                  />
                  
                  <label>설명</label>
                  <textarea
                    value={step.description}
                    onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                    rows={3}
                    placeholder="스텝 설명"
                  />
                  
                  {step.illustrationType === 'custom' && (
                    <>
                      <label>커스텀 SVG 코드</label>
                      <textarea
                        value={step.customSvg || ''}
                        onChange={(e) => handleStepChange(index, 'customSvg', e.target.value)}
                        rows={4}
                        placeholder="SVG 코드를 입력하세요"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addStep}
              className="add-step-btn"
            >
              + 스텝 추가
            </button>
          </div>
        </div>

        {/* 스타일 설정 */}
        <div className="form-section">
          <h4>스타일 설정</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label>테마</label>
              <select
                value={formData.theme}
                onChange={(e) => handleInputChange('theme', e.target.value)}
              >
                <option value="tecoteco">테코테코</option>
                <option value="modern">모던</option>
                <option value="classic">클래식</option>
                <option value="minimal">미니멀</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>레이아웃</label>
              <select
                value={formData.layout}
                onChange={(e) => handleInputChange('layout', e.target.value)}
              >
                <option value="horizontal">가로</option>
                <option value="vertical">세로</option>
                <option value="grid">그리드</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>네비게이션 스타일</label>
              <select
                value={formData.navigationStyle}
                onChange={(e) => handleInputChange('navigationStyle', e.target.value)}
              >
                <option value="numbers">숫자</option>
                <option value="dots">점</option>
                <option value="progress">프로그레스</option>
                <option value="timeline">타임라인</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>초기 활성 스텝</label>
              <input
                type="number"
                min="0"
                max={formData.steps.length - 1}
                value={formData.defaultActiveStep ?? 0}
                onChange={(e) => handleInputChange('defaultActiveStep', e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>주 색상</label>
              <input
                type="color"
                value={formData.primaryColor || '#C3E88D'}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>보조 색상</label>
              <input
                type="color"
                value={formData.secondaryColor || '#89DDFF'}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 애니메이션 설정 */}
        <div className="form-section">
          <h4>애니메이션 설정</h4>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.enableAnimation}
                onChange={(e) => handleInputChange('enableAnimation', e.target.checked)}
              />
              애니메이션 활성화
            </label>
          </div>
          
          {formData.enableAnimation && (
            <div className="form-group">
              <label>애니메이션 타입</label>
              <select
                value={formData.animationType}
                onChange={(e) => handleInputChange('animationType', e.target.value)}
              >
                <option value="fadeIn">페이드인</option>
                <option value="slideUp">슬라이드업</option>
                <option value="scale">스케일</option>
              </select>
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.autoProgress}
                onChange={(e) => handleInputChange('autoProgress', e.target.checked)}
              />
              자동 진행
            </label>
          </div>
          
          {formData.autoProgress && (
            <div className="form-group">
              <label>자동 진행 간격 (밀리초)</label>
              <input
                type="number"
                min="1000"
                max="10000"
                step="500"
                value={formData.autoProgressInterval || 5000}
                onChange={(e) => handleInputChange('autoProgressInterval', parseInt(e.target.value))}
              />
            </div>
          )}
        </div>

        {/* 모바일 설정 */}
        <div className="form-section">
          <h4>모바일 설정</h4>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.mobileCollapse}
                onChange={(e) => handleInputChange('mobileCollapse', e.target.checked)}
              />
              모바일에서 아코디언 형태로 표시
            </label>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            취소
          </button>
          <button type="submit" className="save-btn">
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExperienceSectionForm;