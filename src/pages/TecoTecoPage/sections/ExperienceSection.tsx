// src/pages/TecoTecoPage/sections/ExperienceSection.tsx
import React, { useState } from 'react';
import { tecotecoSteps } from '../utils/constants';
import './ExperienceSection.css';

export const ExperienceSection: React.FC = () => {
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(0);

    const handleStepClick = (index: number) => {
        setActiveStepIndex(index === activeStepIndex ? null : index);
    };

    // SVG 일러스트레이션 컴포넌트들
    const StepIllustrations = {
        0: ( // 문제를 만나고
            <svg width="200" height="200" viewBox="0 0 200 200" className="step-illustration">
                <defs>
                    <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FFB5BA', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#B5E7FF', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#C3E88D', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#82AAFF', stopOpacity: 1}} />
                    </linearGradient>
                </defs>

                {/* 배경 원형 */}
                <circle cx="100" cy="100" r="80" fill="url(#gradient1)" opacity="0.3"/>

                {/* 중앙 인물 */}
                <ellipse cx="100" cy="140" rx="15" ry="8" fill="#2a2a2a" opacity="0.3"/> {/* 그림자 */}
                <rect x="85" y="90" width="30" height="50" rx="15" fill="url(#gradient2)"/> {/* 몸체 */}
                <circle cx="100" cy="75" r="20" fill="#FFE4B5"/> {/* 머리 */}

                {/* 문제 블록들 */}
                <rect x="50" y="50" width="25" height="25" rx="5" fill="#FF6B6B" opacity="0.8"/>
                <rect x="125" y="45" width="25" height="25" rx="5" fill="#4ECDC4" opacity="0.8"/>
                <rect x="60" y="120" width="25" height="25" rx="5" fill="#45B7D1" opacity="0.8"/>
                <rect x="130" y="130" width="25" height="25" rx="5" fill="#96CEB4" opacity="0.8"/>

                {/* 움직임 라인 */}
                <path d="M 70 80 Q 85 70 100 75" stroke="#C3E88D" strokeWidth="3" fill="none" opacity="0.7"/>
                <path d="M 130 80 Q 115 70 100 75" stroke="#C3E88D" strokeWidth="3" fill="none" opacity="0.7"/>
            </svg>
        ),
        1: ( // 질문하고
            <svg width="200" height="200" viewBox="0 0 200 200" className="step-illustration">
                <defs>
                    <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#DDA0DD', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#98FB98', stopOpacity: 1}} />
                    </linearGradient>
                </defs>

                {/* 배경 */}
                <circle cx="100" cy="100" r="75" fill="url(#gradient3)" opacity="0.2"/>

                {/* 말풍선들 */}
                <ellipse cx="70" cy="60" rx="25" ry="15" fill="#FFE4E1" opacity="0.9"/>
                <path d="M 60 70 L 55 80 L 70 75 Z" fill="#FFE4E1" opacity="0.9"/>

                <ellipse cx="130" cy="80" rx="30" ry="18" fill="#E0F6FF" opacity="0.9"/>
                <path d="M 140 95 L 145 105 L 125 100 Z" fill="#E0F6FF" opacity="0.9"/>

                {/* 중앙 인물 */}
                <ellipse cx="100" cy="150" rx="12" ry="6" fill="#2a2a2a" opacity="0.3"/>
                <rect x="88" y="110" width="24" height="40" rx="12" fill="#82AAFF"/>
                <circle cx="100" cy="95" r="15" fill="#FFDAB9"/>

                {/* 질문표들 */}
                <text x="70" y="68" textAnchor="middle" fill="#666" fontSize="14" fontWeight="bold">?</text>
                <text x="130" y="88" textAnchor="middle" fill="#666" fontSize="16" fontWeight="bold">?</text>

                {/* 에너지 라인 */}
                <path d="M 85 100 Q 70 85 70 60" stroke="#C3E88D" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
                <path d="M 115 100 Q 130 90 130 80" stroke="#C3E88D" strokeWidth="2" fill="none" strokeDasharray="4,4"/>
            </svg>
        ),
        2: ( // 파고들고
            <svg width="200" height="200" viewBox="0 0 200 200" className="step-illustration">
                <defs>
                    <linearGradient id="gradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FFB6C1', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#87CEEB', stopOpacity: 1}} />
                    </linearGradient>
                </defs>

                {/* 배경 레이어 */}
                <circle cx="100" cy="100" r="70" fill="url(#gradient4)" opacity="0.2"/>

                {/* 깊이감을 주는 원들 */}
                <circle cx="100" cy="100" r="50" fill="#E6E6FA" opacity="0.4"/>
                <circle cx="100" cy="100" r="30" fill="#F0F8FF" opacity="0.6"/>
                <circle cx="100" cy="100" r="15" fill="#FFF" opacity="0.8"/>

                {/* 중앙 인물 (집중하는 모습) */}
                <ellipse cx="100" cy="145" rx="10" ry="5" fill="#2a2a2a" opacity="0.3"/>
                <rect x="90" y="105" width="20" height="35" rx="10" fill="#96CEB4"/>
                <circle cx="100" cy="95" r="12" fill="#FFDAB9"/>

                {/* 탐구하는 도구들 */}
                <circle cx="80" cy="80" r="8" fill="#FFD700" opacity="0.8"/>
                <circle cx="120" cy="75" r="6" fill="#FF69B4" opacity="0.8"/>
                <rect x="70" y="110" width="12" height="3" rx="1" fill="#4169E1" opacity="0.7"/>
                <rect x="118" y="115" width="12" height="3" rx="1" fill="#4169E1" opacity="0.7"/>

                {/* 나선형 탐구 경로 */}
                <path d="M 100 100 Q 120 90 130 100 Q 125 120 100 125 Q 75 120 70 100 Q 75 80 100 85"
                      stroke="#C3E88D" strokeWidth="2" fill="none" strokeDasharray="3,3"/>
            </svg>
        ),
        3: ( // 리뷰하고
            <svg width="200" height="200" viewBox="0 0 200 200" className="step-illustration">
                <defs>
                    <linearGradient id="gradient5" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#E6E6FA', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#F0FFFF', stopOpacity: 1}} />
                    </linearGradient>
                </defs>

                {/* 배경 */}
                <ellipse cx="100" cy="100" rx="80" ry="60" fill="url(#gradient5)" opacity="0.3"/>

                {/* 두 명의 인물 */}
                <ellipse cx="75" cy="140" rx="8" ry="4" fill="#2a2a2a" opacity="0.3"/>
                <ellipse cx="125" cy="140" rx="8" ry="4" fill="#2a2a2a" opacity="0.3"/>

                <rect x="68" y="110" width="14" height="25" rx="7" fill="#82AAFF"/>
                <circle cx="75" cy="100" r="10" fill="#FFDAB9"/>

                <rect x="118" y="110" width="14" height="25" rx="7" fill="#C3E88D"/>
                <circle cx="125" cy="100" r="10" fill="#FFDAB9"/>

                {/* 코드 리뷰 화면 */}
                <rect x="85" y="60" width="30" height="20" rx="3" fill="#2F3349" stroke="#C3E88D" strokeWidth="1"/>
                <rect x="87" y="64" width="26" height="2" rx="1" fill="#C3E88D" opacity="0.6"/>
                <rect x="87" y="68" width="20" height="2" rx="1" fill="#82AAFF" opacity="0.6"/>
                <rect x="87" y="72" width="24" height="2" rx="1" fill="#C3E88D" opacity="0.6"/>

                {/* 피드백 화살표 */}
                <path d="M 82 85 Q 88 75 95 65" stroke="#FF6B6B" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>
                <path d="M 118 85 Q 112 75 105 65" stroke="#4ECDC4" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)"/>

                {/* 화살표 마커 */}
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#C3E88D"/>
                    </marker>
                </defs>
            </svg>
        ),
        4: ( // 성장해요
            <svg width="200" height="200" viewBox="0 0 200 200" className="step-illustration">
                <defs>
                    <linearGradient id="gradient6" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#FFE4E1', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#E0FFE0', stopOpacity: 1}} />
                    </linearGradient>
                    <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor: '#C3E88D', stopOpacity: 1}} />
                        <stop offset="100%" style={{stopColor: '#4ECDC4', stopOpacity: 1}} />
                    </linearGradient>
                </defs>

                {/* 배경 성장 원 */}
                <circle cx="100" cy="100" r="75" fill="url(#gradient6)" opacity="0.3"/>

                {/* 성장하는 나무/식물 */}
                <rect x="98" y="120" width="4" height="40" fill="#8B4513"/> {/* 줄기 */}

                {/* 잎사귀들 */}
                <ellipse cx="85" cy="110" rx="8" ry="12" fill="url(#leafGradient)" transform="rotate(-20 85 110)"/>
                <ellipse cx="115" cy="105" rx="10" ry="15" fill="url(#leafGradient)" transform="rotate(25 115 105)"/>
                <ellipse cx="90" cy="85" rx="12" ry="18" fill="url(#leafGradient)" transform="rotate(-10 90 85)"/>
                <ellipse cx="110" cy="80" rx="14" ry="20" fill="url(#leafGradient)" transform="rotate(15 110 80)"/>

                {/* 중앙 꽃/과실 */}
                <circle cx="100" cy="75" r="8" fill="#FFD700"/>
                <circle cx="100" cy="75" r="4" fill="#FFA500"/>

                {/* 주변 작은 새싹들 */}
                <ellipse cx="70" cy="130" rx="3" ry="6" fill="#90EE90"/>
                <ellipse cx="130" cy="135" rx="3" ry="6" fill="#90EE90"/>
                <ellipse cx="60" cy="145" rx="2" ry="4" fill="#90EE90"/>
                <ellipse cx="140" cy="150" rx="2" ry="4" fill="#90EE90"/>

                {/* 성장 에너지 파티클 */}
                <circle cx="80" cy="60" r="2" fill="#C3E88D" opacity="0.7"/>
                <circle cx="120" cy="55" r="1.5" fill="#82AAFF" opacity="0.7"/>
                <circle cx="75" cy="45" r="1" fill="#FFD700" opacity="0.7"/>
                <circle cx="125" cy="40" r="1" fill="#FF69B4" opacity="0.7"/>

                {/* 그림자 */}
                <ellipse cx="100" cy="160" rx="15" ry="3" fill="#2a2a2a" opacity="0.2"/>
            </svg>
        )
    };

    return (
        <section className="tecoteco-experience-section">
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

            {activeStepIndex !== null && (
                <div className="step-detail-container">
                    <div className="step-detail-content">
                        <div className="step-detail-image-wrapper">
                            {StepIllustrations[activeStepIndex as keyof typeof StepIllustrations]}
                        </div>
                        <h3 className="step-detail-title">{tecotecoSteps[activeStepIndex].title}</h3>
                        <p className="step-detail-text">
                            {tecotecoSteps[activeStepIndex].description}
                        </p>
                    </div>
                </div>
            )}
        </section>
    );
};