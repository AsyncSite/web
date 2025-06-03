// src/sections/Contribution/Contribution.tsx
import React from 'react';
import './Contribution.css';

const Contribution: React.FC = () => {
    // 랜덤 색상을 생성하는 헬퍼 함수
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // onError 시마다 호출되어, 랜덤 배경색의 SVG로 교체해주는 핸들러
    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const bg = getRandomColor();
        // 연보라 대신 bg를 사용한 SVG 문자열
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
                    <div className="contributor-card">
                        <div className="profile-wrapper">
                            <img
                                src={process.env.PUBLIC_URL + '/images/face/rene.png'}
                                alt="renechoi 프로필"
                                className="profile-img"
                                onError={handleImgError}
                            />
                        </div>
                        <span className="contributor-name">renechoi</span>
                    </div>

                    <div className="contributor-card">
                        <div className="profile-wrapper">
                            <img
                                src={process.env.PUBLIC_URL + '/images/face/kdelay.png'}
                                alt="kdelay 프로필"
                                className="profile-img"
                                onError={handleImgError}
                            />
                        </div>
                        <span className="contributor-name">kdelay</span>
                    </div>

                    <div className="contributor-card">
                        <div className="profile-wrapper">
                            <img
                                src={process.env.PUBLIC_URL + '/images/face/vvoohhee.png'}
                                alt="vvoohhee 프로필"
                                className="profile-img"
                                onError={handleImgError}
                            />
                        </div>
                        <span className="contributor-name">vvoohhee</span>
                    </div>

                    <div className="contributor-card">
                        <div className="profile-wrapper">
                            <img
                                src={process.env.PUBLIC_URL + '/images/face/another.png'}
                                alt="another 프로필"
                                className="profile-img"
                                onError={handleImgError}
                            />
                        </div>
                        <span className="contributor-name">who's next?</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contribution;
