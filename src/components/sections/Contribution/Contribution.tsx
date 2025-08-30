// src/sections/Contribution/Contribution.tsx
import React, { useState, useEffect } from 'react';
import styles from './Contribution.module.css';
import userService from '../../../api/userService';
import publicApiClient from '../../../api/publicClient';

interface Member {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  githubUrl?: string;
}

const Contribution: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await publicApiClient.get('/api/public/users', { params: { size: 50 } });
        const data = response.data;
        
        if (data.content && data.content.length > 0) {
          const transformedMembers = data.content
            .map((user: any) => ({
              id: user.email,
              name: user.name,
              email: user.email,
              profileImage: user.profileImage,
              githubUrl: user.githubUrl
            }))
            .filter((user: Member) => {
              // profileImage가 실제로 유효한 값인지 체크
              const hasValidProfileImage = user.profileImage && 
                                          user.profileImage !== '' && 
                                          user.profileImage !== 'null' &&
                                          user.profileImage !== null;
              const hasValidGithubUrl = user.githubUrl && 
                                       user.githubUrl !== '' && 
                                       user.githubUrl !== 'null' &&
                                       user.githubUrl !== null;
              return hasValidProfileImage || hasValidGithubUrl;
            });
          
          setMembers(transformedMembers);
        } else {
          setMembers([]);
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
        setError('멤버 정보를 불러오는데 실패했습니다.');
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 이미지 로드 실패 시 해당 요소의 부모를 숨김
    const parentElement = e.currentTarget.parentElement;
    if (parentElement) {
      parentElement.style.display = 'none';
    }
  };



  // 로딩 중이거나 멤버가 없을 때는 섹션을 렌더링하지 않음
  if (isLoading || members.length === 0) {
    return null;
  }

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
              members.map((member) => {
                // 프로필 이미지가 있는 경우에만 렌더링
                if (!member.profileImage) return null;
                
                return (
                  <div
                    key={`${member.id}-${setIndex}`}
                    className={styles.memberItem}
                    title={member.name}
                  >
                    <img
                      src={member.profileImage}
                      alt={`${member.name} 프로필`}
                      className={styles.memberAvatar}
                      onError={handleImgError}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contribution;
