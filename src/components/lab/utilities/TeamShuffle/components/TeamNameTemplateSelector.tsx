import React, { useState, useRef, useEffect } from 'react';
import './TeamNameTemplateSelector.css';
import { TeamNameTemplate, TEAM_NAME_TEMPLATES } from '../constants';

interface TeamNameTemplateSelectorProps {
  value: TeamNameTemplate;
  onChange: (template: TeamNameTemplate) => void;
}

export const TeamNameTemplateSelector: React.FC<TeamNameTemplateSelectorProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedTemplate =
    TEAM_NAME_TEMPLATES.find((t) => t.id === value) || TEAM_NAME_TEMPLATES[0];

  return (
    <div className="team-name-template-selector">
      {!showAdvanced ? (
        <button
          className="show-advanced-button"
          onClick={() => setShowAdvanced(true)}
          type="button"
        >
          🎨 팀 이름 스타일 변경
        </button>
      ) : (
        <>
          <div className="team-template-header">
            <h3>팀 이름 스타일</h3>
            <button
              className="hide-advanced-button"
              onClick={() => setShowAdvanced(false)}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="team-template-dropdown" ref={dropdownRef}>
            <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)} type="button">
              <span>{selectedTemplate.label}</span>
              <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="dropdown-menu">
                {/* 중복 제거된 템플릿만 표시 */}
                {TEAM_NAME_TEMPLATES.filter(
                  (template, index, self) => index === self.findIndex((t) => t.id === template.id),
                ).map((template) => (
                  <button
                    key={template.id}
                    className={`dropdown-item ${value === template.id ? 'active' : ''}`}
                    onClick={() => {
                      onChange(template.id);
                      setIsOpen(false);
                    }}
                    type="button"
                  >
                    <span className="template-label">{template.label}</span>
                    <span className="template-preview">
                      {[0, 1, 2].map((i) => template.getTeamName(i)).join(', ')}...
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="team-template-hint">💡 팀 이름을 클릭하면 직접 편집할 수 있습니다</p>
        </>
      )}
    </div>
  );
};
