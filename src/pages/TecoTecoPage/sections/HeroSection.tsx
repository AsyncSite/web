// src/pages/TecoTecoPage/sections/HeroSection.tsx
import React from 'react';
import './HeroSection.css';

interface HeroSectionProps {
    onCtaClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onCtaClick }) => {
    return (
        <section className="tecoteco-hero-section">
            <div className="hero-content">
                <h1 className="hero-title">💯 코딩테스트 스터디, 테코테코</h1>
                <p className="hero-subtitle">
                    함께 자료구조와 알고리즘을 <span className="highlight">뿌시고 성장하는</span> 개발자들의 공간입니다.
                </p>
                <div className="hero-image-wrapper">
                    <img src={process.env.PUBLIC_URL + '/images/tecoteco-profile.png'} alt="테코테코 프로필 이미지" />
                </div>
                <button className="hero-cta-button" onClick={onCtaClick}>
                    TecoTeco, 함께 성장할 용기
                </button>
            </div>
        </section>
    );
};