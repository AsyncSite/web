// src/pages/TecoTecoPage/sections/FaqJoinSection.tsx
import React, { useState } from 'react';
import { tecotecoFaqs } from '../utils/constants'; //
import './FaqJoinSection.css'; //

export const FaqJoinSection: React.FC = () => {
    const [openFaqId, setOpenFaqId] = useState<number | null>(null);

    const toggleFaq = (id: number) => {
        setOpenFaqId(prevId => (prevId === id ? null : id));
    };

    return (
        <section className="tecoteco-faq-join-section">
            <div className="section-tag-header">궁금증 해결</div>
            <h2 className="section-title">
                FAQ
            </h2>


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
                <h3 className="join-cta-title">TecoTeco, 당신의 합류를 기다려요!</h3>
                <p className="join-description">
                </p>
                <button className="join-contact-button" onClick={() => alert('@renechoi에게 커피챗 요청!')}>
                    @renechoi에게 커피챗 요청하기 ☕
                </button>
            </div>
        </section>
    );
};