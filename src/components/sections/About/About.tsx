import React, { useEffect, useRef, useState } from 'react';
import './About.css';

interface CardContent {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // "About 섹션"에 도달했을 때 자동 스크롤을 한 번만 실행하기 위한 상태
  const [hasForcedScroll, setHasForcedScroll] = useState(false);

  // 카드 데이터
  const cards: CardContent[] = [
    {
      id: 1,
      title: '🪴 Async Site: 함께 성장하는 공간',
      subtitle: '“배우고, 공유하고, 함께 나아가는 개발자 커뮤니티”',
      content: (
        <div className="card-content-redesign">
          <div className="card-point">
            <span className="card-point-icon">🌱</span>
            <div className="card-point-text">
              <h4 className="card-point-keyword">꾸준한 학습과 실천</h4>
              <p className="card-point-explanation">
                매일 작은 목표를 통해 함께 <strong>성장하며</strong>, 어제보다 나은 오늘을 만들어요.
              </p>
            </div>
          </div>
          <div className="card-point">
            <span className="card-point-icon">💡</span>
            <div className="card-point-text">
              <h4 className="card-point-keyword">자유로운 지식 공유</h4>
              <p className="card-point-explanation">
                스터디, 경험담, Q&A로 서로의 성장을 돕는 <strong>집단 지성</strong>을 추구해요.
              </p>
            </div>
          </div>
          <div className="card-point">
            <span className="card-point-icon">🔗</span>
            <div className="card-point-text">
              <h4 className="card-point-keyword">수평적 연결과 지지</h4>
              <p className="card-point-explanation">
                부담 없는 분위기에서 <strong>관심사</strong>를 기반으로 자유롭게 교류하고 응원해요.
              </p>
            </div>
          </div>
        </div>
      ),
    },

    {
      id: 2,
      title: '🌏 우리의 세계관은 이런 거야!',
      subtitle: '“따로 또 같이, 느슨히 그럼에도 끈끈히!”',
      content: (
        <>
          우리 커뮤니티는 서로의 점(작은 행동)들이 연결되어
          <br />
          <strong>집단 지성의 숲</strong>을 만들어가는 공간이에요.
          <br />
          각자 다른 궤도를 돌지만, 같은 태양(목표)을 향해 움직이고 있죠. 🌟
          <br />
          작은 커밋들이 쌓여 큰 변화를 만든다는 믿음,
          <br />
          이게 바로 우리 세계관의 핵심!
        </>
      ),
    },
    {
      id: 3,
      title: '💡 우리 뭐 하고 있냐고?',
      subtitle: '“작고 꾸준한 행동이 세상을 바꿀지도 몰라요!”',
      content: (
        <>
          <strong>하루 한 줄</strong>, 11루틴으로 꾸준히 기록하고 공유하며,
          <br />
          각자의 속도로 성장해요. 🌱
          <br />
          디스코드에서 매주 함께 모여 집중 타임도 갖고,
          <br />
          서로의 경험을 나누면서 <strong>공동의 성장</strong>을 만들어가고 있어요.
          <br />
          부담은 적고, 재미는 많아요. 😄
        </>
      ),
    },
    {
      id: 4,
      title: '🤝 함께하면 뭐가 좋을까?',
      subtitle: '“너랑 같이라면, 더 멋질 거야!”',
      content: (
        <>
          <ul>
            <li>
              혼자보다 <strong>더 꾸준히</strong> 할 수 있어요.
            </li>
            <li>
              작은 기록도 <strong>누군가 응원</strong>해줘요.
            </li>
            <li>
              새로운 아이디어와 <strong>영감이 가득!</strong>
            </li>
            <li>
              느슨하지만 든든한 <strong>동료들</strong>이 생겨요.
            </li>
          </ul>
          자, 이제 같이 잔디 심으러 가볼까요? 🌱
        </>
      ),
    },
  ];

