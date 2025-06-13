// src/pages/TecoTecoPage/sections/ExperienceSection.tsx
import React, { useState } from 'react';
import { tecotecoSteps } from '../utils/constants';
import { handleImgError } from '../utils/helpers';
import './ExperienceSection.css';

export const ExperienceSection: React.FC = () => {
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0); // 0번째 스텝을 기본 활성화

    // 스텝 클릭 핸들러
    const handleStepClick = (index: number) => {
        setActiveStepIndex(index === activeStepIndex ? null : index); // 같은 스텝 클릭 시 닫기
    };

    return (
        <section className="tecoteco-experience-section">
            <h2 className="section-title">테코테코 모임을 한다는 건</h2>
            <p className="section-subtitle">
                우리는 매주 금요일, <span className="highlight">이런 단계</span>를 거쳐 함께 성장합니다.
            </p>

            <div className="tecoteco-steps-nav">
                {tecotecoSteps.map((step, index) => (
                    <div
                        key={index}
                        className={`step-item ${activeStepIndex === index ? 'active' : ''}`}
                        onClick={() => handleStepClick(index)}
                    >
                        <div className="step-button">
                            {index + 1}
                        </div>
                        <p className="step-label">{step.label}</p>
                    </div>
                ))}
            </div>

            {/* 선택된 스텝의 상세 내용 */}
            {activeStepIndex !== null && (
                <div className={`step-detail-container ${activeStepIndex !== null ? 'active' : ''}`}>
                    <div className="step-detail-content">
                        <h3 className="step-detail-title">{tecotecoSteps[activeStepIndex].title}</h3>
                        <div className="step-detail-image-wrapper">
                            <img
                                src={tecotecoSteps[activeStepIndex].image}
                                alt={tecotecoSteps[activeStepIndex].title}
                                onError={handleImgError}
                            />
                        </div>
                        <p className="step-detail-text">
                            {tecotecoSteps[activeStepIndex].description}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};