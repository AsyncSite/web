import React, { useRef } from 'react';
import { TemplateHeader } from '../../components/layout';
import { Footer } from '../../components/layout';
import { HeroSection } from './sections/HeroSection';
import { IntroSection } from './sections/IntroSection';
import { PhilosophySection } from './sections/PhilosophySection';
import { ExperienceSection } from './sections/ExperienceSection';
import { HowWeRollSection } from './sections/HowWeRollSection';
import { JourneySection } from './sections/JourneySection';
import { MembersSection } from './sections/MembersSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { FaqJoinSection } from './sections/FaqJoinSection';

import './TecoTecoPage.css'; // 전역 및 공통 스타일

const TecoTecoPage: React.FC = () => {
    const introSectionRef = useRef<HTMLDivElement>(null);

    // Hero CTA 버튼 클릭 시 동작할 함수: 새로운 도입 섹션으로 스크롤
    const handleCtaClick = () => {
        if (introSectionRef.current) {
            window.scrollTo({
                top: introSectionRef.current.offsetTop - 80, // 헤더 높이만큼 빼줌
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="tecoteco-page">
            <TemplateHeader />
            <main className="tecoteco-content">
                <HeroSection onCtaClick={handleCtaClick} />
                <IntroSection ref={introSectionRef} />
                <MembersSection />
                <ExperienceSection />
                <HowWeRollSection />
                <JourneySection />
                <ReviewsSection />
                <FaqJoinSection />
            </main>
            <Footer />
        </div>
    );
};

export default TecoTecoPage;