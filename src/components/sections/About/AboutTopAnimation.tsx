import React, { useEffect, useRef } from 'react';
import './AboutTopAnimation.css';

const AboutTopAnimation: React.FC = () => {
  const typingLineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    /**
     * 1) 타이핑할 텍스트 & 속도 등 옵션 정의
     */
    const text = '느슨히 느슨히, 그리고 끈끈히';
    const typingSpeed = 50; // 타이핑 속도 (ms)
    const waitCursorBlink = 2000; // 모두 입력 후 커서만 깜빡이는 시간 (ms)

    /**
     * 2) 타이핑 함수
     */
    function typeText(
      text: string,
      element: HTMLDivElement | null,
      isBigQuote: boolean,
      onComplete?: () => void,
    ) {
      if (!element) return;
      let i = 0;

      const typing = () => {
        if (i < text.length) {
          const char = text.charAt(i);
          if (isBigQuote) {
            // 큰 폰트/스타일 적용 (Intro 예제와 동일하게)
            element.innerHTML += `<span class="big-quote">${char}</span>`;
          } else {
            element.textContent += char;
          }
          i++;
          setTimeout(typing, typingSpeed);
        } else {
          onComplete && onComplete();
        }
      };
      typing();
    }

    /**
     * 3) 커서 관련 함수
     */
    function addBlinkCursor(element: HTMLDivElement | null) {
      if (!element) return;
      removeBlinkCursor(element); // 중복 방지
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

    /**
     * 4) 실제 타이핑 실행
     */
    const lineEl = typingLineRef.current;
    if (!lineEl) return;

    typeText(text, lineEl, true, () => {
      // 4-1) 모든 문자 타이핑이 끝나면 커서 깜빡이기
      addBlinkCursor(lineEl);

      // 4-2) 2초 뒤에는 커서를 제거(또는 유지)하는 식으로 처리
      setTimeout(() => {
        removeBlinkCursor(lineEl);
      }, waitCursorBlink);
    });
  }, []);

  return (
    <div className="about-top-animation">
      {/* 타이핑될 한 줄 */}
      <div className="type-line" ref={typingLineRef}></div>
    </div>
  );
};

export default AboutTopAnimation;
