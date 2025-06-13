// src/pages/TecoTecoPage/sections/HowWeRollSection.tsx
import React from 'react';
import './HowWeRollSection.css';

export const HowWeRollSection: React.FC = () => {
    return (
        <section className="tecoteco-how-we-roll-section">
            <h2 className="section-title">🗓️ 당신과 TecoTeco의 하루</h2>
            <p className="section-subtitle">
                매주 금요일 저녁, 우리는 이렇게 <span className="highlight">특별한 시간</span>을 함께합니다.
            </p>
            <div className="operation-details">
                <p><strong>정기 모임:</strong> 매주 금요일 저녁 7:30 ~ 9:30, 강남역 인근 스터디룸 (온/오프라인 병행)</p>
                <p><strong>주요 교재:</strong> <a href="https://product.kyobobook.co.kr/detail/S000212576322" target="_blank" rel="noopener noreferrer">코딩 테스트 합격자 되기: 자바 편 (골드래빗)</a> 외 다양한 온라인 저지 활용</p>
                <p><strong>스터디 비용:</strong> 스터디룸 대관료 N/1 정산. <span className="highlight">별도 회비 없음.</span></p>
            </div>

            <h3 className="subsection-title">함께 성장하는 <span className="highlight">모임 흐름</span></h3>
            <div className="activity-table">
                <table>
                    <thead>
                    <tr>
                        <th>시간</th>
                        <th>활동 내용</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td><strong>19:30 ~ 20:20</strong></td>
                        <td><strong>이론/코드 리뷰</strong> (선정된 리뷰어가 깊이 있는 주제/문제 발표)</td>
                    </tr>
                    <tr>
                        <td><strong>20:20 ~ 20:30</strong></td>
                        <td><strong>잠깐의 휴식 & 자유로운 네트워킹</strong></td>
                    </tr>
                    <tr>
                        <td><strong>20:30 ~ 21:30</strong></td>
                        <td><strong>함께 문제 풀이</strong> (실시간으로 머리를 맞대고 문제 해결)</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
};