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
            title: '🪴 우리는 이런 사람들이에요',
            subtitle: '“잔디를 심는 사람들, 11맨을 소개할게요!”',
            content: (
                <>
                    우리는 <strong>매일 한 줄의 변화</strong>로 성장하는 커뮤니티예요.<br />
                    개발 공부, 사이드 프로젝트, 아니면 그냥 소소한 기록까지,<br />
                    작은 행동들이 모여 <strong>큰 그림</strong>을 만들어가고 있어요. 🚀<br />
                    느슨하지만 끈끈하게, 따로 또 같이 움직이는 사람들이랍니다.<br />
                </>
            ),
        },
        {
            id: 2,
            title: '🌏 우리의 세계관은 이런 거야!',
            subtitle: '“따로 또 같이, 느슨히 그럼에도 끈끈히!”',
            content: (
                <>
                    우리 커뮤니티는 서로의 점(작은 행동)들이 연결되어<br />
                    <strong>집단 지성의 숲</strong>을 만들어가는 공간이에요.<br />
                    각자 다른 궤도를 돌지만, 같은 태양(목표)을 향해 움직이고 있죠. 🌟<br />
                    작은 커밋들이 쌓여 큰 변화를 만든다는 믿음,<br />
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
                    <strong>하루 한 줄</strong>, 11루틴으로 꾸준히 기록하고 공유하며,<br />
                    각자의 속도로 성장해요. 🌱<br />
                    디스코드에서 매주 함께 모여 집중 타임도 갖고,<br />
                    서로의 경험을 나누면서 <strong>공동의 성장</strong>을 만들어가고 있어요.<br />
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
                        <li>혼자보다 <strong>더 꾸준히</strong> 할 수 있어요.</li>
                        <li>작은 기록도 <strong>누군가 응원</strong>해줘요.</li>
                        <li>새로운 아이디어와 <strong>영감이 가득!</strong></li>
                        <li>느슨하지만 든든한 <strong>동료들</strong>이 생겨요.</li>
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
            }
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

        // 모든 카드 DOM 요소 가져오기
        const cardItems = Array.from(
            container.querySelectorAll<HTMLDivElement>('.stack-cards__item')
        );

        // --- (2-1) 처음에 첫 카드 제외 모두 slide-up (숨김) 처리 ---
        cardItems.forEach((card, idx) => {
            if (idx > 0) {
                card.classList.add('slide-up');
            }
        });

        // 다음 카드로 넘어가는 함수
        const showNextCard = (currentIndex: number) => {
            const total = cardItems.length;
            const nextIndex = (currentIndex + 1) % total;
            cardItems[currentIndex].classList.add('slide-up');
            cardItems[nextIndex].classList.remove('slide-up');
        };

        // 이전 카드로 넘어가는 함수
        const showPrevCard = (currentIndex: number) => {
            const total = cardItems.length;
            const prevIndex = (currentIndex - 1 + total) % total;
            cardItems[currentIndex].classList.add('slide-up');
            cardItems[prevIndex].classList.remove('slide-up');
        };

        // --- (2-2) wheel 이벤트 핸들러 ---
        function handleCardWheel(this: HTMLDivElement, e: WheelEvent) {
            const el = e.currentTarget as HTMLDivElement;
            const { scrollTop, scrollHeight, clientHeight } = el;

            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight;

            // 카드 안에서 아직 스크롤 여유가 있으면, 창 전체로의 스크롤 이벤트 전파 중단
            if (!isAtTop && !isAtBottom) {
                e.stopPropagation();
                return;
            }

            // 어느 카드인지 인덱스 확인
            const cardIndex = cardItems.findIndex((c) => c.querySelector('.inner') === el);
            if (cardIndex < 0) return; // 혹시 못 찾았으면 종료

            // 아래로 스크롤 (맨 아래에서 더 스크롤) => 다음 카드
            if (isAtBottom && e.deltaY > 0) {
                e.preventDefault();
                showNextCard(cardIndex);
            }

            // 위로 스크롤 (맨 위에서 더 스크롤) => 이전 카드
            if (isAtTop && e.deltaY < 0) {
                e.preventDefault();
                showPrevCard(cardIndex);
            }
        }

        // --- (2-3) 화살표 클릭 핸들러 ---
        function handleArrowClick(e: MouseEvent) {
            e.preventDefault();
            // 클릭된 화살표가 속한 card index를 찾기
            const arrowEl = e.currentTarget as HTMLDivElement;
            const cardItem = arrowEl.closest('.stack-cards__item');
            if (!cardItem) return;

            const cardIndex = cardItems.indexOf(cardItem as HTMLDivElement);
            if (cardIndex < 0) return;

            // 다음 카드로 이동
            showNextCard(cardIndex);
        }

        // 각 카드 내부 .inner에 wheel 이벤트 등록 & arrow-down 클릭 이벤트 등록
        cardItems.forEach((card) => {
            const innerEl = card.querySelector<HTMLDivElement>('.inner');
            const arrowEl = card.querySelector<HTMLDivElement>('.arrow-down');

            // wheel
            if (innerEl) {
                innerEl.addEventListener('wheel', handleCardWheel, {
                    passive: false, // preventDefault() 사용을 위해
                });
            }

            // arrow click
            if (arrowEl) {
                arrowEl.addEventListener('click', handleArrowClick);
            }
        });

        // cleanup
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
            });
        };
    }, []);

    return (
        <div className="about-page-container" ref={containerRef}>
            <div className="stack-cards">
                {cards.map((card) => (
                    <div className="stack-cards__item" key={card.id}>
                        <div className="inner">
                            <h3>{card.title}</h3>
                            <blockquote>{card.subtitle}</blockquote>
                            <p>{card.content}</p>

                            {/* 카드 하단에 화살표 아이콘(또는 텍스트) */}
                            <div className="arrow-down">⬇</div>
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
