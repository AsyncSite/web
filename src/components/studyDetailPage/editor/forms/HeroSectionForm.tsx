import React, { useState } from 'react';
import StudyDetailRichTextEditor from '../../../common/richtext/StudyDetailRichTextEditor';
import { RichTextData } from '../../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../../common/richtext/RichTextConverter';
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate, systemDesignTemplate, turningPageTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';
import './HeroSectionForm.css';

interface InfoBoxItem {
  icon: string;
  text: string | RichTextData;
}

interface HeroSectionFormProps {
  initialData?: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    backgroundImage?: string;
    image?: string;
    infoBox?: {
      header?: string;
      items?: InfoBoxItem[];
    };
  };
  onSave: (data: any) => void;
  onCancel: () => void;
}

const HeroSectionForm: React.FC<HeroSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  // Title과 Subtitle을 RichText로 관리 (초기값이 HTML이면 변환)
  const [title, setTitle] = useState<RichTextData | string>(
    initialData.title ? 
      (typeof initialData.title === 'string' ? RichTextConverter.fromHTML(initialData.title) : initialData.title)
      : ''
  );
  const [subtitle, setSubtitle] = useState<RichTextData | string>(
    initialData.subtitle ?
      (typeof initialData.subtitle === 'string' ? RichTextConverter.fromHTML(initialData.subtitle) : initialData.subtitle)
      : ''
  );
  const [description, setDescription] = useState(initialData.description || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || '참가 신청하기');
  const [buttonLink, setButtonLink] = useState(initialData.buttonLink || '#apply');
  const [backgroundImage, setBackgroundImage] = useState(initialData.backgroundImage || initialData.image || '');
  
  // InfoBox 관련 상태 (초기값이 HTML이면 변환)
  const [useInfoBox, setUseInfoBox] = useState(!!initialData.infoBox);
  const [infoBoxHeader, setInfoBoxHeader] = useState(initialData.infoBox?.header || '');
  const [infoBoxItems, setInfoBoxItems] = useState<InfoBoxItem[]>(
    initialData.infoBox?.items?.map((item: any) => ({
      icon: item.icon,
      text: typeof item.text === 'string' ? RichTextConverter.fromHTML(item.text) : item.text
    })) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // RichText 또는 문자열 체크
    const titleText = typeof title === 'string' ? title : 
      (title as RichTextData)?.content?.[0]?.content?.[0]?.text || '';
    
    if (!titleText) {
      // Validation failed - don't call onSave
      // Parent component should handle validation errors
      return;
    }

    // RichText를 HTML로 변환하여 저장
    const data: any = {
      title: typeof title === 'string' ? title : RichTextConverter.toHTML(title),
      subtitle: typeof subtitle === 'string' ? subtitle : RichTextConverter.toHTML(subtitle),
      description,
      buttonText,
      buttonLink,
      image: backgroundImage
    };

    // InfoBox가 활성화되어 있고 아이템이 있으면 추가
    if (useInfoBox && (infoBoxHeader || infoBoxItems.length > 0)) {
      data.infoBox = {
        header: infoBoxHeader,
        items: infoBoxItems.map(item => ({
          icon: item.icon,
          text: typeof item.text === 'string' ? item.text : RichTextConverter.toHTML(item.text)
        }))
      };
    }

    onSave(data);
  };

  // InfoBox 아이템 추가
  const addInfoBoxItem = () => {
    setInfoBoxItems([...infoBoxItems, { icon: '', text: '' }]);
  };

  // InfoBox 아이템 삭제
  const removeInfoBoxItem = (index: number) => {
    setInfoBoxItems(infoBoxItems.filter((_, i) => i !== index));
  };

  // InfoBox 아이템 업데이트
  const updateInfoBoxItem = (index: number, field: 'icon' | 'text', value: string | RichTextData) => {
    const updatedItems = [...infoBoxItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInfoBoxItems(updatedItems);
  };

  // 표준 예시 데이터 - templateData.ts에서 가져오기
  const loadExampleData = (templateType: string) => {
    if (!templateType) return;

    let heroData;
    if (templateType === 'algorithm') {
      heroData = algorithmTemplate.sections.hero;
    } else if (templateType === 'mogakup') {
      heroData = mogakupTemplate.sections.hero;
    } else if (templateType === 'bookStudy') {
      heroData = bookStudyTemplate.sections.hero;
    } else if (templateType === 'systemDesign') {
      heroData = systemDesignTemplate.sections.hero;
    } else if (templateType === 'turningPage') {
      heroData = turningPageTemplate.sections.hero;
    } else {
      return;
    }

    if (!heroData) return;

    // RichText 형식으로 변환
    setTitle(RichTextConverter.fromHTML(heroData.title));
    setSubtitle(RichTextConverter.fromHTML(heroData.subtitle));
    setDescription(heroData.description);
    setButtonText(heroData.buttonText);
    setButtonLink(heroData.buttonLink);
    setBackgroundImage(heroData.backgroundImage);

    // InfoBox 예시 데이터
    if (heroData.infoBox) {
      setUseInfoBox(true);
      setInfoBoxHeader(heroData.infoBox.header);
      setInfoBoxItems(
        heroData.infoBox.items.map(item => ({
          icon: item.icon,
          text: RichTextConverter.fromHTML(item.text)
        }))
      );
    }
  };

  // Clear form and reset to initial state
  const handleClearTemplate = () => {
    // Reset all form fields to initial state
    setTitle(initialData.title ?
      (typeof initialData.title === 'string' ? RichTextConverter.fromHTML(initialData.title) : initialData.title)
      : '');
    setSubtitle(initialData.subtitle ?
      (typeof initialData.subtitle === 'string' ? RichTextConverter.fromHTML(initialData.subtitle) : initialData.subtitle)
      : '');
    setDescription(initialData.description || '');
    setButtonText(initialData.buttonText || '참가 신청하기');
    setButtonLink(initialData.buttonLink || '#apply');
    setBackgroundImage(initialData.backgroundImage || initialData.image || '');
    setUseInfoBox(!!initialData.infoBox);
    setInfoBoxHeader(initialData.infoBox?.header || '');
    setInfoBoxItems(
      initialData.infoBox?.items?.map((item: any) => ({
        icon: item.icon,
        text: typeof item.text === 'string' ? RichTextConverter.fromHTML(item.text) : item.text
      })) || []
    );
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-hero-form">
      <TemplateSelector
        onTemplateSelect={loadExampleData}
        onClear={handleClearTemplate}
      />

      <div className="study-management-hero-form-group">
        <div style={{
          marginBottom: '12px'
        }}>
          <label style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#C3E88D'
          }}>제목 *</label>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>스터디의 메인 타이틀을 입력하세요</p>
        </div>
        <StudyDetailRichTextEditor
          value={title}
          onChange={setTitle}
          placeholder="예: 💯 코테 스터디 [줄바꿈] 함께 성장하기"
          toolbar={['break', 'emoji', 'bold', 'color']}
          singleLine={false}
        />
      </div>

      <div className="study-management-hero-form-group">
        <div style={{
          marginBottom: '12px'
        }}>
          <label style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#82AAFF'
          }}>부제목</label>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>하이라이트로 강조할 수 있습니다</p>
        </div>
        <StudyDetailRichTextEditor
          value={subtitle}
          onChange={setSubtitle}
          placeholder="예: 변화 속에서 [줄바꿈] 변치 않는 ____를 찾다 (텍스트 선택 후 하이라이트)"
          toolbar={['break', 'highlight', 'subtle-highlight', 'color']}
          singleLine={false}
        />
      </div>

      <div className="study-management-hero-form-group">
        <div style={{
          marginBottom: '12px'
        }}>
          <label style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#FFB5BA'
          }}>설명</label>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>스터디의 상세한 소개를 작성하세요</p>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="스터디에 대한 자세한 설명을 입력하세요"
          className="study-management-hero-textarea"
          rows={4}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.9)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'rgba(255, 179, 186, 0.4)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.03)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        />
      </div>

      <div className="study-management-hero-form-row">
        <div className="study-management-hero-form-group">
          <label>버튼 텍스트</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="예: 참가 신청하기"
            className="study-management-hero-input"
          />
        </div>

        <div className="study-management-hero-form-group">
          <label>버튼 링크</label>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="예: #apply 또는 /study/apply"
            className="study-management-hero-input"
          />
        </div>
      </div>

      <div className="study-management-hero-form-group">
        <label>이미지 URL</label>
        <input
          type="text"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
          placeholder="예: /images/study/profile1.svg"
          className="study-management-hero-input"
        />
        {backgroundImage && (
          <div className="study-management-hero-image-preview">
            <img src={backgroundImage} alt="이미지 미리보기" />
          </div>
        )}
      </div>

      {/* InfoBox 섹션 */}
      <div className="study-management-hero-form-section">
        <div className="study-management-hero-form-group">
          <label className="study-management-hero-checkbox-label">
            <input
              type="checkbox"
              checked={useInfoBox}
              onChange={(e) => setUseInfoBox(e.target.checked)}
            />
            {' '}정보 박스 사용 (표준 스타일)
          </label>
        </div>

        {useInfoBox && (
          <>
            <div className="study-management-hero-form-group">
              <label>정보 박스 헤더</label>
              <input
                type="text"
                value={infoBoxHeader}
                onChange={(e) => setInfoBoxHeader(e.target.value)}
                placeholder="예: 함께 성장할 용기"
                className="study-management-hero-input"
              />
            </div>

            <div className="study-management-hero-form-group">
              <div className="study-management-hero-label-with-button">
                <label>정보 박스 아이템</label>
                <button
                  type="button"
                  onClick={addInfoBoxItem}
                  className="study-management-hero-add-item-btn"
                >
                  + 아이템 추가
                </button>
              </div>
              
              {infoBoxItems.map((item, index) => (
                <div key={index} className="study-management-hero-info-box-item">
                  <div className="study-management-hero-info-box-row">
                    <div className="study-management-hero-icon-column">
                      <label>아이콘</label>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => updateInfoBoxItem(index, 'icon', e.target.value)}
                        placeholder="예: 💡"
                        className="study-management-hero-input study-management-hero-icon-input"
                      />
                    </div>
                    <div className="study-management-hero-text-column">
                      <label>텍스트</label>
                      <StudyDetailRichTextEditor
                        value={item.text}
                        onChange={(value) => updateInfoBoxItem(index, 'text', value)}
                        placeholder="예: 기술 변화 속 [선택 후 하이라이트] 흔들리지 않는 개발자 사고의 뿌리를 탐구해요."
                        toolbar={['bold', 'italic', 'highlight', 'subtle-highlight']}
                        singleLine={false}
                      />
                    </div>
                    <div className="study-management-hero-action-column">
                      <button
                        type="button"
                        onClick={() => removeInfoBoxItem(index)}
                        className="study-management-hero-remove-btn"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {infoBoxItems.length === 0 && (
                <p className="study-management-hero-empty-state">
                  아이템을 추가하여 정보 박스를 구성하세요
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="study-management-hero-form-actions">
        <button type="button" onClick={onCancel} className="study-management-hero-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-hero-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default HeroSectionForm;