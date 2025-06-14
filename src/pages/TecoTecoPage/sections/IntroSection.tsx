// src/pages/TecoTecoPage/sections/IntroSection.tsx
import React, { forwardRef } from 'react';
import './IntroSection.css';

export const IntroSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <section className="tecoteco-intro-section" ref={ref}>
            {/* 상단 태그 헤더 */}
            <div className="section-tag-header">TecoTeco 소개</div>

            {/* 메인 타이틀 */}
            <h2 className="section-title">흔들리는 시대, 변치 않는 '나'를 위한 코딩</h2>

            {/* 본문 1: AI 시대의 질문과 우리의 관점 */}
            <p>
                빠르게 진화하는 기술의 물결 속에서, 우리는 어떤 개발자가 되어야 할까요? AI가 코드를 척척 짜내는 시대, 코딩과 지식의 가치가 흔해지는 듯 보여도, 여전히 그것들이 존재한다면 무엇이 '중요한' 것일까요?
            </p>
            <p>
                TecoTeco는 바로 그 <span className="highlight">본질적인 가치에 집중</span>합니다. 우리는 이 질문에 답하며 두 가지 중요한 가치를 추구합니다.
            </p>

            <h3 className="intro-sub-heading">1. 물고기 잡는 법을 익히고 연습해요. 🎣</h3>
            <p>
                우리는 '물고기 그 자체'가 아닌, <strong><span className="subtle-highlight">'물고기를 잡는 방법'</span></strong>에 집중합니다. 매주 문제를 깊이 파고들고, 동료와 리뷰하며 토론합니다. 정답 코드를 넘어, 문제의 본질을 이해하고 <span className="subtle-highlight">견고한 사고력과 논리력</span>을 단련하는 것이 목표죠.
            </p>

            <h3 className="intro-sub-heading">2. 물고기를 '잘' 잡는 법: <br/> AI를 잘 사용하기 위해 실험하고 시도해요 🤖</h3>
            <p>
                AI를 배척하지 않고 <span className="subtle-highlight">현명하게 활용하는 방법</span>을 함께 모색합니다. AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다. AI가 <span className="subtle-highlight">우리의 통찰력을 확장시키는 강력한 파트너</span>가 될 수 있음을 증명할 거예요.
            </p>

            {/* 테코테코는 이런 공간입니다 (가치들을 목록화) */}
            <h3 className="intro-sub-heading">TecoTeco는 이런 공간입니다</h3>
            <p>
                TecoTeco는 단순히 코딩 테스트를 '통과'하는 것을 넘어, 이런 가치들을 함께 만들어 갑니다.
            </p>
            <ul>
                <li><span className="highlight">함께의 가치 🤝</span>: 혼자서는 막막했던 알고리즘 공부, 함께 모여 서로를 이끌어주고 동기를 부여합니다.</li>
                <li><span className="highlight">성장의 경험 🌱</span>: '어?!' 하고 깨달음을 얻는 <span className="subtle-highlight">진정한 성장의 즐거움</span>이 테코테코의 핵심입니다.</li>
                <li><span className="highlight">현대적 접근 🤖</span>: AI를 똑똑하게 활용하며 <span className="subtle-highlight">인간의 통찰력을 기르는 진보적 스터디</span>를 지향합니다.</li>
            </ul>

            {/* 최종 목표 & Call to Action */}
            <p className="section-cta-text">
                <span>todo - 10자 이내로 깔끔한 마무리</span>
            </p>
        </section>
    );
});