  /**
   * (1) IntersectionObserver로 "About" 섹션이 20% 정도 보이기 시작하면
   *    -> 해당 섹션을 화면 중앙으로 이동. 단, 한 번만 실행
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // About 섹션이 threshold(0.2) 이상으로 보이기 시작 && 아직 스크롤 실행 안 했다면
        if (entry.isIntersecting && !hasForcedScroll) {
          // 뷰포트 중앙으로 스크롤하기 위한 계산
          const rect = container.getBoundingClientRect();
          // 현재 스크롤 위치
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
          // 컨테이너 중심 = 컨테이너의 상단 위치 + (컨테이너 높이 / 2)
          const containerCenterY = rect.top + currentScrollY + rect.height / 2;
          // 뷰포트의 중앙 위치 = 현재 스크롤 + (뷰포트 높이 / 2)
          const viewportCenterY = currentScrollY + window.innerHeight / 2;

          // 스크롤해야 하는 위치(컨테이너의 중심 - 뷰포트의 절반)
          const offsetToCenter = containerCenterY - window.innerHeight / 2;

          window.scrollTo({
            top: offsetToCenter,
            behavior: 'smooth',
          });
          setHasForcedScroll(true);
        }
      },
      {
        threshold: 0.2, // About 섹션이 20% 이상 보이는 지점에서 트리거
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [hasForcedScroll]);

  /**
   * (2) 카드 초기 설정 & wheel/arrow 이벤트
   */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cardItems = Array.from(container.querySelectorAll<HTMLDivElement>('.stack-cards__item'));

    cardItems.forEach((card, idx) => {
      if (idx > 0) {
        card.classList.add('slide-up');
      }
    });

    const showNextCard = (currentIndex: number) => {
      const total = cardItems.length;
      // 다음 카드로 이동 (마지막 카드에서 처음으로 순환)
      const nextIndex = (currentIndex + 1) % total;
      if (currentIndex === cardItems.length - 1 && nextIndex === 0) {
        // 이 부분은 순환을 막고 싶다면 조건을 추가하거나,
        // 현재는 순환되도록 둡니다 (하단 화살표와 동일한 로직).
        // 만약 이 클릭 방식으로는 순환시키고 싶지 않다면 아래와 같이 수정:
        // if (currentIndex < cardItems.length - 1) {
        //   cardItems[currentIndex].classList.add('slide-up');
        //   cardItems[currentIndex + 1].classList.remove('slide-up');
        // }
        // 여기서는 기존 showNextCard/showPrevCard의 순환 로직을 따르겠습니다.
      }
      cardItems[currentIndex].classList.add('slide-up');
      cardItems[nextIndex].classList.remove('slide-up');
    };

    const showPrevCard = (currentIndex: number) => {
      const total = cardItems.length;
      // 이전 카드로 이동 (첫 카드에서 마지막으로 순환)
      const prevIndex = (currentIndex - 1 + total) % total;
      if (currentIndex === 0 && prevIndex === cardItems.length - 1) {
        // 순환을 막고 싶다면 조건 추가
        // if (currentIndex > 0) {
        //    cardItems[currentIndex].classList.add('slide-up');
        //    cardItems[currentIndex - 1].classList.remove('slide-up');
        // }
      }
      cardItems[currentIndex].classList.add('slide-up');
      cardItems[prevIndex].classList.remove('slide-up');
    };

    function handleCardWheel(this: HTMLDivElement, e: WheelEvent) {
      const el = e.currentTarget as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // -1은 스크롤 정밀도 문제 보정

      if (!isAtTop && !isAtBottom) {
        e.stopPropagation();
        return;
      }

      const cardItem = el.closest('.stack-cards__item');
      if (!cardItem) return;
      const cardIndex = cardItems.indexOf(cardItem as HTMLDivElement);
      if (cardIndex < 0) return;

      if (isAtBottom && e.deltaY > 0) {
        e.preventDefault();
        showNextCard(cardIndex);
      }
      if (isAtTop && e.deltaY < 0) {
        e.preventDefault();
        showPrevCard(cardIndex);
      }
    }

