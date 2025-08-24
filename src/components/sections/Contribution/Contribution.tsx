// src/sections/Contribution/Contribution.tsx
import React from 'react';
import styles from './Contribution.module.css';

interface Member {
  id: string;
  name: string;
  githubId: string;
}

/**
 * AsyncSite 멤버 정보
 */
const members: Member[] = [
  {
    id: 'chadongmin',
    name: 'Dongmin Cha',
    githubId: 'chadongmin'
  },
  {
    id: 'jo94kr',
    name: 'Jo Jin Woo',
    githubId: 'jo94kr'
  },
  {
    id: 'kdelay',
    name: '김지연',
    githubId: 'kdelay'
  },
  {
    id: 'KrongDev',
    name: 'KrongDev',
    githubId: 'KrongDev'
  },
  {
    id: 'mihioon',
    name: 'mihioon',
    githubId: 'mihioon'
  },
  {
    id: 'renechoi',
    name: 'renechoi',
    githubId: 'renechoi'
  }
];

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
    <section className={`${styles.membersSection} section-background`}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Our Members</h2>
          <p className={styles.sectionSubtitle}>함께 성장하는 AsyncSite 멤버들</p>
        </div>

        <div className={styles.membersSlider}>
          <div className={styles.membersTrack}>
            {/* 연속 표시를 위해 3번 반복 */}
            {Array.from({ length: 3 }).map((_, setIndex) =>
              members.map((member) => (
                <a
                  key={`${member.id}-${setIndex}`}
                  href={`https://github.com/${member.githubId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.memberItem}
                  title={`${member.name} (@${member.githubId})`}
                >
                  <img
                    src={`https://github.com/${member.githubId}.png?size=120`}
                    alt={`${member.name} 프로필`}
                    className={styles.memberAvatar}
                    onError={handleImgError}
                  />
                </a>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contribution;
