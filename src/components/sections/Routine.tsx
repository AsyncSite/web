import React, { useState, useEffect } from 'react';
import './Routine.css';

const Routine: React.FC = () => {
    // ★ (1) 타이핑 로직용 상태들
    const messages = ["코어타임", "예시 메시지입니다"];
    const [messageIndex, setMessageIndex] = useState(0); // 어떤 메시지?
    const [typedText, setTypedText] = useState("");       // 현재 타이핑된 텍스트
    const [isDeleting, setIsDeleting] = useState(false);  // 삭제 중 여부


    useEffect(() => {
        const currentMessage = messages[messageIndex];
        const typingSpeed = 100;
        const deletingSpeed = 60;
        const holdDelay = 1500;
        const extraPauseAfterDelete = 1000;

        let timer: NodeJS.Timeout;

        if (!isDeleting) {
            // 타이핑 중
            if (typedText.length < currentMessage.length) {
                timer = setTimeout(() => {
                    setTypedText(currentMessage.slice(0, typedText.length + 1));
                }, typingSpeed);
            } else {
                // 모두 타이핑 후 잠시 대기
                timer = setTimeout(() => {
                    setIsDeleting(true);
                }, holdDelay);
            }
        } else {
            // 지우는 중
            if (typedText.length > 0) {
                timer = setTimeout(() => {
                    setTypedText(currentMessage.slice(0, typedText.length - 1));
                }, deletingSpeed);
            } else {
                // 글자 모두 지움 → 잠시 쉰 뒤 다음 메시지
                timer = setTimeout(() => {
                    setIsDeleting(false);
                    setMessageIndex((prev) => (prev + 1) % messages.length);
                }, extraPauseAfterDelete);
            }
        }

        return () => clearTimeout(timer);
    }, [typedText, isDeleting, messageIndex, messages]);


    return (
        <div className="routine-page">
            <header className="header-section">
                {/* ★ 변경됨: Apple 스타일의 타이포그래피 개선 */}
                <div className="header-content">
                    <h1 className="header-title">
                        세상은 누군가의 커밋으로 만들어지고 있으니까
                    </h1>
                    <p className="header-sub">
                        못하는 건 같이 하면 되니까
                    </p>
                    <p className="header-sub">
                        문제는 목표도 의지도 아니야, <strong>시스템</strong>이야
                    </p>
                    <p className="header-sub">
                        공전하는 별들이 모여 별자리를 이루다,
                        <strong className="highlight-11men"> 11men - ★</strong>
                    </p>
                </div>
            </header>


            {/* 헤더와 첫 섹션 사이 연결선 */}
            <div className="box-connector"></div>

            {/* 첫 번째 섹션 (텍스트 왼쪽 + 이미지 오른쪽) */}
            <section className="white-box">
                <div className="white-box-inner">
                    <div className="section-text-col">
                        <div className="text-large">11 루틴 : 주 1회 온라인 코어타임</div>
                        <div className="text-small">
                            우리만의 시스템으로 부담 없지만 가볍지 않은 협업을 유지합니다.
                            주 1회, 모두가 함께하는 시간을 통해 진행 상황을 공유하고
                            서로 동기부여를 받습니다.
                        </div>
                    </div>
                    <div className="section-image-col">
                        <img
                            src="/images/sample3.png"
                            alt="주 1회 온라인 코어타임 이미지"
                        />
                    </div>
                </div>
            </section>

            <div className="box-connector"></div>

            {/* 두 번째 섹션 (이미지 오른쪽 → reverse) */}
            <section className="white-box">
                <div className="white-box-inner reverse">
                    <div className="section-image-col">
                        <img
                            src="/images/005%20(1).png"
                            alt="테코테코 코테 모임 이미지"
                        />
                    </div>
                    <div className="section-text-col">
                        <div className="text-large">테코테코 - 코테를 뿌수다</div>
                        <div className="text-small">
                            알고리즘을 함께 풀고 리뷰하는 매주 일요일 오전의 코테 모임.
                            실전 문제풀이와 코드 리뷰 과정을 통해
                            한 단계 더 성장할 수 있도록 도와줍니다.
                        </div>
                    </div>
                </div>
            </section>

            <div className="box-connector"></div>

            {/* 세 번째 섹션 (텍스트 왼쪽) */}
            <section className="white-box">
                <div className="white-box-inner">
                    <div className="section-text-col">
                        <div className="text-large">노앤써 - 시스템 디자인 스터디</div>
                        <div className="text-small">
                            답이 없는 무한한 소프트웨어 개발의 세계.
                            매주 일요일 오후에 모여 확장성과 안정성을 함께 고민하고,
                            더 나은 시스템 아키텍처를 설계하기 위한
                            다양한 시도들을 나눕니다.
                        </div>
                    </div>
                    <div className="section-image-col">
                        <img
                            src="/images/IMG_9188.jpg"
                            alt="노앤써 시스템 디자인 스터디 이미지"
                        />
                    </div>
                </div>
            </section>

            <div className="box-connector"></div>

            {/* 네 번째 섹션 (reverse) */}
            <section className="white-box">
                <div className="white-box-inner reverse">
                    <div className="section-image-col">
                        <img
                            src="https://via.placeholder.com/600x400/666/fff?text=Q%26A+Channel"
                            alt="무엇이든 물어보살 채널 이미지"
                        />
                    </div>
                    <div className="section-text-col">
                        <div className="text-large">무엇이든 물어보살 & 이슈 있슈</div>
                        <div className="text-small">
                            개발하면서 혹은 일상 속에서 마주치는 크고 작은 문제들,
                            해결에 대한 힌트를 서로 주고받는 채널입니다.
                            이미 150건이 넘는 Q&A가 활발히 오가며 함께 성장하고 있습니다.
                        </div>
                    </div>
                </div>
            </section>

            <div className="box-connector"></div>

            {/* 다섯 번째 섹션 (텍스트 왼쪽) */}
            <section className="white-box">
                <div className="white-box-inner">
                    <div className="section-text-col">
                        <div className="text-large">터닝페이지 : 정기적 회고 모임</div>
                        <div className="text-small">
                            커리어와 삶에 대한 고민을 나누고, 서로의 인사이트를 배웁니다.
                            정기적인 회고를 통해 우리의 현재 방향을 점검하고
                            미래를 위한 로드맵을 함께 그려가는 시간입니다.
                        </div>
                    </div>
                    <div className="section-image-col">
                        <img
                            src="https://via.placeholder.com/600x400/777/fff?text=터닝페이지"
                            alt="터닝페이지 정기적 회고 모임 이미지"
                        />
                    </div>
                </div>
            </section>

            <div className="box-connector"></div>

            {/* 달력 섹션 (흰 배경 X, 기존 검정 배경 유지) */}
            <section id="routine" className="routine-section">
                <div className="routine-content">
                    <div className="routine-calendar-wrapper">
                        <div className="calendar-container">
                            <div className="calendar-header">
                                <div className="calendar-dot"></div>
                                <div className="month-year">
                                    <span className="arrow">{'<'}</span>
                                    <span className="month-text">MAY 2023</span>
                                    <span className="arrow">{'>'}</span>
                                </div>
                                <div className="calendar-grid-icon"></div>
                            </div>

                            <div className="calendar-days">
                                <div>S</div>
                                <div>M</div>
                                <div>T</div>
                                <div>W</div>
                                <div>T</div>
                                <div>F</div>
                                <div>S</div>
                            </div>

                            <div className="calendar-dates">
                                <div className="date-cell">1</div>
                                <div className="date-cell">2</div>
                                <div className="date-cell">3</div>
                                <div className="date-cell">4</div>
                                <div className="date-cell">5</div>
                                <div className="date-cell highlight-core">
                                    6
                                    <div className="coretime-label">22~23</div>
                                </div>
                                <div className="date-cell">7</div>

                                <div className="date-cell">8</div>
                                {/* 여기서부터 9, 10, 11에 동그라미 & 애니메이션 효과 */}
                                <div className="date-cell circle-dates">
                                    <span className="check-mark">✓</span>
                                    9
                                </div>
                                <div className="date-cell circle-dates">
                                    <span className="check-mark">✓</span>
                                    10
                                </div>
                                <div className="date-cell circle-dates">
                                    <span className="check-mark">✓</span>
                                    11
                                </div>
                                {/* 12일 말풍선 (항상 표시) */}
                                <div className="date-cell date-with-popup">
                                    12
                                    <div className="popup-bubble">
                                        <div className="popup-arrow"></div>
                                        <div className="popup-content">
                                            {/* ★ (2) 여기가 타이핑 문구 부분 */}
                                            <div className="popup-placeholder">
                                                {typedText.length > 0 ? (
                                                    <>
                                                        <span className="typed-text">{typedText}</span>
                                                        <span className="cursor"></span>
                                                    </>
                                                ) : (
                                                    <span className="placeholder-text">New Event</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="date-cell">13</div>
                                <div className="date-cell highlight-sunday">
                                    14
                                    <div className="teko-label">테코테코</div>
                                    <div className="noanswer-label">노앤써</div>
                                </div>

                                {/* ...이하 동일 */}
                                <div className="date-cell">15</div>
                                <div className="date-cell">16</div>
                                <div className="date-cell">17</div>
                                <div className="date-cell">18</div>
                                <div className="date-cell">19</div>
                                <div className="date-cell">20</div>
                                <div className="date-cell highlight-sunday">
                                    21
                                    <div className="teko-label">테코테코</div>
                                    <div className="noanswer-label">노앤써</div>
                                </div>

                                <div className="date-cell">22</div>
                                <div className="date-cell">23</div>
                                <div className="date-cell">24</div>
                                <div className="date-cell">25</div>
                                <div className="date-cell">26</div>
                                <div className="date-cell">27</div>
                                <div className="date-cell highlight-sunday">
                                    28
                                    <div className="teko-label">테코테코</div>
                                    <div className="noanswer-label">노앤써</div>
                                </div>

                                <div className="date-cell">29</div>
                                <div className="date-cell">30</div>
                                <div className="date-cell">31</div>
                                <div className="date-cell empty"></div>
                                <div className="date-cell empty"></div>
                                <div className="date-cell empty"></div>
                                <div className="date-cell empty"></div>
                            </div>

                            <div className="calendar-info-bar">
                                <div className="info-label">11men Routine</div>
                                <div className="info-icon"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Routine;
