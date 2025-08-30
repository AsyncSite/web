import React, {useEffect, useState} from 'react';
import styles from './About.module.css';
import {useScrollAnimation} from '../../../hooks/useScrollAnimation';

interface AboutSection {
    id: number;
    layout: 'question-left' | 'answer-left';
    questionNumber: string;
    questionTitle: string | React.ReactNode;
    questionIcon: string;
    answerTitle: string | React.ReactNode;
    answerText: string | React.ReactNode;
    features?: {
        icon: string;
        text: string;
    }[];
    highlights?: {
        icon: string;
        title: string;
        description: string;
    }[];
}

const About: React.FC = () => {
    // Flip 애니메이션을 위한 텍스트 배열
    const flipTexts = [
        "개발자의 금요일 저녁이",
        "1년차 루나의 토요일 아침이",
        "취준생 아로의 일요일 오후가",
        "5년차 팀장 노바의 목요일 밤이",
        "이직 준비생 리오의 화요일 새벽이"
    ];

    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [nextTextIndex, setNextTextIndex] = useState(1);
    const [isFlipping, setIsFlipping] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFlipping(true);

            setTimeout(() => {
                setCurrentTextIndex(nextTextIndex);
                setNextTextIndex((nextTextIndex + 1) % flipTexts.length);
                setIsFlipping(false);
            }, 800); // 애니메이션 완료 시점
        }, 4000); // 4초마다 텍스트 변경

        return () => clearInterval(interval);
    }, [nextTextIndex, flipTexts.length]);

    // About 섹션 데이터 - 따뜻한 서사 구조로 재구성
    const aboutSections: AboutSection[] = [
        {
            id: 1,
            layout: 'question-left',
            questionNumber: '01',
            questionTitle: (
                <>
                    Async Site는<br/>
                    어떤 고민에서 시작했나요?
                </>
            ),
            questionIcon: '💭',
            answerTitle: '혼자 공부하다 포기한 적 없으세요?',
            answerText: (
                <>
                    유튜브 재생목록엔 '나중에 볼 영상' 300개,<br/>
                    깃허브 잔디는 듬성듬성,<br/>
                    시작은 거창했지만 흐지부지된 사이드 프로젝트들.<br/>
                    <br/>
                    우리 모두 겪어본 이야기입니다.<br/>
                    Async Site는 여기서 시작했어요.
                </>
            ),
            features: [
                {icon: '🤝', text: '함께하니까 꾸준해져요'},
                {icon: '📅', text: '매주 금요일이 기다려져요'},
                {icon: '🔥', text: '작심삼일이 작심삼년으로'}
            ]
        },
        {
            id: 2,
            layout: 'answer-left',
            questionNumber: '02',
            questionTitle: (
                <>
                    그래서, 이번엔<br/>
                    끝까지 갈 수 있나요?
                </>
            ),
            questionIcon: '🎯',
            answerTitle: '비결은 노력하지 않는 거예요.',
            answerText: (
                <>
                    월요일: "이번엔 진짜야"<br/>
                    수요일: "오늘 커밋하셨나요?"<br/>
                    금요일: "벌써 5주차네?"<br/>
                    <br/>
                    노력하지 마세요.<br/>
                    대신 '포기하기 어려운 구조'에 자신을 넣으세요.<br/>
                    성장을 자동화하세요.<br/>
                    <br/>
                    '느슨해서' 부담 없지만, '끈끈해서' 포기할 수 없는.<br/>
                    우리는 이걸 '건강한 강제성'이라고 불러요.
                </>
            ),
            features: [
                {icon: '⚙️', text: '의지력은 거들 뿐, 시스템으로 성장해요'},
                { icon: '🚀', text: '등 떠밀려 가다 보면, 어느새 도달!' },
                {icon: '🧲', text: '치열하게, 건강하게, 함께'}
            ]
        },
        {
            id: 3,
            layout: 'question-left',
            questionNumber: '03',
            questionTitle: '왜 좋은 동료와 함께하면 다를까요?',
            questionIcon: '🤝',
            answerTitle: "혼자는 어려운 성장의 밀도가 있어요.",
            answerText: (
                <>
                    같은 한 시간도, 함께일 때 몰입의 깊이가 달라져요.<br/>
                    나의 막힘이 동료에겐 새로운 발견이 되고,<br/>
                    동료의 날카로운 질문이 나의 편협한 시야를 깨부수죠.<br/>
                    <br/>
                    우리에게 필요한 건 기록 이상의 '증거'에요.<br/>
                    동료들은, 당신의 깃허브 잔디가 보여주지 못하는<br/>
                    치열했던 깊이의 과정을 증명해 줄 가장 확실한 증인이니까요.
                </>
            ),
            features: [
                {icon: '🎯', text: '공동의 목표 달성를 달성해요'},
                {icon: '💪', text: '서로의 몰입에 전염돼요'},
                {icon: '🌈', text: '다양한 관점에서 배워요'}
            ]
        }
    ];

    return (
        <section className={`${styles.about} section-background`} id="about">
            <div className="container">
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>
                        <div className={`${styles.flipTextContainer} ${isFlipping ? styles.flipping : ''}`}>
                            <div className={styles.flipCard}>
                                <div className={`${styles.flipCardFace} ${styles.flipCardCurrent}`}>
                                    <span className={styles.flipText}>{flipTexts[currentTextIndex]}</span>
                                </div>
                                <div className={`${styles.flipCardFace} ${styles.flipCardNext}`}>
                                    <span className={styles.flipText}>{flipTexts[nextTextIndex]}</span>
                                </div>
                            </div>
                        </div>
                        <br/>
                        특별해지는 이유
                    </h2>
                    <p className={styles.sectionSubtitle}>끝없이 쏟아지는 새로운 기술들, AI가 코드를 대신 짜주는 시대.<br/>
                        우리는 무엇을 추구해야 할까요?</p>
                </div>

                <main className={styles.aboutContainer}>
                    {aboutSections.map((section) => {
                        const questionBlockRef = useScrollAnimation(styles.animateIn, {
                            threshold: 0.4,
                            rootMargin: '0px 0px -50px 0px',
                            triggerOnce: false
                        });

                        const answerBlockRef = useScrollAnimation(styles.animateIn, {
                            threshold: 0.4,
                            rootMargin: '0px 0px -50px 0px',
                            delay: 200,
                            triggerOnce: false
                        });

                        return (
                            <section key={section.id} className={styles.aboutSubsection} data-layout={section.layout}>
                                <div className={styles.sectionInner}>
                                    <div className={styles.questionBlock} ref={questionBlockRef}>
                                        <div className={styles.questionNumber}>{section.questionNumber}</div>
                                        <h2 className={styles.questionTitle}>{section.questionTitle}</h2>
                                        <div className={styles.questionVisual}>
                                            <div className={styles.visualIcon}>{section.questionIcon}</div>
                                            <div className={styles.visualDecoration}></div>
                                        </div>
                                    </div>
                                    <div className={styles.answerBlock} ref={answerBlockRef}>
                                        <h3 className={styles.answerTitle}>{section.answerTitle}</h3>
                                        <div className={styles.answerText}>{section.answerText}</div>

                                        {section.features && (
                                            <div className={styles.answerFeatures}>
                                                {section.features.map((feature, index) => (
                                                    <div key={index} className={styles.featureItem}>
                                                        <span className={styles.featureIcon}>{feature.icon}</span>
                                                        <span>{feature.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.highlights && (
                                            <div className={styles.cultureHighlights}>
                                                {section.highlights.map((highlight, index) => (
                                                    <div key={index} className={styles.highlightItem}>
                                                        <div className={styles.highlightIcon}>{highlight.icon}</div>
                                                        <div className={styles.highlightText}>
                                                            <h4>{highlight.title}</h4>
                                                            <p>{highlight.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </main>
            </div>
        </section>
    );
};

export default About;