// src/pages/TecoTecoPage/sections/FaqJoinSection.tsx
import React, { useState } from 'react';
import { tecotecoFaqs } from '../utils/constants';
import './FaqJoinSection.css';

export const FaqJoinSection: React.FC = () => {
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setOpenFaqId(prevId => (prevId === id ? null : id));
    };

    return (
        <section className="tecoteco-faq-join-section">
            <h2 className="section-title">궁금한 점이 있다면? <br className="mobile-only"/>TecoTeco에 참여하고 싶다면! 🚀</h2>
            <p className="section-subtitle">
                여러분의 <span className="highlight">궁금증을 해소</span>하고, <span className="highlight">성장 여정</span>에 함께할 준비가 되어있습니다.
            </p>
            <div className="tecoteco-faq-items">
                {tecotecoFaqs.map(faq => (
                    <div
                        key={faq.id}
                        className={`tecoteco-faq-item ${openFaqId === faq.id ? 'open' : ''}`}
                    >
                        <div
                            className="tecoteco-faq-question"
                            onClick={() => toggleFaq(faq.id)}
                            role="button"
                            aria-expanded={openFaqId === faq.id}
                        >
                            <span className="tecoteco-faq-icon">Q.</span>
                            <span className="tecoteco-faq-question-text">{faq.question}</span>
                            <span className="tecoteco-faq-toggle-icon">
                                {openFaqId === faq.id ? '▲' : '▼'}
                            </span>
                        </div>
                        {openFaqId === faq.id && (
                            <div className="tecoteco-faq-answer">
                                <span className="tecoteco-faq-icon">A.</span>
                                <p>{faq.answer}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="join-cta-block">
                <p className="join-description">
                    현재는 공식 모집을 진행하고 있지는 않지만, <span className="highlight">테코테코의 여정에 함께하고 싶다면</span> 주저하지 마세요!
                </p>
                <button className="join-contact-button" onClick={() => alert('renechoi에게 커피챗 요청!')}>
                    @renechoi에게 커피챗 요청하기
                </button>
            </div>
        </section>
    );
};