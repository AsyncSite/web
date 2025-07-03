import React, { useEffect, useRef, useState } from 'react';
import './Intro.css';
import Button from "../../ui/Button";

const Intro: React.FC = () => {
    // 별똥별 표시 여부
    const [showShootingStar, setShowShootingStar] = useState(true);

    // 두 개의 타이핑 요소 레퍼런스
    const typingLineLooseRef = useRef<HTMLDivElement | null>(null); // "느슨히 느슨히..." 문구
    const typingLineRef = useRef<HTMLDivElement | null>(null);      // "작고 꾸준한..." 문구

    // Async Site 로고 노출 상태
    const [showAsyncSite, setShowAsyncSite] = useState(false);

    useEffect(() => {
        // (1) 별똥별 애니메이션(1500ms) 완료 후 즉시 제거
        //     애니메이션 끝나자마자 showShootingStar=false → 별똥별 제거 + 타이핑 시작
        const starTimer = setTimeout(() => {
            setShowShootingStar(false);
            startTypingEffect();  // 별똥별 사라진 다음 타이핑 진행
        }, 1600); // 애니메이션 1500ms + 여유 100ms

        return () => {
            clearTimeout(starTimer);
        };
    }, []);

    // 별똥별이 끝난 뒤에야 실행할 타이핑 로직
    const startTypingEffect = () => {
        const looseText = '느슨히, 그리고 끈끈히';
        const mainText = '작고 꾸준한 행동이 모여, 집단 지성을 이루는 생태계';
        const typingSpeed = 60; // 타이핑 속도

        // 문자를 하나씩 찍어주는 유틸 함수
        function typeText(
            text: string,
            element: HTMLDivElement | null,
            onComplete?: () => void
        ) {
            if (!element) return;
            let i = 0;
            const typing = () => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(typing, typingSpeed);
                } else {
                    onComplete && onComplete();
                }
            };
            typing();
        }

        function addBlinkCursor(element: HTMLDivElement | null) {
            if (!element) return;
            removeBlinkCursor(element);

            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'blink-cursor';
            cursorSpan.textContent = '|';
            element.appendChild(cursorSpan);
        }

        function removeBlinkCursor(element: HTMLDivElement | null) {
            if (!element) return;
            const existing = element.querySelector('.blink-cursor');
            if (existing) {
                existing.remove();
            }
        }

        const looseEl = typingLineLooseRef.current;
        const mainEl = typingLineRef.current;
        if (!looseEl || !mainEl) return;

        // (A) "느슨히 느슨히…" 먼저 타이핑
        typeText(looseText, looseEl, () => {
            addBlinkCursor(looseEl);

            // (B) 커서 잠시 보이고 제거 → "작고 꾸준한..." 타이핑
            setTimeout(() => {
                removeBlinkCursor(looseEl);

                typeText(mainText, mainEl, () => {
                    // 타이핑 완료 후 커서 다시 표시
                    addBlinkCursor(mainEl);
                    // Async Site 로고 표시
                    setTimeout(() => {
                        setShowAsyncSite(true);
                    }, 200);
                });
            }, 1500);
        });
    };

    return (
        <section id="intro" className="min-h-screen relative overflow-hidden bg-[#0B0F19] flex items-center justify-center">
            {/* 별똥별(최초 로딩 시) - 완전 제거 방식 */}
            {showShootingStar && (
                <div className="shooting-star" />
            )}



            {/* 우주 배경 애니메이션 레이어 */}
            <div className="cosmic-scene">
                <div className="star" style={{ '--star-top': '0.2', '--star-left': '0.15' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.6', '--star-left': '0.25' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.3', '--star-left': '0.8' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.75', '--star-left': '0.9' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.1', '--star-left': '0.3' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.4', '--star-left': '0.5' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.55', '--star-left': '0.7' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.8', '--star-left': '0.2' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.35', '--star-left': '0.85' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.65', '--star-left': '0.05' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.15', '--star-left': '0.6' } as React.CSSProperties}></div>
                <div className="star" style={{ '--star-top': '0.5', '--star-left': '0.95' } as React.CSSProperties}></div>

                {/* 태양계 궤도들 - 원형, 기존 스타일 유지 + 공전하는 행성 */}
                    <div className="orbit-container orbit-1 fade-in-orbit">
                        <div className="orbit orbit-1-anim">
                            <div className="planet planet-1"></div>
                        </div>
                    </div>
                    <div className="orbit-container orbit-2 fade-in-orbit">
                        <div className="orbit orbit-2-anim">
                            <div className="planet planet-2"></div>
                            <div className="planet planet-3"></div>
                        </div>
                    </div>
                    <div className="orbit-container orbit-3 fade-in-orbit">
                        <div className="orbit elliptical-orbit">
                            <div className="planet planet-4"></div>
                            <div className="planet planet-5"></div>
                        </div>
                    </div>
                    <div className="orbit-container orbit-4 fade-in-orbit">
                        <div className="orbit orbit-4-anim">
                            <div className="planet planet-6"></div>
                        </div>
                    </div>
            </div>

            {/* 배경의 산개된 별들 - 그라데이션 강화 */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[
                        { top: '15%', left: '10%', delay: '0s', size: 3 },
                        { top: '25%', left: '85%', delay: '0.3s', size: 2.5 },
                        { top: '35%', left: '20%', delay: '0.6s', size: 4 },
                        { top: '45%', left: '75%', delay: '0.9s', size: 3.5 },
                        { top: '55%', left: '15%', delay: '1.2s', size: 2.8 },
                        { top: '65%', left: '90%', delay: '1.5s', size: 3.2 },
                        { top: '75%', left: '30%', delay: '1.8s', size: 4.5 },
                        { top: '85%', left: '70%', delay: '2.1s', size: 2.2 },
                        { top: '8%', left: '50%', delay: '2.4s', size: 3.8 },
                        { top: '18%', left: '65%', delay: '2.7s', size: 3.3 },
                        { top: '28%', left: '5%', delay: '3s', size: 4.2 },
                    ].map((star, index) => (
                        <div
                            key={`bg-star-${index}`}
                            className="absolute animate-twinkle"
                            style={{
                                top: star.top,
                                left: star.left,
                                width: `${star.size}px`,
                                height: `${star.size}px`,
                                animationDelay: star.delay,
                                background: `radial-gradient(circle,
                                    rgba(255,255,255,1) 0%,
                                    rgba(255,255,255,0.9) 15%,
                                    rgba(255,255,255,0.6) 30%,
                                    rgba(255,255,255,0.3) 50%,
                                    rgba(255,255,255,0.1) 70%,
                                    rgba(255,255,255,0) 100%)`,
                                borderRadius: '50%',
                                filter: 'blur(0.5px)',
                                boxShadow: `0 0 ${star.size * 2}px rgba(255,255,255,0.4), 0 0 ${star.size * 4}px rgba(255,255,255,0.2)`
                            }}
                        />
                    ))}
                </div>

            {/* 메인 콘텐츠 - 현대적 디자인 */}
            <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                {/* Async Site - 현대적 타이포그래피 */}
                <div className={`transition-all duration-1000 ${showAsyncSite ? 'animate-slide-up' : 'opacity-0'}`}>
                    <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cosmic-blue via-cosmic-cyan to-cosmic-purple bg-clip-text text-transparent mb-8 font-space-grotesk">
                        Async Site
                    </h1>
                </div>

                {/* 타이핑 텍스트들 - 현대적 스타일 */}
                <div className="space-y-6">
                    <div className="text-xl md:text-2xl text-gray-300 font-suit">
                        <div ref={typingLineLooseRef} className="min-h-[2rem]" />
                    </div>

                    <div className="text-lg md:text-xl text-gray-400 font-suit max-w-2xl mx-auto">
                        <div ref={typingLineRef} className="min-h-[2rem]" />
                    </div>
                </div>

                {/* CTA 버튼 추가 */}
                {showAsyncSite && (
                    <div className="mt-12 animate-fade-in">
                        <Button
                            variant="cosmic"
                            size="lg"
                            onClick={() => {
                                const aboutSection = document.getElementById('about');
                                aboutSection?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            🚀 여정 시작하기
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Intro;
