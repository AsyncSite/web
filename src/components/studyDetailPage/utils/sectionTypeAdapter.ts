/**
 * Section Type Adapter
 * 백엔드가 지원하지 않는 섹션 타입을 기존 타입으로 변환하여 저장하고
 * 렌더링 시 실제 타입으로 복원하는 어댑터
 */

import { SectionType, PageSection } from '../../../api/studyDetailPageService';

// 백엔드가 지원하지 않는 새로운 섹션 타입들
export const EXTENDED_SECTION_TYPES = {
  HOW_WE_ROLL: 'HOW_WE_ROLL',
  JOURNEY: 'JOURNEY',
  EXPERIENCE: 'EXPERIENCE'
} as const;

export type ExtendedSectionType = typeof EXTENDED_SECTION_TYPES[keyof typeof EXTENDED_SECTION_TYPES];

/**
 * 백엔드로 전송하기 전에 섹션 타입을 변환
 * 지원되지 않는 타입은 CUSTOM_HTML로 변환하고 실제 타입을 props에 저장
 */
export function adaptSectionForBackend(type: string, props: any): { type: SectionType, props: any } {
  // HOW_WE_ROLL과 같은 새로운 타입들을 CUSTOM_HTML로 변환
  if (Object.values(EXTENDED_SECTION_TYPES).includes(type as ExtendedSectionType)) {
    return {
      type: SectionType.CUSTOM_HTML,
      props: {
        ...props,
        __realType: type,
        __isExtended: true
      }
    };
  }
  
  // 기존 타입은 그대로 반환
  return { type: type as SectionType, props };
}

/**
 * 백엔드에서 받은 섹션을 실제 타입으로 복원
 */
export function restoreSectionType(section: PageSection): PageSection {
  // CUSTOM_HTML이고 __isExtended 플래그가 있으면 실제 타입으로 복원
  if (section.type === SectionType.CUSTOM_HTML && section.props.__isExtended && section.props.__realType) {
    const { __realType, __isExtended, ...actualProps } = section.props;
    return {
      ...section,
      type: __realType as SectionType,
      props: actualProps
    };
  }
  
  return section;
}

/**
 * 섹션 목록 전체를 복원
 */
export function restoreSectionTypes(sections: PageSection[]): PageSection[] {
  return sections.map(restoreSectionType);
}

/**
 * 섹션이 확장 타입인지 확인
 */
export function isExtendedSection(type: string): boolean {
  return Object.values(EXTENDED_SECTION_TYPES).includes(type as ExtendedSectionType);
}