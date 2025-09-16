// 북스터디 템플릿 데이터
// 책과 커피, 웃음과 통찰이 함께하는 독서 모임

import { StudyTemplate } from './algorithmTemplate';

export const bookStudyTemplate: StudyTemplate = {
  id: 'bookStudy',
  name: '북스터디 - 책 읽고 수다 떨고',
  sections: {
    hero: {
      title: '📚 <span style="color: #FFB86C;">책덕후들의</span> 수다모임',
      subtitle: '진지한 척하지만 사실 <span style="background: linear-gradient(90deg, #C3E88D, #82AAFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">책 수다가 제일 재밌는</span> 우리들',
      description: '혼자 읽으면 그저 활자, 함께 읽으면 우주가 됩니다. 매달 한 권, 깊이 읽고 맛있게 수다 떨며 서로의 관점으로 세상을 확장해요. 커피 한 잔의 여유와 함께!',
      buttonText: '책덕후 합류하기 📖',
      buttonLink: '#join-book-club',
      backgroundImage: '/images/books-bg.jpg',
      infoBox: {
        header: '우리만의 독서법',
        items: [
          { icon: '☕', text: '<strong>카페처럼 편안하게</strong><br/>딱딱한 독서토론? NO! 친구들과 카페에서 수다 떠는 것처럼 편하게 책 이야기를 나눠요.' },
          { icon: '🎭', text: '<strong>다양한 관점 환영</strong><br/>정답은 없어요. 당신의 해석이 곧 또 다른 이야기. 서로 다른 시선이 만나 더 풍성해집니다.' },
          { icon: '✨', text: '<strong>일상에 스며드는 지혜</strong><br/>책 속 한 줄이 삶의 나침반이 되는 순간. 독서가 일상을 바꾸는 마법을 경험해요.' }
        ]
      }
    },
    leaderIntro: {
      name: '책순이',
      profileImage: '/images/leader-book.jpg',
      role: '평생 책덕후',
      motivation: '혼자 읽던 책들이 외로웠어요. 같은 책을 읽고도 완전히 다른 감상을 가진 사람들을 만나면서, 책이 얼마나 다채로운 세계인지 깨달았죠. 이 즐거움을 더 많은 사람과 나누고 싶어요!',
      philosophy: '책은 거울이에요. 같은 책을 읽어도 각자가 비춰보는 것은 다르죠. 그 다름이 모여 더 큰 그림을 만들어요. 정답 찾기보다는 서로의 생각을 맛보는 시간이면 좋겠어요.',
      welcomeMessage: '책 읽기가 숙제가 아니라 놀이가 되는 곳! 부담 갖지 말고 와요. 못 읽고 와도 괜찮아요. 듣다 보면 읽고 싶어질 테니까요. 📚😊',
      expertise: ['장르불문', '느린독서', '딴길새기'],
      since: '2020년부터',
      totalStudies: 6,
      totalMembers: 127,
      email: 'bookworm@bookstudy.com',
      github: '',
      blog: 'https://bookworm-diary.blog'
    },
    richText: {
      title: '책과 사람, 그 사이의 화학작용',
      content: `
        <p>누군가는 말했죠. <span style="color: rgb(195, 232, 141); font-weight: 600;">"책은 읽는 게 아니라 경험하는 것"</span>이라고.</p>

        <p style="color: #888; font-style: italic;">한 달에 한 권, 부담스럽다고요? 걱정 마세요. 우리도 다 못 읽고 만나는 날이 많아요. 😅</p>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">📖 이런 분들을 찾아요</h3>
        <ul style="line-height: 2;">
          <li>책 읽고 싶은데 <span style="color: rgb(130, 170, 255); font-weight: 500;">혼자서는 작심삼일</span>인 분</li>
          <li>읽은 책 이야기할 <span style="color: rgb(130, 170, 255); font-weight: 500;">사람이 없어서 답답</span>한 분</li>
          <li>남들은 <span style="color: rgb(130, 170, 255); font-weight: 500;">어떻게 읽었나 궁금</span>한 분</li>
          <li>베스트셀러 말고 <span style="color: rgb(195, 232, 141); font-weight: 600;">진짜 좋은 책 찾는 분</span></li>
          <li><span style="color: rgb(195, 232, 141); font-weight: 600;">커피와 책, 그리고 수다</span>를 사랑하는 분</li>
        </ul>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">☕ 우리의 독서 스타일</h3>
        <p><span style="color: rgb(130, 170, 255); font-weight: 500;">천천히, 깊게, 맛있게.</span> 속독? 다독? 그런 거 몰라요. 한 권을 <span style="color: rgb(195, 232, 141); font-weight: 600;">제대로 씹고 뜯고 맛보고 즐기는 게</span> 우리 스타일!</p>

        <blockquote style="background: linear-gradient(135deg, rgba(255, 184, 108, 0.1), rgba(130, 170, 255, 0.1)); padding: 20px; border-radius: 8px; border-left: 4px solid #FFB86C; margin: 30px 0;">
          <p style="font-size: 16px; font-style: italic;">"처음엔 책 한 권 읽는 게 부담이었는데, 이제는 한 달이 너무 짧아요. 다음 모임이 기다려지는 마법!"</p>
          <footer style="text-align: right; color: #888; font-size: 14px;">- 3개월차 북덕후</footer>
        </blockquote>

        <div style="text-align: center; margin-top: 40px;">
          <p style="font-size: 20px;">📚 + ☕ + 😊 = 🚀</p>
          <p style="color: rgb(195, 232, 141); font-weight: bold;">책과 커피와 웃음이 만나면, 생각이 날아오릅니다!</p>
        </div>
      `,
      alignment: 'left',
      backgroundColor: '#0a0a0a'
    },
    members: {
      tagHeader: '함께 읽는 책친구들',
      title: '현재 <span style="color: #FFB86C;">12명</span>의 책덕후가 <span style="color: #82AAFF;">매달 마지막 주 토요일</span> 오후에 모여요',
      subtitle: '직업도, 나이도, 취향도 다르지만 책 앞에선 모두가 친구',
      layout: 'grid',
      studyType: 'reading',
      showStats: true,
      weeklyMvp: '이번 달 베스트 리더: 책순이',
      members: [
        {
          userId: 'user-1',
          name: '커피홀릭',
          role: '카페인과 활자 중독자',
          imageUrl: '/images/member1.jpg',
          joinDate: '2024-01',
          tagline: '커피 없인 못 읽어요',
          isActive: true,
          badges: [{ type: 'mvp', label: '이달의 독서왕', icon: '👑' }],
          customFields: [
            { label: '최애 장르', value: '미스터리 스릴러', icon: '🔍' },
            { label: '올해 목표', value: '24권 완독', icon: '🎯' },
            { label: '지금 읽는 책', value: '프로젝트 헤일메리', icon: '📖' }
          ]
        },
        {
          userId: 'user-2',
          name: '느린달팽이',
          role: '천천히 음미하는 독서가',
          imageUrl: '/images/member2.jpg',
          joinDate: '2024-03',
          tagline: '한 문장도 놓치지 않아요',
          isActive: true,
          customFields: [
            { label: '최애 장르', value: '인문학', icon: '🧠' },
            { label: '독서 스타일', value: '밑줄 긋기 마니아', icon: '✏️' },
            { label: '인생 책', value: '사피엔스', icon: '⭐' }
          ]
        },
        {
          userId: 'user-3',
          name: '판타지덕후',
          role: '이세계 전문 탐험가',
          imageUrl: '/images/member3.jpg',
          joinDate: '2024-02',
          tagline: '현실은 시시해',
          isActive: true,
          customFields: [
            { label: '최애 장르', value: 'SF/판타지', icon: '🪐' },
            { label: '독서 장소', value: '침대', icon: '🛏️' },
            { label: '추천 작가', value: '브랜든 샌더슨', icon: '✨' }
          ]
        }
      ],
      stats: {
        totalMembers: 12,
        activeMembers: 10,
        totalHours: 240,
        totalProblems: 0,
        participationRate: 85,
        popularAlgorithms: [],
        customStats: [
          { label: '읽은 책', value: '48권', icon: '📚' },
          { label: '최다 장르', value: '소설', icon: '📖' },
          { label: '평균 독서량', value: '월 2권', icon: '📊' }
        ]
      }
    },
    faq: {
      title: '궁금한 게 있나요?',
      tagHeader: '자주 묻는 질문',
      showIcons: true,
      showJoinCTA: true,
      joinTitle: '더 궁금한 게 있다면?',
      joinDescription: '편하게 연락주세요. 커피챗도 환영!',
      joinButtonText: '리더에게 문의하기 ☕',
      kakaoOpenChatUrl: 'https://open.kakao.com/bookclub',
      items: [
        {
          question: '책을 다 못 읽고 가도 되나요?',
          answer: '당연하죠! 절반만 읽어도, 아니 첫 장만 읽어도 괜찮아요. 오히려 "왜 못 읽었는지" 이야기하다 보면 책의 새로운 면을 발견하기도 해요. 부담 제로!',
          category: '참여 방법'
        },
        {
          question: '어떤 책을 읽나요?',
          answer: '매달 투표로 정해요! 소설, 에세이, 인문학, 자기계발... 장르 안 가려요. 베스트셀러도 좋고, 숨은 명작도 좋아요. 최근엔 SF소설 → 심리학 → 에세이 순으로 읽었네요.',
          category: '도서 선정'
        },
        {
          question: '온라인으로도 참여 가능한가요?',
          answer: '네! 오프라인 모임이 기본이지만, 지방이나 해외에 계신 분들은 줌으로 참여해요. 화면 너머로도 충분히 수다 떨 수 있어요! 🖥️',
          category: '참여 방식'
        },
        {
          question: '독서 속도가 느려도 괜찮나요?',
          answer: '우리 모토가 "천천히, 깊게, 맛있게"예요. 속독은 오히려 비추! 한 문장이라도 제대로 읽는 게 백 권 대충 읽는 것보다 나아요.',
          category: '독서 스타일'
        },
        {
          question: '모임 분위기는 어떤가요?',
          answer: '한 마디로 "북카페 수다방"이에요. 진지한 토론보다는 편한 대화, 틀린 답 없는 자유로운 해석, 그리고 책 얘기하다가 인생 얘기로 샐 때가 제일 재밌어요! ☕📚',
          category: '분위기'
        },
        {
          question: '회비가 있나요?',
          answer: '월 5,000원이에요. 전액 간식비로 사용! 모임 때마다 커피와 간식을 준비해요. 책값은 각자 부담이지만, 도서관 애용하시는 분들 많아요! 💰',
          category: '비용'
        }
      ]
    },
    review: {
      enabled: true,
      tagHeader: '진짜 후기',
      title: '<span style="color: #FFB86C;">책친구들</span>의 솔직 토크',
      subtitle: '책 읽기가 이렇게 재밌을 줄이야!',
      showKeywords: true,
      keywords: ['재미있어요', '편안해요', '인사이트', '따뜻한분위기', '꾸준함'],
      displayCount: 3,
      sortBy: 'latest',
      showStats: true,
      reviews: [
        {
          id: 'review-1',
          userId: 'user-1',
          userName: '김독서',
          rating: 5,
          title: '책 읽기가 놀이가 된 곳',
          content: '학창시절 이후로 책과 담쌓고 살았는데, 여기 와서 다시 책의 재미를 찾았어요. 무엇보다 "다 읽어야 한다"는 부담이 없어서 좋아요. 못 읽고 가면 듣는 재미도 쏠쏠!',
          createdAt: '2024-11-20',
          attendCount: 6,
          helpfulCount: 18,
          tags: [
            { id: 'tag-1', category: 'ATMOSPHERE', label: '부담없어요', emoji: '😌', description: '부담없어요' },
            { id: 'tag-2', category: 'CONTENT', label: '재미있어요', emoji: '😄', description: '재미있어요' }
          ],
          timeAgo: '1주일 전'
        },
        {
          id: 'review-2',
          userId: 'user-2',
          userName: '박페이지',
          rating: 5,
          title: '혼자 읽기 vs 함께 읽기, 차원이 달라요',
          content: '같은 책을 읽고도 이렇게 다른 해석이 나올 수 있구나 싶어서 매번 놀라요. 내가 놓친 부분을 다른 사람이 짚어주고, 내 해석이 누군가에겐 새로운 시각이 되고. 이게 진짜 독서구나 싶어요!',
          createdAt: '2024-11-15',
          attendCount: 4,
          helpfulCount: 14,
          tags: [
            { id: 'tag-3', category: 'ATMOSPHERE', label: '다양한관점', emoji: '👁️', description: '다양한관점' },
            { id: 'tag-4', category: 'OUTCOME', label: '시야확장', emoji: '🌏', description: '시야확장' }
          ],
          timeAgo: '2주일 전'
        },
        {
          id: 'review-3',
          userId: 'user-3',
          userName: '이북러버',
          rating: 4,
          title: '카페보다 편한 우리들의 아지트',
          content: '토요일 오후의 소확행! 커피 마시며 책 얘기하다가 인생 얘기, 연애 얘기까지ㅋㅋ 책이 매개체일 뿐, 사실 좋은 사람들 만나는 게 제일 좋아요. 가끔 책 안 읽고 가는데도 환영해주는 따뜻함!',
          createdAt: '2024-11-10',
          attendCount: 8,
          helpfulCount: 22,
          tags: [
            { id: 'tag-5', category: 'ATMOSPHERE', label: '따뜻해요', emoji: '🤗', description: '따뜻해요' },
            { id: 'tag-6', category: 'ATMOSPHERE', label: '편안해요', emoji: '☕', description: '편안해요' }
          ],
          timeAgo: '3주일 전'
        }
      ]
    },
    howWeRoll: {
      title: '<span style="color: #FFB86C;">책 한 권</span>이 만드는 <span style="color: #82AAFF;">특별한 토요일</span>',
      subtitle: '우리만의 독서 리추얼',
      tagHeader: '이렇게 모여요',
      scheduleIntro: '매달 마지막 주 토요일, 우리의 특별한 시간',
      subHeading: '📅 4주간의 여정',
      closingMessage: '책 읽기가 부담이 아닌 <strong>기다려지는 일상</strong>이 되는 마법, 함께 경험해요! 📚✨',
      meetingOverview: [
        {
          icon: '📖',
          title: '도서 선정',
          highlight: '매달 첫째 주',
          description: '다음 달 책 투표',
          type: 'primary'
        },
        {
          icon: '📚',
          title: '독서 기간',
          highlight: '3주간',
          description: '각자의 속도로',
          type: 'secondary'
        },
        {
          icon: '☕',
          title: '모임 시간',
          highlight: '토요일 오후 2-5시',
          description: '강남 스터디카페',
          type: 'primary'
        },
        {
          icon: '💬',
          title: '토론 스타일',
          highlight: '자유로운 수다',
          description: '정답 없는 대화',
          type: 'secondary'
        }
      ],
      schedule: [
        {
          time: '1주차',
          activity: '📚 책 선정 & 킥오프',
          detail: '지난 달 책 마무리 토론 + 새 책 투표 + 첫 인상 나누기',
          type: 'primary'
        },
        {
          time: '2-3주차',
          activity: '📖 자유 독서 기간',
          detail: '각자의 속도로 읽으며 슬랙에서 인상깊은 구절 공유',
          type: 'secondary'
        },
        {
          time: '4주차',
          activity: '☕ 메인 모임',
          detail: '본격 책수다! 커피와 간식과 함께하는 3시간',
          type: 'primary'
        }
      ]
    },
    journey: {
      tagHeader: '우리가 함께 읽은 책들',
      title: '<span style="color: #FFB86C;">48권</span>의 책으로 쌓아올린 우리의 서재',
      subtitle: '한 권 한 권이 모여 만든 지적 여정',
      closingMessage: '다음 장을 함께 넘길 <strong>당신</strong>을 기다려요 📖',
      startDate: '2024-01-01',
      calculateDays: true,
      layout: 'timeline',
      showAchievements: true,
      showIcons: true,
      showStats: true,
      generations: [
        {
          title: '시즌 1: 고전 다시 읽기',
          description: '학창시절 억지로 읽었던 고전을 성인의 눈으로 다시. 데미안, 위대한 개츠비, 1984를 함께 읽었습니다.',
          icon: '📚',
          achievements: [
            '🏆 3개월 개근상 3명',
            '📝 독후감 모음집 제작',
            '☕ 북카페 정모 3회'
          ],
          status: 'completed'
        },
        {
          title: '시즌 2: 세계문학 여행',
          description: '각 나라의 대표 작품으로 떠나는 문학 세계여행. 백년 동안의 고독, 미들마치, 설국 등을 함께 읽었습니다.',
          icon: '🌍',
          achievements: [
            '🌍 6개국 작품 독파',
            '🎉 번외 영화모임 2회',
            '👥 신규 멤버 4명'
          ],
          status: 'completed'
        },
        {
          title: '시즌 3: 뇌과학과 심리학',
          description: '마음과 뇌를 탐구하는 과학적 독서. 생각에 관한 생각, 뇌는 어떻게 세상을 보는가 등을 함께 읽었습니다.',
          icon: '🧠',
          achievements: [
            '🧠 전문가 초청 강연',
            '📊 독서 통계 분석',
            '💡 인사이트 노트 공유'
          ],
          status: 'completed'
        },
        {
          title: '시즌 4: SF와 미래',
          description: '상상력의 한계를 시험하는 SF 대장정. 프로젝트 헤일메리, 파운데이션, 뉴로맨서를 함께 읽고 있습니다.',
          icon: '🚀',
          achievements: [
            '🚀 진행중',
            '🌌 SF 영화 동시상영'
          ],
          status: 'ongoing'
        }
      ]
    },
    experience: {
      tagHeader: '토요일 오후의 마법',
      title: '책 한 권이 <span style="color: #FFB86C;">특별한 경험</span>이 되는 과정',
      subtitle: '2시부터 5시까지, <span style="background: linear-gradient(90deg, #C3E88D, #82AAFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">우리만의 리추얼</span>',
      highlightText: '우리만의 리추얼',
      layout: 'vertical',
      enableAnimation: true,
      animationType: 'slideUp',
      defaultActiveStep: 0,
      navigationStyle: 'dots',
      mobileCollapse: true,
      steps: [
        {
          label: 'Step 1',
          title: '☕ 2:00 PM - 웰컴 커피타임',
          description: '각자 좋아하는 음료 주문하고 근황 토크. "책 다 읽었어?" 대신 "요즘 어때?"로 시작하는 편안함. 못 읽고 온 사람 손들면 박수 쳐주기!',
          illustrationType: 'custom'
        },
        {
          label: 'Step 2',
          title: '📖 2:30 PM - 첫인상 릴레이',
          description: '한 문장으로 책 소감 돌아가며 말하기. "재밌었어요", "어려웠어요"도 OK! 이 시간에 나오는 한 마디가 의외로 토론의 씨앗이 되곤 해요.',
          illustrationType: 'custom'
        },
        {
          label: 'Step 3',
          title: '💬 3:00 PM - 본격 수다 타임',
          description: '파트별로 자유롭게 이야기. 궁금했던 것, 이해 안 됐던 것, 인상 깊었던 것, 짜증났던 것(?)까지! 가끔 저자 욕하다가 칭찬하기도. 😅',
          illustrationType: 'custom'
        },
        {
          label: 'Step 4',
          title: '✨ 4:00 PM - 인사이트 쉐어링',
          description: '책에서 얻은 인사이트나 일상 적용 아이디어 공유. "이 부분 읽고 회사에서 이렇게 해봤어요" 같은 경험담이 제일 인기!',
          illustrationType: 'custom'
        },
        {
          label: 'Step 5',
          title: '📚 4:30 PM - 다음 책 미리보기',
          description: '다음 달 책 소개와 읽기 팁 공유. 어려운 책이면 읽기 가이드 제공. 그리고 뒷풀이 갈 사람 모집! (뒷풀이가 진짜 하이라이트)',
          illustrationType: 'custom'
        }
      ]
    }
  }
};