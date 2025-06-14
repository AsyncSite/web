// src/pages/TecoTecoPage/sections/ExperienceSection.tsx
import React, { useState } from 'react';
import { tecotecoSteps } from '../utils/constants';
import { handleImgError } from '../utils/helpers';
import './ExperienceSection.css';

export const ExperienceSection: React.FC = () => {
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0);

    const handleStepClick = (index: number) => {
        setActiveStepIndex(index === activeStepIndex ? null : index);
    };

    return (
        <section className="tecoteco-experience-section">
            {/* 상단 태그 헤더 추가 */}
            <div className="section-tag-header">성장을 위한 스텝</div>

            <h2 className="section-title">테코테코 모임을 한다는 건</h2>
            <p className="section-subtitle">
                매주 금요일 저녁, <span className="highlight">이런 루틴</span>으로 함께 성장해요.
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
                <div className="step-detail-container">
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
            {/* 선택된 스텝의 상세 내용 */}

        </section>
    );
};