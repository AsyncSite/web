// src/pages/TecoTecoPage/sections/JourneySection.tsx
import React from 'react';
import './JourneySection.css';

export const JourneySection: React.FC = () => {
    return (
        <section className="tecoteco-journey-section">
            <h2 className="section-title">👣 TecoTeco의 성장 발자취</h2>
            <p className="section-subtitle">
                우리는 <span className="highlight">멈추지 않고 계속 성장</span>해 왔습니다.
            </p>
            <ul className="journey-list">
                <li><strong>시즌 1 (2024.09 ~ 2024.12):</strong> 자료구조 기본기 다지기 (배열, 스택, 큐, 해시, 트리)</li>
                <li><strong>시즌 1.5 (2025.01 ~ 2025.03):</strong> 자료구조 복습 및 문제풀이 집중</li>
                <li><strong>시즌 2 (2025.04 ~ 진행중):</strong> 심화 알고리즘 정복 (집합, 그래프, 백트래킹, DP, 그리디)</li>
            </ul>
            <div className="journey-image-wrapper">
                <img src={process.env.PUBLIC_URL + '/images/tecoteco/tecoteco2025-3q4q.png'} alt="2025년 3분기 4분기 스케줄" />
            </div>
        </section>
    );
};