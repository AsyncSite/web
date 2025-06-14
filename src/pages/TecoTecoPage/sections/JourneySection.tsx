// src/pages/TecoTecoPage/sections/JourneySection.tsx
import React from 'react';
import './JourneySection.css';

export const JourneySection: React.FC = () => {
    const calculateDays = () => {
        const startDate = new Date('2024-09-01');
        const today = new Date('2025-06-14'); // Current date is June 14, 2025
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysSinceStart = calculateDays();

    return (
        <section className="tecoteco-journey-section">
            {/* 상단 태그 헤더 추가 */}
            <div className="section-tag-header">우리의 여정</div>

            <h2 className="section-title">하루하루가 쌓이니 벌써 {daysSinceStart}일이 되었어요.</h2>

            // todo - 전체적인 내용 변경 
            <p className="section-subtitle">
                우리는 <span className="highlight">지속적인 개선과 성장을 위해</span> 꾸준히 나아가고 있습니다.
            </p>
            <ul className="journey-list">
                <li>
                    <strong>시즌 1 (2024.09 ~ 2024.12)</strong><br />
                    <span className="journey-description">자료구조의 기본기를 다지고, 알고리즘 문제 해결의 첫 발을 내디뎠습니다.</span>
                </li>
                <li>
                    <strong>시즌 1.5 (2025.01 ~ 2025.03)</strong><br />
                    <span className="journey-description">기존 학습 내용을 복습하며 문제 풀이 역량을 강화하고, 실전에 대비했습니다.</span>
                </li>
                <li>
                    <strong>시즌 2 (2025.04 ~ 진행중)</strong><br />
                    <span className="journey-description">심화 알고리즘 주제를 탐구하며, 더 복잡한 문제에 대한 해결 능력을 키워나가고 있습니다.</span>
                </li>
            </ul>
            <div className="journey-image-wrapper">
                <img src={process.env.PUBLIC_URL + '/images/tecoteco/tecoteco2025-3q4q.png'} alt="2025년 3분기 4분기 스케줄" />
            </div>
            {/* <p className="journey-cta-text">
                TecoTeco의 여정은 계속됩니다. <span className="highlight">다음 발자취를 함께 만들어갈 분을 기다립니다.</span>
            </p> */}
        </section>
    );
};