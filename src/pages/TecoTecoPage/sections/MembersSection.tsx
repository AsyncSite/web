// src/pages/TecoTecoPage/sections/MembersSection.tsx
import React from 'react';
import { tecotecoMembers } from '../utils/constants';
import { handleImgError } from '../utils/helpers';
import { Contributor } from '../utils/types';
import './MembersSection.css';

const ContributorCard: React.FC<{ contributor: Contributor }> = ({ contributor }) => (
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
        </a>
    </div>
);

export const MembersSection: React.FC = () => {
    return (
        <section className="tecoteco-members-section">
            <h2 className="section-title">👨‍👩‍👧‍👦 함께 만들어가는 TecoTeco</h2>
            <p className="members-intro">
                TecoTeco는 <span className="highlight">서로의 성장을 돕는 열정적인 멤버들</span>이 함께 만들어갑니다.
            </p>
            <div className="tecoteco-contributors-list">
                {tecotecoMembers.map((member, index) => (
                    <ContributorCard key={index} contributor={member} />
                ))}
            </div>
        </section>
    );
};