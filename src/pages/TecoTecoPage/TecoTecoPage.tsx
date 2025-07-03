import React, { useRef, useEffect } from 'react';
import { EnhancedHeader, Footer } from '../../components/layout';
import { HeroSection } from './sections/HeroSection';
import { IntroSection } from './sections/IntroSection';
import { PhilosophySection } from './sections/PhilosophySection';
import { ExperienceSection } from './sections/ExperienceSection';
import { HowWeRollSection } from './sections/HowWeRollSection';
import { JourneySection } from './sections/JourneySection';
import { MembersSection } from './sections/MembersSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { FaqJoinSection } from './sections/FaqJoinSection';

import './TecoTecoPage.css';
import {WhyTogetherSection} from "./sections/WhyTogetherSection";
import {TextEncoderStream} from "node:stream/web";

const TecoTecoPage: React.FC = () => {
    // 페이지 로드 시 애니메이션 없이 스크롤 상단으로 순간이동
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, []);

    const introSectionRef = useRef<HTMLDivElement>(null);

    // Hero CTA 버튼 클릭 시 동작할 함수: 새로운 도입 섹션으로 스크롤 (순간이동)
    const handleCtaClick = () => {
        if (introSectionRef.current) {
            window.scrollTo({
                top: introSectionRef.current.offsetTop - 80, // 헤더 높이만큼 빼줌
                behavior: 'auto'  // 애니메이션 없이 순간이동
            });
        }
    };

    return (
        <div className="tecoteco-page bg-[#0B0F19] min-h-screen">
            <EnhancedHeader />
            <main className="tecoteco-content pt-20">
                <HeroSection onCtaClick={handleCtaClick} />
                <IntroSection ref={introSectionRef} />
                {/*<WhyTogetherSection />*/}
                <MembersSection />
                <HowWeRollSection />
                <JourneySection />
                <ExperienceSection />


                <ReviewsSection />
                <FaqJoinSection />
            </main>
            <Footer />
        </div>
    );
};

export default TecoTecoPage;