// src/sections/Contribution/Contribution.tsx
import React from 'react';
import './Contribution.css';

interface ContributionUser {
    gitUserId: string;
    gitName: string;
    userName: string;
}

/**
 * Contribution user정보
 */
const contributionUsers: ContributionUser[] = [
        {
            gitUserId: '115696395',
            gitName: 'renechoi',
            userName: ''
        },
        {
            gitUserId: '90545043',
            gitName: 'kdelay',
            userName: ''
        },
        {
            gitUserId: '150509394',
            gitName: 'vvoohhee',
            userName: ''
        },
        {
            gitUserId: '138358867',
            gitName: 'KrongDev',
            userName: ''
        },
    ]

const Contribution: React.FC = () => {
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const bg = getRandomColor();
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">
                <circle cx="32" cy="32" r="32" fill="${bg}"/>
                <text x="32" y="42" font-size="32" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif">?</text>
            </svg>
        `;
        e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
        e.currentTarget.alt = '프로필 이미지 없음';
    };


    const renderUserIcon = (user: ContributionUser) => {
        return (
            <div className="contributor-card">
                <a
                    href={`https://github.com/${user.gitName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contributor-link"
                >
                    <div className="profile-wrapper">
                        <img
                            src={`https://avatars.githubusercontent.com/u/${user.gitUserId}?v=4`}
                            alt={`${user.gitName} 프로필`}
                            className="profile-img"
                            onError={handleImgError}
                        />
                    </div>
                    <span className="contributor-name">{user.gitName}</span>
                </a>
            </div>
        )
    }

    return (
        <section className="contribution-page">
            <div className="divider"/>

            <div className="contribution-container">
                <span className="contribution-label">Contributed by</span>
                <div className="contributors-list">
                    {
                        contributionUsers.map(renderUserIcon)
                    }

                    {/* who's next? 카드 */}
                    <div className="contributor-card">
                        <a
                            href="https://github.com/your-next-profile"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link"
                        >
                            <div className="profile-wrapper">
                                <img
                                    src={process.env.PUBLIC_URL + '/images/face/another.png'}
                                    alt="another 프로필"
                                    className="profile-img"
                                    onError={handleImgError}
                                />
                            </div>
                            <span className="contributor-name">who's next?</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contribution;
