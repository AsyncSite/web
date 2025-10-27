// 터닝페이지 회고 모임 템플릿 데이터
// 6개월마다 모여 과거를 돌아보고 미래를 그리는 회고 모임

import { StudyTemplate } from './algorithmTemplate';

export const turningPageTemplate: StudyTemplate = {
  id: 'turningPage',
  name: '터닝페이지 - 또 하나의 페이지를 함께 넘기다',
  sections: {
    hero: {
      title: '📖 또 하나의 <span style="color: #FFB86C;">페이지</span>를 함께 넘기다',
      subtitle: '6개월의 여정을 돌아보고, 새로운 <span style="background: linear-gradient(90deg, #C3E88D, #82AAFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">챕터를 여는 시간</span>',
      description: '삶의 점들을 연결하며 의미를 발견하는 특별한 시간. 진지하지만 따뜻하고, 깊이 있지만 편안한 회고 모임입니다. 혼자가 아닌 함께, 과거를 돌아보고 미래를 그려요.',
      buttonText: '회고 모임 참가하기 ✨',
      buttonLink: '#apply',
      backgroundImage: '/images/turning-page-bg.jpg',
      infoBox: {
        header: '우리가 만드는 가치',
        items: [
          {
            icon: '🔍',
            text: '<strong>회고의 힘</strong><br/>바쁜 일상에서 잊고 지나친 나의 성장을 재발견해요. 올해의 로그를 돌아보며 어제보다 나은 내일을 설계합니다.'
          },
          {
            icon: '🔗',
            text: '<strong>연결의 마법</strong><br/>스티브 잡스의 Connecting the Dots처럼, 삶의 경험들이 어떻게 연결되는지 발견해요. 서로의 이야기에서 영감을 얻습니다.'
          },
          {
            icon: '🧭',
            text: '<strong>성장의 나침반</strong><br/>계획대로 안 될 수 있지만, 계획을 세우는 과정이 중요해요. 내년의 키워드와 목표를 함께 그려갑니다.'
          }
        ]
      }
    },
    leaderIntro: {
      name: '북마크',
      profileImage: '/images/leader-bookmark.jpg',
      role: '모임 기획자',
      motivation: '혼자 회고하다 보면 객관적이지 못하고, 의미를 찾기 어려웠어요. 함께 나누면 내가 놓친 성장을 발견하고, 서로에게 영감을 주고받을 수 있다고 믿었습니다.',
      philosophy: '삶과 커리어가 계획대로 흘러가지 않지만, 서로의 경험에서 배우며 성장할 수 있어요. "계획 자체보다 계획을 세우는 과정이 중요하다"는 믿음으로 이 모임을 만들었습니다.',
      welcomeMessage: '완벽한 회고를 준비하지 않아도 괜찮아요. 솔직한 이야기, 그게 전부예요. 함께 나누다 보면 생각지 못한 인사이트를 얻게 될 거예요. 편하게 와서 당신의 이야기를 들려주세요! 📚',
      expertise: ['회고', '성장', '공감'],
      since: '2024년 상반기부터',
      totalStudies: 3,
      totalMembers: 36,
      email: 'bookmark@turningpage.com',
      github: '',
      blog: 'https://reflecting-journey.blog'
    },
    richText: {
      title: 'Connecting the Dots - 점들을 연결하다',
      content: `
        <p><span style="color: rgb(255, 184, 108); font-weight: 600;">"삶의 경험들은 점과 같아서 미리 예측하거나 계획해서 연결할 수는 없지만, 과거를 되돌아보면 그것들이 어떻게 연결되었는지 깨닫게 된다."</span></p>

        <p style="color: #888; font-style: italic; margin-top: 20px;">- 스티브 잡스, 2005년 스탠퍼드 대학교 졸업 연설</p>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">🎯 이런 분들을 기다려요</h3>
        <ul style="line-height: 2;">
          <li>한 해를 <span style="color: rgb(130, 170, 255); font-weight: 500;">의미 있게 마무리</span>하고 싶은 분</li>
          <li>나의 성장을 <span style="color: rgb(130, 170, 255); font-weight: 500;">객관적으로 돌아보고 싶은 분</span></li>
          <li>내년의 <span style="color: rgb(195, 232, 141); font-weight: 600;">방향성을 함께 찾고 싶은 분</span></li>
          <li>비슷한 고민을 하는 <span style="color: rgb(195, 232, 141); font-weight: 600;">동료가 필요한 분</span></li>
          <li><span style="color: rgb(255, 184, 108); font-weight: 600;">따뜻한 응원과 공감</span>을 나누고 싶은 분</li>
        </ul>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">💭 우리의 회고 방식</h3>
        <p><span style="color: rgb(130, 170, 255); font-weight: 500;">진지하지만 무겁지 않게.</span> 회고가 숙제가 아니라 선물이 되는 시간.
        <span style="color: rgb(195, 232, 141); font-weight: 600;">각자의 로그를 공유하고, 낭만을 이야기하며, 서로의 점들을 연결</span>해요.</p>

        <blockquote style="background: linear-gradient(135deg, rgba(255, 184, 108, 0.1), rgba(130, 170, 255, 0.1)); padding: 20px; border-radius: 8px; border-left: 4px solid #FFB86C; margin: 30px 0;">
          <p style="font-size: 16px; font-style: italic;">"처음엔 막막했는데, 함께 나누다 보니 내가 얼마나 성장했는지 깨달았어요. 다른 분들의 이야기에서 용기도 얻고요!"</p>
          <footer style="text-align: right; color: #888; font-size: 14px;">- 2024 하반기 참가자</footer>
        </blockquote>

        <div style="text-align: center; margin-top: 40px;">
          <p style="font-size: 20px;">📖 + 🤝 + 💡 = ✨</p>
          <p style="color: rgb(195, 232, 141); font-weight: bold;">회고와 공감과 인사이트가 만나면, 새로운 챕터가 시작됩니다!</p>
        </div>
      `,
      alignment: 'left',
      backgroundColor: '#0a0a0a'
    },
    howWeRoll: {
      title: '2시간으로 한 해를 <span style="color: #FFB86C;">정리하고</span><br/>새로운 챕터를 <span style="color: #82AAFF;">열다</span>',
      subtitle: '진지하지만 따뜻한, 깊이 있지만 편안한 우리만의 시간',
      tagHeader: '모임 진행 방식',
      scheduleIntro: '12월 13일 토요일 오후, 강남역에서 만나요',
      subHeading: '📅 2시간의 여정',
      closingMessage: '회고가 부담이 아닌 <strong>기다려지는 시간</strong>이 되는 마법, 함께 경험해요! ✨',
      meetingOverview: [
        {
          icon: '📅',
          title: '일시',
          highlight: '2025년 12월 13일 토요일',
          description: '오후 4시 - 6시 (2시간)',
          type: 'primary'
        },
        {
          icon: '📍',
          title: '장소',
          highlight: '강남역 스터디카페',
          description: '편안하고 아늑한 회고 공간',
          type: 'secondary'
        },
        {
          icon: '👥',
          title: '정원',
          highlight: '12명 소규모',
          description: '깊이 있는 대화를 위한 적정 인원',
          type: 'primary'
        },
        {
          icon: '💫',
          title: '참가 대상',
          highlight: '성장에 관심 있는 모든 분',
          description: '직군 무관, 회고에 열린 마음만 있으면 OK',
          type: 'secondary'
        }
      ],
      schedule: [
        {
          time: '16:00 ~ 16:10',
          activity: '🙌 웰컴 & 아이스브레이킹',
          detail: '편안한 인사와 간단한 자기소개. 오늘 회고 모임의 취지와 일정 안내',
          type: 'secondary'
        },
        {
          time: '16:10 ~ 16:25',
          activity: '📝 개인 정리 시간',
          detail: '조용히 생각을 정리하는 시간. 올해의 로그, 내년의 로드맵, 낭만 있는 삶에 대해 생각해봐요',
          type: 'secondary'
        },
        {
          time: '16:25 ~ 17:25',
          activity: '💬 메인 세션: 나의 이야기',
          detail: '한 사람씩 돌아가며 발표 (1인당 약 7-8분). ① Logs of the Year (올해의 하이라이트), ② 2025 로드맵 (내년의 키워드), ③ 낭만 있게 살아가기 (꿈/성장/열망)',
          type: 'primary'
        },
        {
          time: '17:25 ~ 17:30',
          activity: '☕ 티타임 & 스트레칭',
          detail: '잠깐의 휴식과 자유로운 대화',
          type: 'secondary'
        },
        {
          time: '17:30 ~ 17:55',
          activity: '🔗 Connecting the Dots',
          detail: '소그룹(6명씩)으로 나누어 랜덤 질문 세션. 성장과 도전, 커리어와 삶, 미래와 꿈에 대한 깊은 대화',
          type: 'primary'
        },
        {
          time: '17:55 ~ 18:00',
          activity: '✨ 클로징 & MVP',
          detail: '오늘의 소감 나누기 & 가장 인상 깊었던 분 한 명 선출 (그냥 재미로!)',
          type: 'secondary'
        }
      ]
    },
    journey: {
      tagHeader: '우리의 회고 여정',
      title: '6개월마다 모여, <span style="color: #FFB86C;">3번</span>의 챕터를 함께 넘겼어요',
      subtitle: '각자의 성장이 모여 만드는 의미 있는 기록',
      closingMessage: '다음 페이지를 함께 넘길 <strong>당신</strong>을 기다려요 📖',
      startDate: '2024-01-15',
      calculateDays: true,
      layout: 'timeline',
      showAchievements: true,
      showIcons: true,
      showStats: false,
      generations: [
        {
          title: '시즌 1: 첫 시작 (2024 상반기)',
          description: '처음 만난 12명이 각자의 이야기를 나누며 회고의 가치를 발견했습니다. 서로에게 영감을 주고받으며 성장의 씨앗을 심었어요.',
          icon: '🌱',
          achievements: [
            '🎉 첫 회고 모임 성공적 개최',
            '📚 12명의 2024 상반기 로그 공유',
            '🤝 낯선 이들이 동료가 되는 순간'
          ],
          status: 'completed'
        },
        {
          title: '시즌 2: 연결의 확장 (2024 하반기)',
          description: '두 번째 만남에서 우리는 더 깊은 이야기를 나눴습니다. Connecting the Dots를 경험하며 각자의 점들이 어떻게 연결되는지 발견했어요.',
          icon: '🔗',
          achievements: [
            '💡 Connecting the Dots 세션 도입',
            '🌟 참가자 만족도 95%',
            '📖 소그룹 깊은 대화의 힘 체험'
          ],
          status: 'completed'
        },
        {
          title: '시즌 3: 성장의 기록 (2025 상반기)',
          description: '세 번째 모임에서는 1년간의 변화를 돌아보며 놀라운 성장을 확인했습니다. 작은 점들이 모여 의미 있는 선을 그리는 순간이었어요.',
          icon: '📈',
          achievements: [
            '🎊 연간 회고로 확장',
            '✨ 낭만 있게 살아가기 주제 추가',
            '🏆 MVP 제도로 재미 요소 도입'
          ],
          status: 'completed'
        },
        {
          title: '시즌 4: 새로운 챕터 (2025 하반기)',
          description: '이번에는 연말을 맞아 한 해를 정리하는 특별한 시간입니다. 올해의 마지막 페이지를 함께 넘기며 2026년의 첫 챕터를 열어요.',
          icon: '📖',
          achievements: [
            '🎯 현재 진행 예정',
            '🌟 12월 13일 모집 중'
          ],
          status: 'ongoing'
        }
      ]
    },
    experience: {
      tagHeader: '회고의 5단계',
      title: '회고를 <span style="color: #FFB86C;">한다는 건</span>',
      subtitle: '과거를 돌아보고 미래를 그리는, <span style="background: linear-gradient(90deg, #C3E88D, #82AAFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">특별한 여정</span>',
      highlightText: '특별한 여정',
      layout: 'vertical',
      enableAnimation: true,
      animationType: 'slideUp',
      defaultActiveStep: 0,
      navigationStyle: 'dots',
      mobileCollapse: true,
      steps: [
        {
          label: 'Step 1',
          title: '📝 16:10 - 조용히 정리하는 시간',
          description: '혼자만의 15분. 조용히 올해를 돌아보고, 내년을 상상하며, 나의 낭만을 생각해요. 포스트잇에 키워드를 적으며 생각을 정리합니다.',
          illustrationType: 'custom'
        },
        {
          label: 'Step 2',
          title: '💬 16:25 - 나의 로그 공유',
          description: '올해의 하이라이트와 디버깅 포인트를 나눠요. "가장 기억에 남는 순간", "배운 점", "아쉬웠던 부분"을 솔직하게 공유합니다.',
          illustrationType: 'custom'
        },
        {
          label: 'Step 3',
          title: '🗺️ 16:50 - 2025 로드맵 그리기',
          description: '내년에 추가하고 싶은 나의 키워드와 목표를 이야기해요. "이런 사람이 되고 싶다", "이런 것을 해보고 싶다"를 자유롭게 나눕니다.',
          illustrationType: 'custom'
        },
        {
          label: 'Step 4',
          title: '✨ 17:10 - 낭만 있게 살아가기',
          description: '꿈과 로망, 성장과 도전, 열망과 영감. 3가지 주제로 포스트잇을 작성하고 공유해요. 삶에서 놓치고 싶지 않은 것들을 함께 나눕니다.',
          illustrationType: 'custom'
        },
        {
          label: 'Step 5',
          title: '🔗 17:30 - Connecting the Dots',
          description: '소그룹으로 나누어 랜덤 질문에 답하며 깊은 대화를 나눠요. 서로의 점들이 어떻게 연결되는지 발견하고, 예상치 못한 인사이트를 얻습니다.',
          illustrationType: 'custom'
        }
      ]
    },
    members: {
      tagHeader: '함께하는 회고러들',
      title: '현재 <span style="color: #FFB86C;">12명</span>이 <span style="color: #82AAFF;">12월 13일 토요일</span> 오후에 모여요',
      subtitle: '다양한 직군, 다양한 나이, 하나의 목표: 성장',
      layout: 'grid',
      studyType: 'reflection',
      showStats: true,
      weeklyMvp: '은지',
      stats: {
        totalMembers: 12,
        activeMembers: 12,
        totalHours: 6,
        totalProblems: 0,
        participationRate: 100,
        popularAlgorithms: [],
        customStats: [
          { label: '평균 연령', value: '28세', icon: '👥' },
          { label: '다양한 직군', value: '7개', icon: '💼' },
          { label: '회고 열정', value: '200%', icon: '🔥' }
        ]
      },
      members: [
        {
          userId: 'user-1',
          name: '은지',
          role: '백엔드 개발자',
          imageUrl: '/images/member-tp1.jpg',
          joinDate: '2024-12',
          tagline: '올해는 도전의 해였어요 🚀',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '균형', icon: '⚖️' },
            { label: '올해의 성취', value: '이직 성공', icon: '🎯' },
            { label: '내년의 도전', value: '사이드 프로젝트', icon: '💡' }
          ],
          badges: [{ type: 'mvp', label: '지난 시즌 MVP', icon: '👑' }]
        },
        {
          name: '준호',
          role: '프로덕트 디자이너',
          imageUrl: '/images/member-tp2.jpg',
          joinDate: '2024-12',
          tagline: '디자인과 삶, 둘 다 고민 중 🎨',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '본질', icon: '🎯' },
            { label: '올해의 성취', value: '포트폴리오 완성', icon: '📚' },
            { label: '내년의 도전', value: '글쓰기', icon: '✍️' }
          ]
        },
        {
          name: '수민',
          role: '프론트엔드 개발자',
          imageUrl: '/images/member-tp3.jpg',
          joinDate: '2024-12',
          tagline: '꾸준함의 힘을 믿어요 💪',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '성장', icon: '🌱' },
            { label: '올해의 성취', value: '기술 블로그 시작', icon: '📝' },
            { label: '내년의 도전', value: 'OSS 기여', icon: '🌟' }
          ]
        },
        {
          name: '현우',
          role: '데이터 분석가',
          imageUrl: '/images/member-tp4.jpg',
          joinDate: '2024-12',
          tagline: '숫자 너머의 이야기를 찾아요 📊',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '인사이트', icon: '💡' },
            { label: '올해의 성취', value: '데이터 파이프라인 구축', icon: '🔧' },
            { label: '내년의 도전', value: 'ML 공부', icon: '🤖' }
          ]
        },
        {
          name: '지윤',
          role: '마케터',
          imageUrl: '/images/member-tp5.jpg',
          joinDate: '2024-12',
          tagline: '사람의 마음을 움직이는 일 ❤️',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '연결', icon: '🔗' },
            { label: '올해의 성취', value: '캠페인 성공', icon: '🎉' },
            { label: '내년의 도전', value: '브랜딩 공부', icon: '📚' }
          ]
        },
        {
          name: '태민',
          role: 'PM',
          imageUrl: '/images/member-tp6.jpg',
          joinDate: '2024-12',
          tagline: '문제 해결이 즐거운 사람 🎯',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '임팩트', icon: '💥' },
            { label: '올해의 성취', value: '신규 프로덕트 런칭', icon: '🚀' },
            { label: '내년의 도전', value: '리더십', icon: '👥' }
          ]
        },
        {
          name: '서연',
          role: 'UX 라이터',
          imageUrl: '/images/member-tp7.jpg',
          joinDate: '2024-12',
          tagline: '한 줄의 힘을 믿어요 ✨',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '표현', icon: '💬' },
            { label: '올해의 성취', value: '라이팅 가이드 제작', icon: '📖' },
            { label: '내년의 도전', value: '책 출간', icon: '📚' }
          ]
        },
        {
          name: '민재',
          role: '백엔드 개발자',
          imageUrl: '/images/member-tp8.jpg',
          joinDate: '2024-12',
          tagline: '코드로 세상을 바꾸고 싶어요 💻',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '깊이', icon: '🔍' },
            { label: '올해의 성취', value: '아키텍처 개선', icon: '🏗️' },
            { label: '내년의 도전', value: '컨퍼런스 발표', icon: '🎤' }
          ]
        },
        {
          name: '하은',
          role: 'HR',
          imageUrl: '/images/member-tp9.jpg',
          joinDate: '2024-12',
          tagline: '사람이 가장 중요한 자산 🌟',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '공감', icon: '❤️' },
            { label: '올해의 성취', value: '조직문화 개선', icon: '🏢' },
            { label: '내년의 도전', value: '코칭 자격증', icon: '📜' }
          ]
        },
        {
          name: '동현',
          role: '그로스 마케터',
          imageUrl: '/images/member-tp10.jpg',
          joinDate: '2024-12',
          tagline: '데이터와 감각의 조화 📈',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '실험', icon: '🧪' },
            { label: '올해의 성취', value: 'MAU 2배 증가', icon: '📊' },
            { label: '내년의 도전', value: 'Growth Hacking', icon: '🚀' }
          ]
        },
        {
          name: '예린',
          role: '콘텐츠 크리에이터',
          imageUrl: '/images/member-tp11.jpg',
          joinDate: '2024-12',
          tagline: '이야기를 만드는 사람 📝',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '진정성', icon: '💎' },
            { label: '올해의 성취', value: '구독자 1만 달성', icon: '🎉' },
            { label: '내년의 도전', value: '유튜브 시작', icon: '🎬' }
          ]
        },
        {
          name: '승현',
          role: '사업 기획자',
          imageUrl: '/images/member-tp12.jpg',
          joinDate: '2024-12',
          tagline: '아이디어를 현실로 🌈',
          isActive: true,
          customFields: [
            { label: '2025 키워드', value: '실행', icon: '⚡' },
            { label: '올해의 성취', value: '신규 사업 제안 통과', icon: '✅' },
            { label: '내년의 도전', value: '창업 준비', icon: '🏪' }
          ]
        }
      ]
    },
    faq: {
      title: 'FAQ',
      tagHeader: '자주 묻는 질문',
      showIcons: true,
      items: [
        {
          question: '회고를 준비 안 해도 되나요?',
          answer: '당연하죠! 특별한 준비는 필요 없어요. 모임 시작 후 15분간 개인 정리 시간이 있어서, 그때 생각을 정리하면 돼요. 솔직한 마음만 가져오세요.',
          category: '참여 방법'
        },
        {
          question: '어떤 분위기인가요?',
          answer: '진지하지만 무겁지 않아요. 편안한 카페에서 친구들과 이야기 나누는 느낌이에요. 정답을 찾는 게 아니라 서로의 이야기를 나누고 공감하는 시간입니다.',
          category: '분위기'
        },
        {
          question: '혼자 와도 괜찮나요?',
          answer: '네! 대부분 혼자 오세요. 오히려 혼자 오는 게 더 좋아요. 새로운 사람들을 만나고, 다양한 관점을 듣는 게 이 모임의 매력이거든요.',
          category: '참여 방식'
        },
        {
          question: '참가비가 있나요?',
          answer: '네, 1만원입니다. 장소 대관비와 간단한 다과 비용으로 사용돼요. 편안한 공간에서 회고에 집중할 수 있도록 환경을 만드는 데 쓰입니다.',
          category: '비용'
        },
        {
          question: '다음 모임은 언제인가요?',
          answer: '터닝페이지는 6개월마다 열려요. 다음 모임은 2026년 상반기 (6월 예정)입니다. 정기적으로 만나며 긴 호흡으로 성장을 돌아보는 게 우리의 철학이에요.',
          category: '일정'
        },
        {
          question: '발표를 꼭 해야 하나요?',
          answer: '네, 한 사람씩 돌아가며 7-8분 정도 이야기를 나눠요. 하지만 발표라기보다는 "편한 대화"에 가까워요. PPT 같은 건 필요 없고, 그냥 편하게 이야기하면 돼요.',
          category: '진행 방식'
        },
        {
          question: 'Connecting the Dots가 뭔가요?',
          answer: '스티브 잡스의 연설에서 나온 개념이에요. 소그룹으로 나누어 랜덤 질문에 답하며 깊은 대화를 나눠요. 삶의 경험들이 어떻게 연결되는지 발견하는 시간입니다.',
          category: '진행 방식'
        },
        {
          question: '어떤 사람들이 참여하나요?',
          answer: '개발자, 디자이너, 마케터, PM 등 다양한 직군의 20-30대가 모여요. 직군보다 중요한 건 "성장에 관심이 있고, 회고를 통해 배우고 싶은 마음"입니다.',
          category: '참가 대상'
        }
      ]
    },
    cta: {
      title: '다음 페이지를 함께 넘길 준비 되셨나요?',
      description: '12월 13일, 당신의 이야기를 들려주세요',
      buttonText: '회고 모임 신청하기 📖',
      buttonUrl: 'https://open.kakao.com/turningpage'
    },
    review: {
      enabled: true,
      tagHeader: '진짜 후기',
      title: '<span style="color: #FFB86C;">함께 회고한 사람들</span>의 솔직한 이야기',
      subtitle: '회고가 만든 작은 변화들',
      showKeywords: true,
      keywords: ['성장', '공감', '따뜻함', '인사이트', '동기부여', '연결'],
      displayCount: 3,
      sortBy: 'latest',
      showStats: true,
      reviews: [
        {
          id: 'tp-review-1',
          userId: 'tp-user-1',
          userName: '익명A',
          rating: 5,
          title: '내가 얼마나 성장했는지 깨달은 시간',
          content: '혼자 회고하면 객관적이지 못한데, 다른 분들 앞에서 이야기하니 제가 정말 많이 성장했다는 걸 느꼈어요. 응원의 말들도 큰 힘이 됐고요. 다음 모임도 꼭 참여할 거예요!',
          createdAt: '2024-06-25',
          attendCount: 1,
          helpfulCount: 18,
          tags: [
            { id: 'tp-tag-1', category: 'GROWTH', label: '성장', emoji: '🌱', description: '성장' },
            { id: 'tp-tag-2', category: 'ATMOSPHERE', label: '따뜻함', emoji: '🤗', description: '따뜻함' }
          ],
          timeAgo: '6개월 전'
        },
        {
          id: 'tp-review-2',
          userId: 'tp-user-2',
          userName: '익명B',
          rating: 5,
          title: '다른 사람들의 이야기에서 용기를 얻었어요',
          content: '저만 힘든 게 아니구나 싶었어요. 다들 각자의 고민이 있고, 그걸 극복해나가는 모습이 정말 멋있었어요. Connecting the Dots 세션에서 나눈 깊은 대화는 잊을 수 없을 것 같아요.',
          createdAt: '2024-12-05',
          attendCount: 1,
          helpfulCount: 22,
          tags: [
            { id: 'tp-tag-3', category: 'ATMOSPHERE', label: '공감', emoji: '💙', description: '공감' },
            { id: 'tp-tag-4', category: 'OUTCOME', label: '용기', emoji: '💪', description: '용기' }
          ],
          timeAgo: '1주일 전'
        },
        {
          id: 'tp-review-3',
          userId: 'tp-user-3',
          userName: '익명C',
          rating: 5,
          title: '2시간이 이렇게 짧게 느껴질 줄이야',
          content: '처음엔 어색했는데, 이야기를 나누다 보니 금방 친해졌어요. 다들 진솔하게 자신의 이야기를 나눠서 저도 편하게 털어놓을 수 있었고요. 내년 목표도 더 명확해진 것 같아요!',
          createdAt: '2024-06-20',
          attendCount: 1,
          helpfulCount: 15,
          tags: [
            { id: 'tp-tag-5', category: 'ATMOSPHERE', label: '편안함', emoji: '😌', description: '편안함' },
            { id: 'tp-tag-6', category: 'OUTCOME', label: '명확함', emoji: '🎯', description: '명확함' }
          ],
          timeAgo: '6개월 전'
        }
      ]
    }
  }
};
