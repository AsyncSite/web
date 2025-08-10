import React, { useState } from 'react';
import './SectionForms.css';

interface InfoBoxItem {
  icon: string;
  text: string;
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
  const [title, setTitle] = useState(initialData.title || '');
  const [subtitle, setSubtitle] = useState(initialData.subtitle || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [buttonText, setButtonText] = useState(initialData.buttonText || '참가 신청하기');
  const [buttonLink, setButtonLink] = useState(initialData.buttonLink || '#apply');
  const [backgroundImage, setBackgroundImage] = useState(initialData.backgroundImage || initialData.image || '');
  
  // InfoBox 관련 상태
  const [useInfoBox, setUseInfoBox] = useState(!!initialData.infoBox);
  const [infoBoxHeader, setInfoBoxHeader] = useState(initialData.infoBox?.header || '');
  const [infoBoxItems, setInfoBoxItems] = useState<InfoBoxItem[]>(
    initialData.infoBox?.items || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      alert('제목은 필수 입력 항목입니다.');
      return;
    }

    const data: any = {
      title,
      subtitle,
      description,
      buttonText,
      buttonLink,
      image: backgroundImage
    };

    // InfoBox가 활성화되어 있고 아이템이 있으면 추가
    if (useInfoBox && (infoBoxHeader || infoBoxItems.length > 0)) {
      data.infoBox = {
        header: infoBoxHeader,
        items: infoBoxItems
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
  const updateInfoBoxItem = (index: number, field: 'icon' | 'text', value: string) => {
    const updatedItems = [...infoBoxItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setInfoBoxItems(updatedItems);
  };

  // TecoTeco 예시 데이터
  const loadExampleData = () => {
    setTitle('💯 코테 스터디<br/>테코테코');
    setSubtitle('변화 속에서<br/><span class="highlight">변치 않는 ____를 찾다</span>');
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
        text: '기술 변화 속 <span class="highlight">흔들리지 않는 개발자 사고의 뿌리</span>를 탐구해요.'
      },
      {
        icon: '📚',
        text: '단순한 코딩 테스트 넘어, <span class="highlight">자료구조와 알고리즘의 본질</span>에 Deep Dive 해요.'
      },
      {
        icon: '🤝',
        text: '서로의 질문이 <span class="highlight">해답</span>이 되고, <span class="highlight">함께 성장</span>하는 시너지를 경험해요.'
      }
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="section-form hero-form">
      <div className="form-group">
        <label>제목 * <small style={{ color: 'rgba(255, 255, 255, 0.5)' }}>(HTML 태그 사용 가능)</small></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 💯 코테 스터디<br/>테코테코"
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label>부제목 <small style={{ color: 'rgba(255, 255, 255, 0.5)' }}>(HTML 태그 사용 가능)</small></label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder='예: 변화 속에서<br/><span class="highlight">변치 않는 ____를 찾다</span>'
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="스터디에 대한 자세한 설명을 입력하세요"
          className="form-textarea"
          rows={4}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>버튼 텍스트</label>
          <input
            type="text"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="예: 참가 신청하기"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>버튼 링크</label>
          <input
            type="text"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="예: #apply 또는 /study/apply"
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label>이미지 URL</label>
        <input
          type="text"
          value={backgroundImage}
          onChange={(e) => setBackgroundImage(e.target.value)}
          placeholder="예: /images/tecoteco/profile1.svg"
          className="form-input"
        />
        {backgroundImage && (
          <div className="image-preview">
            <img src={backgroundImage} alt="이미지 미리보기" />
          </div>
        )}
      </div>

      {/* InfoBox 섹션 */}
      <div className="form-section">
        <div className="form-group">
          <label>
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
            <div className="form-group">
              <label>정보 박스 헤더</label>
              <input
                type="text"
                value={infoBoxHeader}
                onChange={(e) => setInfoBoxHeader(e.target.value)}
                placeholder="예: TecoTeco: 함께 성장할 용기"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>
                정보 박스 아이템
                <button
                  type="button"
                  onClick={addInfoBoxItem}
                  className="add-item-btn"
                  style={{ 
                    marginLeft: '10px',
                    padding: '6px 12px',
                    backgroundColor: 'rgba(195, 232, 141, 0.2)',
                    color: '#C3E88D',
                    border: '1px solid #C3E88D',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(195, 232, 141, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(195, 232, 141, 0.2)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  + 아이템 추가
                </button>
              </label>
              
              {infoBoxItems.map((item, index) => (
                <div key={index} className="info-box-item" style={{ 
                  marginBottom: '15px', 
                  padding: '15px', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)'
                }}>
                  <div className="form-row">
                    <div style={{ flex: '0 0 80px' }}>
                      <label>아이콘</label>
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => updateInfoBoxItem(index, 'icon', e.target.value)}
                        placeholder="예: 💡"
                        className="form-input"
                        style={{ textAlign: 'center' }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>텍스트 <small style={{ color: 'rgba(255, 255, 255, 0.5)' }}>(HTML 태그 사용 가능)</small></label>
                      <input
                        type="text"
                        value={item.text}
                        onChange={(e) => updateInfoBoxItem(index, 'text', e.target.value)}
                        placeholder='예: 기술 변화 속 <span class="highlight">흔들리지 않는 개발자 사고의 뿌리</span>를 탐구해요.'
                        className="form-input"
                      />
                    </div>
                    <div style={{ flex: '0 0 60px', display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => removeInfoBoxItem(index)}
                        className="remove-btn"
                        style={{ 
                          width: '100%',
                          padding: '8px',
                          backgroundColor: 'rgba(255, 68, 68, 0.8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          transition: 'background-color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ff4444'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.8)'}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {infoBoxItems.length === 0 && (
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                  아이템을 추가하여 정보 박스를 구성하세요
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="form-group">
        <button 
          type="button" 
          onClick={loadExampleData}
          className="example-btn"
        >
          TecoTeco 예시 데이터 불러오기
        </button>
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

export default HeroSectionForm;