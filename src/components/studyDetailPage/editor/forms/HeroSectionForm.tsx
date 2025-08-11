import React, { useState } from 'react';
import StudyDetailRichTextEditor from '../../../common/richtext/StudyDetailRichTextEditor';
import { RichTextData } from '../../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../../common/richtext/RichTextConverter';
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
      alert('제목은 필수 입력 항목입니다.');
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

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    // RichText 형식으로 변환
    setTitle(RichTextConverter.fromHTML('💯 코테 스터디<br/>테코테코'));
    setSubtitle(RichTextConverter.fromHTML('변화 속에서<br/><span class="highlight">변치 않는 ____를 찾다</span>'));
    setDescription('기술 변화 속 흔들리지 않는 개발자 사고의 뿌리를 탐구하고, 단순한 코딩 테스트를 넘어 자료구조와 알고리즘의 본질에 Deep Dive합니다.');
    setButtonText('참가 신청하기');
    setButtonLink('#apply');
    setBackgroundImage('/images/tecoteco/profile1.svg');
    
    // InfoBox 예시 데이터
    setUseInfoBox(true);
    setInfoBoxHeader('TecoTeco: 함께 성장할 용기');
    setInfoBoxItems([
      {
        icon: '💡',
        text: RichTextConverter.fromHTML('기술 변화 속 <span class="highlight">흔들리지 않는 개발자 사고의 뿌리</span>를 탐구해요.')
      },
      {
        icon: '📚',
        text: RichTextConverter.fromHTML('단순한 코딩 테스트 넘어, <span class="highlight">자료구조와 알고리즘의 본질</span>에 Deep Dive 해요.')
      },
      {
        icon: '🤝',
        text: RichTextConverter.fromHTML('서로의 질문이 <span class="highlight">해답</span>이 되고, <span class="highlight">함께 성장</span>하는 시너지를 경험해요.')
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-hero-form">
      <div className="study-management-hero-form-group">
        <label>제목 *</label>
        <StudyDetailRichTextEditor
          value={title}
          onChange={setTitle}
          placeholder="예: 💯 코테 스터디 [줄바꿈] 테코테코"
          toolbar={['break', 'emoji', 'bold', 'color']}
          singleLine={false}
        />
      </div>

      <div className="study-management-hero-form-group">
        <label>부제목</label>
        <StudyDetailRichTextEditor
          value={subtitle}
          onChange={setSubtitle}
          placeholder="예: 변화 속에서 [줄바꿈] 변치 않는 ____를 찾다 (텍스트 선택 후 하이라이트)"
          toolbar={['break', 'highlight', 'subtle-highlight', 'color']}
          singleLine={false}
        />
      </div>

      <div className="study-management-hero-form-group">
        <label>설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="스터디에 대한 자세한 설명을 입력하세요"
          className="study-management-hero-textarea"
          rows={4}
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
          placeholder="예: /images/tecoteco/profile1.svg"
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
            {' '}정보 박스 사용 (TecoTeco 스타일)
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
                placeholder="예: TecoTeco: 함께 성장할 용기"
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

      <div className="study-management-hero-form-group">
        <button 
          type="button" 
          onClick={loadExampleData}
          className="study-management-hero-example-btn"
        >
          TecoTeco 예시 데이터 불러오기
        </button>
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