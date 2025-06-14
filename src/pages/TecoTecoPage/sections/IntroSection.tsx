// src/pages/TecoTecoPage/sections/IntroSection.tsx
import React, { forwardRef } from 'react';
import './IntroSection.css';

export const IntroSection = forwardRef<HTMLDivElement>((props, ref) => {
    return (
        <section className="tecoteco-intro-section" ref={ref}>
            {/* 상단 태그 헤더 */}
            <div className="section-tag-header">TecoTeco 소개</div>

            {/* 메인 타이틀 */}
            <h2 className="section-title">변화하는 세상에서 <br/>흔들리지 않을 '나'를 위한 스터디</h2>

            {/* 본문 1: 현재 상황에 대한 공감과 질문 */}
            <p>
                코딩과 지식의 가치가 흔해지는 시절입니다. AI가 순식간에 코드를 작성하고,
                개발 도구들이 날마다 진화하는 지금. 개발자로서 우리가 정말 집중해야 할 것은 무엇일까요?
            </p>
            <p>
                TecoTeco는 이런 질문에서 출발했습니다. 기술이 아무리 발달해도
                <span className="highlight">변하지 않는 개발자의 핵심 역량</span>이 있다고 믿거든요.
            </p>

            {/* 우리의 접근법 1: 물고기 잡는 법 */}
            <h3 className="intro-sub-heading">물고기를 잡는 방법을 익히는 것</h3>
            <p>
                우리는 '물고기 그 자체'가 아닌, <span className="subtle-highlight">'물고기를 잡는 방법'</span>에 집중합니다.
                단순히 문제를 푸는 것을 넘어서, 문제의 본질을 이해하고
                <span className="subtle-highlight">견고한 사고력과 논리력</span>을 단련하는 것이 목표입니다.
            </p>
            <p>
                매주 함께 모여 한 문제를 깊이 파고들고, 서로 다른 관점으로 접근해보며
                사고의 폭을 넓혀갑니다. 왜 이 알고리즘을 선택했는지, 다른 방법은 없었는지,
                이 문제에서 배울 수 있는 더 큰 인사이트는 무엇인지 함께 고민해요.
            </p>

            {/* 우리의 접근법 2: 물고기를 '잘' 잡는 법 */}
            <h3 className="intro-sub-heading">물고기를 '잘' 잡는 방법을 모색하는 것</h3>
            <p>
                AI를 배척하지 않고 <span className="subtle-highlight">현명하게 활용하는 방법</span>을 함께 모색합니다.
                AI와 페어 코딩하고, 비판적으로 분석하며 코드를 개선합니다.
                AI가 <span className="subtle-highlight">우리의 통찰력을 확장시키는 강력한 파트너</span>가 될 수 있음을
                증명해나가고 있어요.
            </p>

            {/* 마무리 */}
            <p className="section-cta-text">
                우리가 찾는 건 변화 속에서도 <span className="highlight">흔들리지 않을 '나'</span><br/> 생각하는 힘이에요.
            </p>
        </section>
    );
});