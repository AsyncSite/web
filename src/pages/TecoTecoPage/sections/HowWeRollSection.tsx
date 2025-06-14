// src/pages/TecoTecoPage/sections/HowWeRollSection.tsx
import React from 'react';
import { HOW_WE_ROLL_DATA } from '../utils/constants';
import './HowWeRollSection.css';

export const HowWeRollSection: React.FC = () => {
    return (
        <section className="tecoteco-how-we-roll-section">
            <div className="section-tag-header">모임 상세 안내</div>

            <h2 className="section-title">특별한 건 없어요. <br/>  <span className="highlight">그냥 계속</span> 모일 뿐이에요.</h2>

            <div className="meeting-overview">
                {HOW_WE_ROLL_DATA.meetingOverview.map((item, index) => (
                    <div key={index} className={`overview-card ${item.type}`}>
                        <div className="card-icon">{item.icon}</div>
                        <div className="card-content">
                            <h3>{item.title}</h3>
                            {item.link ? (
                                <p>
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        <span className="highlight">{item.highlight}</span>
                                    </a>
                                </p>
                            ) : (
                                <p><span className="highlight">{item.highlight}</span></p>
                            )}
                            {item.description && (
                                <p>
                                    {item.description.split(' ').map((word, i) =>
                                        word === '오프라인' || word === '중심으로' ? (
                                            <span key={i} className="color-primary-text">{word} </span>
                                        ) : word === '백준,' || word === '프로그래머스를' ? (
                                            <span key={i} className="color-secondary-text">{word} </span>
                                        ) : (
                                            word + ' '
                                        )
                                    )}
                                </p>
                            )}
                            {item.subNote && (
                                <p className="sub-note">{item.subNote}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="intro-sub-heading">몰입, 해본 적 있으세요?</h3>
            <p className="schedule-intro">
                {HOW_WE_ROLL_DATA.scheduleIntro}
            </p>

            <div className="activity-table">
                <table>
                    <thead>
                    <tr>
                        <th>시간</th>
                        <th>무엇을</th>
                        {/*<th>어떻게</th>*/}
                    </tr>
                    </thead>
                    <tbody>
                    {HOW_WE_ROLL_DATA.schedule.map((item, index) => (
                        <tr key={index}>
                            <td><strong>{item.time}</strong></td>
                            <td>
                                    <span className={item.type === 'primary' ? 'color-primary-text' : 'color-secondary-text'}>
                                        <strong>{item.activity}</strong>
                                    </span>
                                <br/>
                                <span className="activity-detail">{item.detail}</span>
                            </td>
                            {/*<td>*/}
                            {/*    {item.value.split(' ').map((word, i) => {*/}
                            {/*        const highlightWords = ['통찰을', '나누고', '진짜', '이야기', '함께라면', '해낼', '수', '있다'];*/}
                            {/*        return highlightWords.some(hw => word.includes(hw)) ? (*/}
                            {/*            <span key={i} className="highlight">{word} </span>*/}
                            {/*        ) : (*/}
                            {/*            word + ' '*/}
                            {/*        );*/}
                            {/*    })}*/}
                            {/*</td>*/}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/*<div className="closing-message">*/}
            {/*    <p>*/}
            {/*        {HOW_WE_ROLL_DATA.closingMessage.split(' ').map((word, i) => {*/}
            {/*            const highlightPhrase = '서로의 성장을 응원하는 따뜻한 커뮤니티';*/}
            {/*            if (word === '단순한' && HOW_WE_ROLL_DATA.closingMessage.includes(highlightPhrase)) {*/}
            {/*                const parts = HOW_WE_ROLL_DATA.closingMessage.split(highlightPhrase);*/}
            {/*                return (*/}
            {/*                    <span key={i}>*/}
            {/*                        {parts[0]}*/}
            {/*                        <span className="highlight">{highlightPhrase}</span>*/}
            {/*                        {parts[1]}*/}
            {/*                    </span>*/}
            {/*                );*/}
            {/*            }*/}
            {/*            return null;*/}
            {/*        }).filter(Boolean)[0] || HOW_WE_ROLL_DATA.closingMessage}*/}
            {/*    </p>*/}
            {/*</div>*/}
        </section>
    );
};