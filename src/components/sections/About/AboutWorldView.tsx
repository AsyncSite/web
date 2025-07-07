// src/components/sections/AboutWorldview.tsx
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './AboutWorldView.css';

gsap.registerPlugin(ScrollTrigger);

const AboutWorldview: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 큰 키워드들
  const growRef = useRef<HTMLDivElement | null>(null);
  const consistencyRef = useRef<HTMLDivElement | null>(null);
  const networkingRef = useRef<HTMLDivElement | null>(null);

  // 2줄 설명들
  const growDescRef = useRef<HTMLDivElement | null>(null);
  const consistencyDescRef = useRef<HTMLDivElement | null>(null);
  const networkingDescRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 컨테이너 기준으로 gsap context
    const ctx = gsap.context(() => {
      // ---------------------------------------
      // 1) “성장(Grow)” 키워드 무한 반복 이펙트
      // ---------------------------------------
      const growTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current, // 해당 섹션 진입 시 애니메이션 시작
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play pause resume pause',
          // 뷰에서 벗어날 때 일시정지(pause), 다시 돌아오면 resume
        },
        repeat: -1, // 무한 반복
        yoyo: true, // 앞뒤로 반복
      });

      // 키워드가 해체 → 재조립을 반복
      growTl
        .fromTo(
          growRef.current,
          {
            autoAlpha: 1,
            // 처음 위치(조합된 상태)
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
          },
          {
            // 해체된 상태
            x: () => gsap.utils.random(-200, 200),
            y: () => gsap.utils.random(-150, 150),
            rotation: () => gsap.utils.random(-45, 45),
            scale: 0.5,
            duration: 2,
            ease: 'power2.inOut',
          },
        )
        .to(
          growRef.current,
          {
            // 잠깐 멈춤
            duration: 0.5,
            ease: 'none',
          },
          '+=0.3',
        );

      // description(2줄)도 같이 흔들리는 느낌
      growTl
        .fromTo(
          growDescRef.current,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
          },
          {
            x: () => gsap.utils.random(-100, 100),
            y: () => gsap.utils.random(-80, 80),
            rotation: () => gsap.utils.random(-15, 15),
            duration: 2,
            ease: 'power2.inOut',
          },
          '<', // 같은 타이밍에 시작
        )
        .to(
          growDescRef.current,
          {
            duration: 0.5,
            ease: 'none',
          },
          '+=0.3',
        );

      // ---------------------------------------
      // 2) 꾸준함(Consistency)
      // ---------------------------------------
      const consTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play pause resume pause',
        },
        repeat: -1,
        yoyo: true,
      });

      consTl
        .fromTo(
          consistencyRef.current,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
          },
          {
            x: () => gsap.utils.random(-250, 150),
            y: () => gsap.utils.random(-100, 130),
            rotation: () => gsap.utils.random(-30, 30),
            scale: 0.6,
            duration: 2,
            ease: 'power2.inOut',
          },
        )
        .to({}, { duration: 0.5 })
        .fromTo(
          consistencyDescRef.current,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
          },
          {
            x: () => gsap.utils.random(-80, 80),
            y: () => gsap.utils.random(-50, 50),
            duration: 2,
            ease: 'power2.inOut',
          },
          '<',
        )
        .to({}, { duration: 0.5 });

      // ---------------------------------------
      // 3) 점들의 연결(Networking)
      // ---------------------------------------
      const netTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play pause resume pause',
        },
        repeat: -1,
        yoyo: true,
      });

      netTl
        .fromTo(
          networkingRef.current,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
          },
          {
            x: () => gsap.utils.random(-150, 200),
            y: () => gsap.utils.random(-150, 80),
            rotation: () => gsap.utils.random(-20, 20),
            scale: 0.7,
            duration: 2,
            ease: 'power2.inOut',
          },
        )
        .to({}, { duration: 0.5 })
        .fromTo(
          networkingDescRef.current,
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
          },
          {
            x: () => gsap.utils.random(-70, 70),
            y: () => gsap.utils.random(-60, 60),
            duration: 2,
            ease: 'power2.inOut',
          },
          '<',
        )
        .to({}, { duration: 0.5 });

      // 위 타임라인들은 각각 독립적으로
      // 계속 해체→조합→해체→조합… 반복합니다.
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section id="about-art" className="about-art-section" ref={containerRef}>
      <div className="about-art-inner">
        {/* 성장 (Grow) */}
        <div className="art-block">
          <div className="art-keyword" ref={growRef}>
            성장 (Grow)
          </div>
          <div className="art-desc" ref={growDescRef}>
            작은 꾸준함이
            <br />
            결국 큰 변화를 만듭니다.
          </div>
        </div>

        {/* 꾸준함 (Consistency) */}
        <div className="art-block">
          <div className="art-keyword" ref={consistencyRef}>
            꾸준함 (Consistency)
          </div>
          <div className="art-desc" ref={consistencyDescRef}>
            한 걸음씩
            <br />
            계속 나아갈 수 있도록
          </div>
        </div>

        {/* 점들의 연결 (Networking) */}
        <div className="art-block">
          <div className="art-keyword" ref={networkingRef}>
            점들의 연결 (Networking)
          </div>
          <div className="art-desc" ref={networkingDescRef}>
            개별의 점들이
            <br />
            서로를 이어 하나로
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutWorldview;
