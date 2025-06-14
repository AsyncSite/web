// src/pages/TecoTecoPage/sections/HowWeRollSection.tsx
import React from 'react';
import './HowWeRollSection.css';

export const HowWeRollSection: React.FC = () => {
    return (
        <section className="tecoteco-how-we-roll-section">
            <div className="section-tag-header">모임 상세 안내</div>

            <h2 className="section-title">🗓️ 테코테코와 함께하는 특별한 시간</h2>
            <p className="section-subtitle">
                매주 금요일 저녁, 우리는 이렇게 <span className="highlight">의미 있는 시간</span>을 함께 만들어갑니다.
            </p>

            <div className="meeting-overview">
                <div className="overview-card main-meeting">
                    <div className="card-icon">🏢</div>
                    <div className="card-content">
                        <h3>정기 모임</h3>
                        <p><span className="highlight">매주 금요일 저녁 7:30 ~ 9:30</span></p>
                        <p>강남역 인근 스터디룸에서 만나 <span className="color-primary-text">오프라인 중심</span>으로 진행해요</p>
                        <p className="sub-note">상황에 따라 온라인(Discord)으로도 진행합니다</p>
                    </div>
                </div>

                <div className="overview-card study-material">
                    <div className="card-icon">📚</div>
                    <div className="card-content">
                        <h3>함께 공부하는 교재</h3>
                        <p><a href="https://product.kyobobook.co.kr/detail/S000212576322" target="_blank" rel="noopener noreferrer">
                            <span className="highlight">코딩 테스트 합격자 되기: 자바 편</span> (골드래빗)
                        </a></p>
                        <p>체계적인 커리큘럼과 함께 <span className="color-secondary-text">다양한 온라인 저지</span>도 활용해요</p>
                    </div>
                </div>

                <div className="overview-card cost-info">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                        <h3>참여 비용</h3>
                        <p>스터디룸 대관료 1/N 정산</p>
                    </div>
                </div>
            </div>

            <h3 className="intro-sub-heading">금요일 저녁, 우리의 <span className="highlight">성장 루틴</span></h3>
            <p className="schedule-intro">
                짧은 2시간이지만, 매주 이 시간을 통해 우리는 <span className="color-primary-text">확실한 성장</span>을 경험하고 있어요.
            </p>

            <div className="activity-table">
                <table>
                    <thead>
                    <tr>
                        <th>시간</th>
                        <th>우리가 하는 일</th>
                        <th>왜 이 시간이 소중한지</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><strong>19:30 ~ 20:20</strong></td>
                        <td>
                            <span className="color-primary-text"><strong>이론/코드 리뷰</strong></span>
                            <br/>
                            <span className="activity-detail">선정된 리뷰어의 깊이 있는 주제/문제 발표</span>
                        </td>
                        <td>
                            서로의 <span className="highlight">통찰을 나누고</span><br/>
                            새로운 관점을 발견하는 시간
                        </td>
                    </tr>
                    <tr>
                        <td><strong>20:20 ~ 20:30</strong></td>
                        <td>
                            <span className="color-secondary-text"><strong>잠깐의 휴식 & 자유로운 네트워킹</strong></span>
                            <br/>
                            <span className="activity-detail">커피 한 잔과 함께하는 소소한 대화</span>
                        </td>
                        <td>
                            알고리즘을 넘어 <span className="highlight">진짜 이야기</span>를<br/>
                            나누며 관계를 쌓아가는 시간
                        </td>
                    </tr>
                    <tr>
                        <td><strong>20:30 ~ 21:30</strong></td>
                        <td>
                            <span className="color-primary-text"><strong>함께 문제 풀이</strong></span>
                            <br/>
                            <span className="activity-detail">실시간으로 머리를 맞대고 해결하는 문제들</span>
                        </td>
                        <td>
                            혼자라면 포기했을 문제도<br/>
                            <span className="highlight">함께라면 해낼 수 있다</span>는 경험
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>

            <div className="closing-message">
                <p>
                    단순한 스터디가 아닌, <span className="highlight">서로의 성장을 응원하는 따뜻한 커뮤니티</span>입니다.
                    <br/>
                    매주 이 시간이 기다려지는 이유, 함께라면 분명 느끼실 수 있을 거예요.
                </p>
            </div>
        </section>
    );
};