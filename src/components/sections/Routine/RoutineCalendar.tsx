import React, { useState, useEffect } from 'react';
import './RoutineCalendar.css'; // 기존 CSS 파일 위치에 맞게 경로를 조정하세요

const RoutineCalendar: React.FC = () => {
    // (1) 타이핑 로직용 상태들
    const messages = [
        '“작은 목표를 설정해보세요!”',
        '“새로운 커밋을 도전해볼 시간✨”',
        '“오늘은 휴식도 필요해요, 잠깐 쉬어갈까요?”',
    ];
    const [messageIndex, setMessageIndex] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // (2) 현재 MONTH YEAR 구하기
    const getCurrentMonthYear = () => {
        const now = new Date();
        const opts: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
        return now.toLocaleDateString('en-US', opts).toUpperCase();
    };
    const [monthYear, setMonthYear] = useState(getCurrentMonthYear());

    // (3) 타이핑/삭제 애니메이션 로직
    useEffect(() => {
        const currentMessage = messages[messageIndex];
        const typingSpeed = 100;
        const deletingSpeed = 60;
        const holdDelay = 1500;
        const extraPauseAfterDelete = 1000;
        let timer: NodeJS.Timeout;

        if (!isDeleting) {
            if (typedText.length < currentMessage.length) {
                timer = setTimeout(() => {
                    setTypedText(currentMessage.slice(0, typedText.length + 1));
                }, typingSpeed);
            } else {
                timer = setTimeout(() => {
                    setIsDeleting(true);
                }, holdDelay);
            }
        } else {
            if (typedText.length > 0) {
                timer = setTimeout(() => {
                    setTypedText(currentMessage.slice(0, typedText.length - 1));
                }, deletingSpeed);
            } else {
                timer = setTimeout(() => {
                    setIsDeleting(false);
                    setMessageIndex((prev) => (prev + 1) % messages.length);
                }, extraPauseAfterDelete);
            }
        }

        return () => clearTimeout(timer);
    }, [typedText, isDeleting, messageIndex, messages]);

    return (
        <section id="routine" className="routine-section">
            <div className="routine-content">
                <div className="routine-calendar-wrapper">
                    <div className="calendar-container">
                        <div className="calendar-header">
                            <div className="calendar-dot"></div>
                            <div className="month-year">
                                <span className="arrow">{'<'}</span>
                                <span className="month-text">{monthYear}</span>
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

                            <div className="date-cell circle-dates">
                                <span className="check-mark">✓</span>
                                2
                                <div className="coretime-label">모각코 🔥</div>
                            </div>

                            <div className="date-cell">3</div>
                            <div className="date-cell">4</div>
                            <div className="date-cell">5</div>

                            <div className="date-cell highlight-sunday">
                                6
                                <div className="teko-label">테코테코 🧩</div>
                            </div>

                            <div className="date-cell">7</div>
                            <div className="date-cell">8</div>
                            <div className="date-cell">9</div>

                            <div className="date-cell date-with-popup">
                                10
                                <div className="popup-bubble">
                                    <div className="popup-arrow"></div>
                                    <div className="popup-content">
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

                            <div className="date-cell">11</div>
                            <div className="date-cell">12</div>
                            <div className="date-cell">13</div>

                            <div className="date-cell literature-date">
                                14
                                <div className="literature-label">문학의 밤 🏖</div>
                            </div>

                            {/* 다음 주 (15~21) */}
                            <div className="date-cell">15</div>
                            <div className="date-cell">16</div>
                            <div className="date-cell">17</div>
                            <div className="date-cell">18</div>
                            <div className="date-cell">19</div>

                            <div className="date-cell highlight-sunday">
                                20
                                <div className="teko-label">테코테코 🧩</div>
                            </div>
                            <div className="date-cell">21</div>

                            <div className="date-cell devlog-date">
                                22
                                <div className="devlog-label">Devlog</div>
                            </div>

                            <div className="date-cell">23</div>
                            <div className="date-cell">24</div>
                            <div className="date-cell">25</div>
                            <div className="date-cell">26</div>

                            <div className="date-cell highlight-sunday">
                                27
                                <div className="teko-label">테코테코 🧩</div>
                            </div>

                            <div className="date-cell">28</div>
                            <div className="date-cell">29</div>
                            <div className="date-cell">30</div>

                            <div className="date-cell circle-dates">
                                <span className="check-mark">✓</span>
                                31
                                <div className="coretime-label">모각코 🔥</div>
                            </div>

                            <div className="date-cell empty"></div>
                            <div className="date-cell empty"></div>
                            <div className="date-cell empty"></div>
                            <div className="date-cell empty"></div>
                        </div>

                        <div className="calendar-info-bar">
                            <div className="info-label">asyncsite Routine</div>
                            <div className="info-icon"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RoutineCalendar;
