// src/pages/TecoTecoPage/sections/IntroSection.tsx
import React, { forwardRef } from 'react';
import './IntroSection.css';

export const IntroSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <section className="tecoteco-intro-section" ref={ref}>
            <h2 className="section-title">변화 속에서, <br className="mobile-only"/>변치 않는 본질을 찾다 💡</h2>
            <p className="section-description">
                빠르게 진화하는 기술의 물결 속에서, <span className="highlight">우리는 어떤 개발자가 되어야 할까요?</span>
                새로운 프레임워크와 AI 도구들이 쏟아져 나오지만, <span className="highlight">결국 모든 문제 해결의 근원</span>은
                <span className="highlight">견고한 사고력과 논리</span>에 있습니다.
            </p>
            <p className="section-description">
                TecoTeco는 바로 그 본질을 탐구합니다. <span className="highlight">단순히 코딩 테스트를 넘어,
                어떤 기술 스택에도 흔들리지 않는 개발자의 기초 체력</span>을 다지는 곳입니다.
                AI를 활용하되, <span className="highlight">AI를 넘어서는 인간의 통찰력</span>을 함께 키워나갑니다.
            </p>
            <p className="section-description section-cta-text">
                혼자서는 막막했던 길, TecoTeco에서 함께라면 <span className="highlight">더 멀리, 더 깊이</span> 나아갈 수 있습니다.
                <br/>그렇다면, 우리는 어떻게 이 여정을 함께하고 있을까요?
            </p>
        </section>
    );
});