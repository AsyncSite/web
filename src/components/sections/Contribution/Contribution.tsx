// src/sections/Contribution/Contribution.tsx
import React from 'react';
import './Contribution.css';

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

    return (
        <section className="contribution-page">
            <div className="divider" />

            <div className="contribution-container">
                <span className="contribution-label">Contributed by</span>
                <div className="contributors-list">
                    {/* renechoi 카드 */}
                    <div className="contributor-card">
                        <a
                            href="https://github.com/renechoi"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link"
                        >
                            <div className="profile-wrapper">
                                <img
                                    src={process.env.PUBLIC_URL + '/images/face/rene.png'}
                                    alt="renechoi 프로필"
                                    className="profile-img"
                                    onError={handleImgError}
                                />
                            </div>
                            <span className="contributor-name">renechoi</span>
                        </a>
                    </div>

                    {/* kdelay 카드 */}
                    <div className="contributor-card">
                        <a
                            href="https://github.com/kdelay"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link"
                        >
                            <div className="profile-wrapper">
                                <img
                                    src={process.env.PUBLIC_URL + '/images/face/kdelay.png'}
                                    alt="kdelay 프로필"
                                    className="profile-img"
                                    onError={handleImgError}
                                />
                            </div>
                            <span className="contributor-name">kdelay</span>
                        </a>
                    </div>

                    <div className="contributor-card">
                        <a
                            href="https://github.com/vvoohhee"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link"
                        >
                            <div className="profile-wrapper">
                                <img
                                    src={process.env.PUBLIC_URL + '/images/face/vvoohhee.png'}
                                    alt="vvoohhee 프로필"
                                    className="profile-img"
                                    onError={handleImgError}
                                />
                            </div>
                            <span className="contributor-name">vvoohhee</span>
                        </a>
                    </div>

                    <div className="contributor-card">
                        <a
                            href="https://github.com/KrongDev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="contributor-link"
                        >
                            <div className="profile-wrapper">
                                <img
                                    src={process.env.PUBLIC_URL + '/images/face/KrongDev.png'}
                                    alt="KrongDev 프로필"
                                    className="profile-img"
                                    onError={handleImgError}
                                />
                            </div>
                            <span className="contributor-name">KrongDev</span>
                        </a>
                    </div>

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
