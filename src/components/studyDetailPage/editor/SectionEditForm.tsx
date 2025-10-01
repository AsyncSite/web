import React from 'react';
import { SectionType, convertSectionTypeToLabel } from '../../../api/studyDetailPageService';
import HeroSectionForm from './forms/HeroSectionForm';
import MembersSectionForm from './forms/MembersSectionForm';
import ReviewSectionForm from './forms/ReviewSectionForm';
import FAQSectionForm from './forms/FAQSectionForm';
import CoffeeChatSectionForm from './forms/CoffeeChatSectionForm';
import RichTextSectionForm from './forms/RichTextSectionFormV2';
import HowWeRollSectionForm from './forms/HowWeRollSectionForm';
import JourneySectionForm from './forms/JourneySectionForm';
import ExperienceSectionForm from './forms/ExperienceSectionForm';
import LeaderIntroSectionForm from './forms/LeaderIntroSectionForm';
import './SectionEditForm.css';

interface SectionEditFormProps {
  sectionType: SectionType | string;
  studyId?: string;  // 스터디 ID 추가
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SectionEditForm: React.FC<SectionEditFormProps> = ({
  sectionType,
  studyId,
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
      
      case SectionType.LEADER_INTRO:
        return (
          <LeaderIntroSectionForm
            studyId={studyId}
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.MEMBERS:
        return (
          <MembersSectionForm
            studyId={studyId}  // studyId 전달
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );
      
      case SectionType.REVIEWS:
        return (
          <ReviewSectionForm
            studyId={studyId}  // studyId 전달 (API 호출용)
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
      
      case SectionType.EXPERIENCE:
        return (
          <ExperienceSectionForm
            initialData={initialData}
            onSave={onSave}
            onCancel={onCancel}
          />
        );

      case SectionType.COFFEE_CHAT:
        return (
          <CoffeeChatSectionForm
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
        <h3>{convertSectionTypeToLabel(sectionType) || sectionType} 섹션 편집</h3>
      </div>
      <div className="form-content">
        {renderForm()}
      </div>
    </div>
  );
};

export default SectionEditForm;