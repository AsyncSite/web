import React, { useState, useRef, useEffect } from 'react';
import { StudyTemplateType, StudyTemplate } from './types';
import { STUDY_TEMPLATES } from './index';

interface TemplateSelectorProps {
  selectedTemplate: StudyTemplateType | null;
  onSelectTemplate: (type: StudyTemplateType) => void;
  availableTemplates?: StudyTemplateType[];
  popularTemplates?: StudyTemplateType[]; // 자주 사용되는 템플릿
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  availableTemplates,
  popularTemplates = ['algorithm', 'bookclub'] // 기본 인기 템플릿
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 사용 가능한 템플릿 목록
  const allTemplates = availableTemplates || (Object.keys(STUDY_TEMPLATES) as StudyTemplateType[]);

  // 인기 템플릿과 나머지 템플릿 분리
  const popularList = allTemplates.filter(t => popularTemplates.includes(t));
  const moreTemplates = allTemplates.filter(t => !popularTemplates.includes(t));

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 템플릿 버튼 렌더링 함수
  const renderTemplateButton = (templateType: StudyTemplateType, isInDropdown: boolean = false) => {
    const template = STUDY_TEMPLATES[templateType];
    const isSelected = selectedTemplate === templateType;

    return (
      <button
        key={templateType}
        type="button"
        onClick={() => {
          onSelectTemplate(templateType);
          setIsDropdownOpen(false);
        }}
        style={{
          padding: isInDropdown ? '10px 16px' : '8px 16px',
          background: isSelected
            ? template.color.gradient.replace('0.1', '0.3')
            : template.color.gradient,
          border: isSelected
            ? `2px solid ${template.color.primary.replace(')', ', 0.6)').replace('rgb', 'rgba')}`
            : `1px solid ${template.color.primary.replace(')', ', 0.3)').replace('rgb', 'rgba')}`,
          borderRadius: '6px',
          color: template.color.primary,
          fontSize: '14px',
          fontWeight: isSelected ? '600' : '500',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: isInDropdown ? 'flex' : 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          width: isInDropdown ? '100%' : 'auto',
          justifyContent: isInDropdown ? 'flex-start' : 'center',
          transform: isSelected && !isInDropdown ? 'scale(1.05)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = template.color.gradient.replace('0.1', '0.2');
            e.currentTarget.style.borderColor = template.color.primary.replace(')', ', 0.5)').replace('rgb', 'rgba');
            if (!isInDropdown) {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.background = template.color.gradient;
            e.currentTarget.style.borderColor = template.color.primary.replace(')', ', 0.3)').replace('rgb', 'rgba');
            if (!isInDropdown) {
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>{template.icon}</span>
        {template.name}
        {isSelected && isInDropdown && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '12px',
            opacity: 0.8
          }}>✓</span>
        )}
      </button>
    );
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginBottom: '20px',
      position: 'relative'
    }}>
      {/* 인기 템플릿 버튼들 */}
      {popularList.map(templateType => renderTemplateButton(templateType))}

      {/* 더 많은 템플릿 드롭다운 */}
      {moreTemplates.length > 0 && (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.9)',
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
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.15))';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.1))';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <span style={{ fontSize: '16px' }}>✨</span>
            더 많은 템플릿
            <span style={{
              fontSize: '12px',
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s'
            }}>▼</span>
          </button>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              minWidth: '200px',
              background: 'rgba(30, 30, 40, 0.98)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'slideDown 0.2s ease'
            }}>
              <div style={{
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {moreTemplates.length > 0 ? (
                  moreTemplates.map(templateType => renderTemplateButton(templateType, true))
                ) : (
                  <div style={{
                    padding: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '13px',
                    textAlign: 'center'
                  }}>
                    추가 템플릿이 곧 제공됩니다
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 드롭다운 애니메이션을 위한 스타일 */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default TemplateSelector;