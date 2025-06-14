// src/pages/TecoTecoPage/sections/MembersSection.tsx
import React from 'react';
import { tecotecoMembers } from '../utils/constants';
import { handleImgError } from '../utils/helpers';
import { Contributor } from '../utils/types';
import './MembersSection.css';

const ContributorCard: React.FC<{ contributor: Contributor }> = ({ contributor }) => {
    const getMonthsSinceJoined = (joinDate: string | undefined): string => {
        if (!joinDate) return ""; // joinDate가 없으면 빈 문자열 반환

        const joined = new Date(joinDate);
        const today = new Date();
        const months = (today.getFullYear() - joined.getFullYear()) * 12 + today.getMonth() - joined.getMonth();
        return `함께한 지 ${months}개월`;
    };

    return (
        <div className="tecoteco-contributor-card">
            <a
                href={`https://github.com/${contributor.githubId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tecoteco-contributor-link"
            >
                <div className="tecoteco-profile-wrapper">
                    <img
                        src={contributor.imageUrl}
                        alt={`${contributor.name} 프로필`}
                        className="tecoteco-profile-img"
                        onError={handleImgError}
                    />
                </div>
                <span className="tecoteco-contributor-name">{contributor.name}</span>
                {/* 새로운 "함께한 기간" 정보 */}
                {contributor.joinDate && (
                    <span className="tecoteco-contributor-duration">{getMonthsSinceJoined(contributor.joinDate)}</span>
                )}
                {/* 기존 기여 문구 */}
                {contributor.tecotecoContribution && (
                    <span className="tecoteco-contributor-contribution">{contributor.tecotecoContribution}</span>
                )}
            </a>
        </div>
    );
};

export const MembersSection: React.FC = () => {
    return (
        <section className="tecoteco-members-section">
            <div className="section-tag-header">함께하는 멤버들이에요</div>
            <h2 className="section-title">더 멋진 여정이 펼쳐질 거예요, <br/> 함께라면. </h2>
            <div className="scrolling-members-wrapper">
                <div className="scrolling-members-inner">
                    <div className="tecoteco-contributors-list">
                        {tecotecoMembers.map((member, index) => (
                            <ContributorCard key={index} contributor={member}/>
                        ))}
                    </div>
                    <div className="tecoteco-contributors-list" aria-hidden="true">
                        {tecotecoMembers.map((member, index) => (
                            <ContributorCard key={index + tecotecoMembers.length} contributor={member}/>
                        ))}
                    </div>
                </div>
            </div>
            <p className="members-intro">
                서로의 성장을 돕는 열정적인 멤버들이 함께 만들어가고 있어요.
            </p>
        </section>
    );
};