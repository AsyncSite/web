import React from 'react';
import { SectionType } from '../../../api/studyDetailPageService';
import HeroSectionForm from './forms/HeroSectionForm';
import MembersSectionForm from './forms/MembersSectionForm';
import ScheduleSectionForm from './forms/ScheduleSectionForm';
import TimelineSectionForm from './forms/TimelineSectionForm';
import ReviewsSectionForm from './forms/ReviewsSectionForm';
import FAQSectionForm from './forms/FAQSectionForm';
import CTASectionForm from './forms/CTASectionForm';
import RichTextSectionForm from './forms/RichTextSectionFormV2';
import HowWeRollSectionForm from './forms/HowWeRollSectionForm';
import JourneySectionForm from './forms/JourneySectionForm';
import './SectionEditForm.css';

interface SectionEditFormProps {
  sectionType: SectionType;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SectionEditForm: React.FC<SectionEditFormProps> = ({
  sectionType,
  initialData = {},
  onSave,
  onCancel
}) => {
  const renderForm = () => {
    switch (sectionType) {
      case SectionType.HERO:
        return (
          <HeroSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.MEMBERS:
        return (
          <MembersSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.SCHEDULE:
        return (
          <ScheduleSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.TIMELINE:
        return (
          <TimelineSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.REVIEWS:
        return (
          <ReviewsSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.FAQ:
        return (
          <FAQSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.CTA:
        return (
          <CTASectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.RICH_TEXT:
        return (
          <RichTextSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.HOW_WE_ROLL:
        return (
          <HowWeRollSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.JOURNEY:
        return (
          <JourneySectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      default:
        return (
          <div className="unsupported-section">
            <p>이 섹션 타입은 아직 지원되지 않습니다: {sectionType}</p>
            <div className="form-actions">
              <button onClick={onCancel}>취소</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="section-edit-form">
      <div className="form-header">
        <h3>{sectionType} 섹션 편집</h3>
      </div>
      <div className="form-content">
        {renderForm()}
      </div>
    </div>
  );
};

export default SectionEditForm;