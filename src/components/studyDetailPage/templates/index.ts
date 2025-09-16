import { StudyTemplateRepository, StudyTemplateType } from './types';
import { algorithmTemplate } from './algorithmTemplate';
import { bookclubTemplate } from './bookclubTemplate';
import { projectTemplate } from './projectTemplate';
import { englishTemplate } from './englishTemplate';

// 중앙 템플릿 저장소
export const STUDY_TEMPLATES: StudyTemplateRepository = {
  algorithm: algorithmTemplate,
  bookclub: bookclubTemplate,
  project: projectTemplate,
  english: englishTemplate
};

// 템플릿 가져오기 함수
export function getStudyTemplate(type: StudyTemplateType) {
  return STUDY_TEMPLATES[type];
}

// 모든 템플릿 목록
export function getAllTemplateTypes(): StudyTemplateType[] {
  return Object.keys(STUDY_TEMPLATES) as StudyTemplateType[];
}

// Re-export types
export * from './types';