// src/pages/TecoTecoPage/sections/WhyTogetherSection.tsx
import React from 'react';
import './WhyTogetherSection.css';

export const WhyTogetherSection: React.FC = () => {
    return (
        <section className="tecoteco-why-together-section">
            {/* 상단 태그 헤더 */}
            <div className="section-tag-header">왜 함께인가요</div>

            {/* 메인 타이틀 */}
            <h2 className="section-title">어렵다고 포기하지 않고, <br/>어려우니까 <span className="highlight">더 함께</span> 합니다</h2>

            {/* 본문 1: 어려움에 대한 인정과 접근 */}
            <p>
                알고리즘 공부는 어렵습니다. 혼자 하면 더 어려워요.
                그래서 많은 사람들이 중도에 포기하죠.
            </p>
            <p>
                하지만 우리는 다르게 생각합니다. <span className="highlight">어려우니까 더 함께해야 한다</span>고요.
                막힌 부분에서 서로 질문하고, 다른 관점을 나누며, 함께 돌파구를 찾아갑니다.
            </p>

            {/* 물리적 모임의 힘 */}
            <h3 className="intro-sub-heading">일단 모이는 것의 힘</h3>
            <p>
                집에서 침대에 누워 "오늘은 안 되겠다" 하는 건 너무 쉬워요.
                하지만 <span className="subtle-highlight">일단 현장에 오면 뭐라도 됩니다</span>.
            </p>
            <p>
                노트북을 열고, 동료들과 마주 앉고, 문제를 펼쳐놓는 순간.
                이미 절반은 성공한 거예요. 물리적 공간이 주는 집중력과
                동료들이 만들어내는 에너지는 혼자서는 절대 만들 수 없거든요.
            </p>

            {/* 시스템과 루틴의 가치 */}
            <h3 className="intro-sub-heading">결정하지 않아도 되는 시스템</h3>
            <p>
                매주 "오늘 공부할까? 말까?" 고민하는 건 피곤한 일입니다.
                뭔가를 결정하는 것도 에너지가 드니까요.
            </p>
            <p>
                TecoTeco에서는 그런 고민이 필요 없습니다. <span className="subtle-highlight">정해진 날, 정해진 시간에
                그냥 몸을 옮기면 되거든요</span>. 루틴이 나를 이끌어주고,
                시스템이 알아서 작동합니다.
            </p>
            <p>
                그리고 그렇게 쌓인 시간들이 어느 순간 <span className="highlight">결과</span>가 되어 돌아옵니다.
            </p>

            {/* 누적의 힘 */}
            <div className="accumulation-box">
                <h4 className="box-title">작은 것들이 쌓일 때</h4>
                <div className="box-content">
                    <div className="accumulation-item">
                        <span className="week-marker">1주차</span>
                        <span className="accumulation-text">아직 잘 모르겠지만 일단 와봤다</span>
                    </div>
                    <div className="accumulation-item">
                        <span className="week-marker">4주차</span>
                        <span className="accumulation-text">어? 이 문제 어디서 본 것 같은데</span>
                    </div>
                    <div className="accumulation-item">
                        <span className="week-marker">8주차</span>
                        <span className="accumulation-text">이제 다른 사람 코드도 읽을 수 있다</span>
                    </div>
                    <div className="accumulation-item highlighted">
                        <span className="week-marker">12주차</span>
                        <span className="accumulation-text">문제를 보는 눈이 완전히 달라졌다</span>
                    </div>
                </div>
            </div>

            {/* 마무리 */}
            <p className="section-cta-text">
                혼자서는 불가능했던 일이 <span className="highlight">함께라면 당연</span>해집니다.
            </p>
        </section>
    );
};