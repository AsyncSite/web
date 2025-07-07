import React, { useEffect, useRef, useState } from 'react';
import './Intro.css';
import Header from '../../layout/Header';

const Intro: React.FC = () => {
  // 별똥별 표시 여부
  const [showShootingStar, setShowShootingStar] = useState(true);

  // 두 개의 타이핑 요소 레퍼런스
  const typingLineLooseRef = useRef<HTMLDivElement | null>(null); // "느슨히 느슨히..." 문구
  const typingLineRef = useRef<HTMLDivElement | null>(null); // "작고 꾸준한..." 문구

  // AsyncSite 노출 상태
  const [showAsyncSite, setShowAsyncSite] = useState(false);

  useEffect(() => {
    // (1) 초반 2초간 별똥별 애니메이션이 지나가도록
    //     2초 뒤 showShootingStar=false → 별똥별 제거 + 타이핑 시작
    const starTimer = setTimeout(() => {
      setShowShootingStar(false);
      startTypingEffect(); // 별똥별 사라진 다음 타이핑 진행
    }, 2500);

    return () => {
      clearTimeout(starTimer);
    };
  }, []);

  // 별똥별이 끝난 뒤에야 실행할 타이핑 로직
  const startTypingEffect = () => {
    const looseText = '느슨히 느슨히, 그리고 끈끈히';
    const mainText = '작고 꾸준한 행동이 모여, 집단 지성을 이루는 생태계';
    const typingSpeed = 60; // 타이핑 속도

    // 문자를 하나씩 찍어주는 유틸 함수
    function typeText(text: string, element: HTMLDivElement | null, onComplete?: () => void) {
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
          // AsyncSite 로고 표시
          setTimeout(() => {
            setShowAsyncSite(true);
          }, 200);
        });
      }, 1500);
    });
  };

  return (
    <section id="intro" className="intro-section">
      {/* 별똥별(최초 로딩 시) */}
      {showShootingStar && <div className="shooting-star" />}

      {/* 별똥별이 끝난 뒤 Header 표시(필요 시 조건부 렌더링 가능) */}
      {!showShootingStar && <Header />}

      {/* 우주 배경 애니메이션 레이어 */}
      <div className="cosmic-scene">
        <div
          className="star"
          style={{ '--star-top': '0.2', '--star-left': '0.15' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.6', '--star-left': '0.25' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.3', '--star-left': '0.8' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.75', '--star-left': '0.9' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.1', '--star-left': '0.3' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.4', '--star-left': '0.5' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.55', '--star-left': '0.7' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.8', '--star-left': '0.2' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.35', '--star-left': '0.85' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.65', '--star-left': '0.05' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.15', '--star-left': '0.6' } as React.CSSProperties}
        ></div>
        <div
          className="star"
          style={{ '--star-top': '0.5', '--star-left': '0.95' } as React.CSSProperties}
        ></div>

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

        {/* 기존 혜성들 */}
        <div className="comet"></div>
        <div className="comet comet-delay"></div>
      </div>

      <div className="intro-content">
        {/* AsyncSite - 통통 튀듯 떨어지는 애니메이션 (조건부 클래스 적용) */}
        <div className={`skew-heading-wrapper ${showAsyncSite ? 'drop-bounce' : ''}`}>
          <h1 data-heading="asyncsite">asyncsite</h1>
        </div>

        {/* "느슨히 느슨히..." */}
        <div className="text-typing-container typing-loose">
          <div id="typingLineLoose" className="type-line" ref={typingLineLooseRef} />
        </div>

        <br />

        {/* "작고 꾸준한..." */}
        <div className="text-typing-container typing-main">
          <div id="typingLineMain" className="type-line" ref={typingLineRef} />
        </div>
      </div>
    </section>
  );
};

export default Intro;
