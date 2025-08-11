import React, { lazy, Suspense } from 'react';
import { SectionType } from '../../../api/studyDetailPageService';
import LoadingSpinner from '../../common/LoadingSpinner';

// Lazy load all section components
const RichTextSection = lazy(() => import('./RichTextSection'));
const HeroSection = lazy(() => import('./HeroSection'));
const GallerySection = lazy(() => import('./GallerySection'));
const MembersSection = lazy(() => import('./MembersSection'));
const ScheduleSection = lazy(() => import('./ScheduleSection'));
const FAQSection = lazy(() => import('./FAQSection'));
const ReviewsSection = lazy(() => import('./ReviewsSection'));
const VideoEmbedSection = lazy(() => import('./VideoEmbedSection'));
const TimelineSection = lazy(() => import('./TimelineSection'));
const CTASection = lazy(() => import('./CTASection'));
const TabsSection = lazy(() => import('./TabsSection'));
const AccordionSection = lazy(() => import('./AccordionSection'));
const StatsSection = lazy(() => import('./StatsSection'));
const TableSection = lazy(() => import('./TableSection'));
const CustomHTMLSection = lazy(() => import('./CustomHTMLSection'));
const CodeBlockSection = lazy(() => import('./CodeBlockSection'));
const HowWeRollSection = lazy(() => import('./HowWeRollSection'));
const JourneySection = lazy(() => import('./JourneySection'));
const ExperienceSection = lazy(() => import('./ExperienceSection'));

// Section registry mapping section types to components
export const sectionRegistry: Record<SectionType | string, React.LazyExoticComponent<React.FC<any>>> = {
  [SectionType.RICH_TEXT]: RichTextSection,
  [SectionType.HERO]: HeroSection,
  [SectionType.GALLERY]: GallerySection,
  [SectionType.MEMBERS]: MembersSection,
  [SectionType.SCHEDULE]: ScheduleSection,
  [SectionType.FAQ]: FAQSection,
  [SectionType.REVIEWS]: ReviewsSection,
  [SectionType.VIDEO_EMBED]: VideoEmbedSection,
  [SectionType.TIMELINE]: TimelineSection,
  [SectionType.CTA]: CTASection,
  [SectionType.TABS]: TabsSection,
  [SectionType.ACCORDION]: AccordionSection,
  [SectionType.STATS]: StatsSection,
  [SectionType.TABLE]: TableSection,
  [SectionType.CUSTOM_HTML]: CustomHTMLSection,
  [SectionType.CODE_BLOCK]: CodeBlockSection,
  [SectionType.HOW_WE_ROLL]: HowWeRollSection,
  [SectionType.JOURNEY]: JourneySection,
  ['EXPERIENCE']: ExperienceSection,
};

interface SectionRendererProps {
  type: SectionType | string;
  data: any;
}

export const SectionRenderer: React.FC<SectionRendererProps> = ({ type, data }) => {
  const SectionComponent = sectionRegistry[type];
  
  if (!SectionComponent) {
    console.error(`Unknown section type: ${type}`);
    return null;
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SectionComponent data={data} />
    </Suspense>
  );
};