    function handleArrowClick(e: MouseEvent) {
      e.preventDefault();
      const arrowEl = e.currentTarget as HTMLDivElement;
      const cardItem = arrowEl.closest('.stack-cards__item');
      if (!cardItem) return;
      const cardIndex = cardItems.indexOf(cardItem as HTMLDivElement);
      if (cardIndex < 0) return;
      showNextCard(cardIndex);
    }

    function handleCardRegionClick(this: HTMLDivElement, e: MouseEvent) {
      const cardItem = this; // '.stack-cards__item'
      const target = e.target as HTMLElement;

      // 클릭된 요소가 화살표(.arrow-down)거나 그 자식이면, 화살표 자체의 클릭 핸들러가 처리
      if (target.closest('.arrow-down')) {
        return;
      }

      // ✨ 텍스트 영역 클릭 시에도 카드 이동을 허용하기 위해 아래 조건문 제거 또는 주석 처리
      // const innerElement = cardItem.querySelector<HTMLDivElement>('.inner');
      // if (innerElement && innerElement.contains(target) && target !== innerElement) {
      //     return;
      // }

      const cardIndex = cardItems.indexOf(cardItem);
      if (cardIndex < 0) return;

      const rect = cardItem.getBoundingClientRect();
      const clickYInCard = e.clientY - rect.top; // 카드 상단 기준 클릭 위치

      if (clickYInCard < rect.height / 2) {
        // 카드 상단 절반 클릭
        showPrevCard(cardIndex);
      } else {
        // 카드 하단 절반 클릭
        showNextCard(cardIndex);
      }
    }

    cardItems.forEach((card) => {
      const innerEl = card.querySelector<HTMLDivElement>('.inner');
      const arrowEl = card.querySelector<HTMLDivElement>('.arrow-down');

      if (innerEl) {
        innerEl.addEventListener('wheel', handleCardWheel, { passive: false });
      }
      if (arrowEl) {
        arrowEl.addEventListener('click', handleArrowClick);
      }
      // ✨ 각 카드 아이템에 새로운 클릭 이벤트 리스너 등록
      card.addEventListener('click', handleCardRegionClick);
    });

    return () => {
      cardItems.forEach((card) => {
        const innerEl = card.querySelector<HTMLDivElement>('.inner');
        const arrowEl = card.querySelector<HTMLDivElement>('.arrow-down');

        if (innerEl) {
          innerEl.removeEventListener('wheel', handleCardWheel);
        }
        if (arrowEl) {
          arrowEl.removeEventListener('click', handleArrowClick);
        }
        // ✨ 등록된 리스너 제거
        card.removeEventListener('click', handleCardRegionClick);
      });
    };
  }, []); // 의존성 배열은 초기 설정대로 비워둡니다.

  useEffect(() => {
    const cardItems = Array.from(
      containerRef.current?.querySelectorAll<HTMLDivElement>('.stack-cards__item') || [],
    );

    if (cardItems.length === 0) return;

    // IntersectionObserver 콜백: entry.isIntersecting 지표로 visible 토글
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLDivElement;
          if (entry.isIntersecting) {
            el.classList.add('visible');
          } else {
            el.classList.remove('visible');
          }
        });
      },
      {
        root: null,
        threshold: 0.3, // 카드가 30% 보이기 시작하면 콜백 실행
      },
    );

    cardItems.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div id="about" className="about-page-container" ref={containerRef}>
      <div className="stack-cards">
        {cards.map((card) => (
          <div className="stack-cards__item" key={card.id}>
            <div className="inner">
              <h3>{card.title}</h3>
              <blockquote>{card.subtitle}</blockquote>
              <p>{card.content}</p>

              {/* 카드 하단에 화살표 아이콘(또는 텍스트) */}
              <div className="arrow-down">
                ⬇
                {card.id === 1 && ( // 첫 번째 카드에만 안내 문구 추가
                  <span className="navigation-hint">
                    아래로 스크롤하거나 화살표를 클릭해 보세요!
                  </span>
                )}
              </div>
              <div className="counter">
                {card.id}/{cards.length}
              </div>
            </div>
            <div className="shadow" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
