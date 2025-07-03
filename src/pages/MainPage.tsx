import React from 'react';
import { Footer } from "../components/layout";
import { About, Calendar, Contribution, FAQ, Intro, PreWave } from "../components/sections";
import EnhancedHeader from "../components/layout/EnhancedHeader";
import SectionNavigation from "../components/layout/SectionNavigation";
import { calendarEvents, waveProjects } from '../data';
import { usePageTransition } from '../hooks/usePageTransition';

const MainPage = () => {
    // 페이지 전환 훅 사용 (빠른 페이드인)
    usePageTransition({ enableLoading: false, fadeInDelay: 100 });

    const handleSectionNavigate = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="page-container bg-[#0B0F19] min-h-screen opacity-0 transition-opacity duration-500 ease-in-out">
            <EnhancedHeader onSectionNavigate={handleSectionNavigate} />
            <SectionNavigation onNavigate={handleSectionNavigate} />
            <Intro />
            <About/>
            <PreWave projects={waveProjects} />
            <Calendar events={calendarEvents} />
            <FAQ/>
            <Contribution/>
            <Footer/>
        </div>
    )
}
export default MainPage;
