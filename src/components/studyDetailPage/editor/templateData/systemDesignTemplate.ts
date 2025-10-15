// 시스템 디자인 스터디 템플릿 데이터
// 몹 디자인으로 함께 성장하는 시스템 디자인 스터디

import { StudyTemplate } from './algorithmTemplate';

export const systemDesignTemplate: StudyTemplate = {
  id: 'systemDesign',
  name: '시스템 디자인 스터디 - 몹 디자인',
  sections: {
    hero: {
      title: '🎯 테크 다이브',
      subtitle: '지금 필요한 건,<br/><span style="background: linear-gradient(90deg, #C3E88D, #82AAFF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">프로그래밍 언어가 아닌, 설계의 언어</span>',
      description: '화이트보드 앞에서 6명이 함께 설계하며 배웁니다. 완벽한 답보다 치열한 고민, 날카로운 질문, 그리고 함께 찾아가는 인사이트가 우리의 성장 동력입니다.',
      buttonText: '스터디 합류하기 🚀',
      buttonLink: '#apply',
      backgroundImage: '/images/techdive/hero-bg.svg',
      infoBox: {
        header: '우리만의 학습 방식',
        items: [
          {
            icon: '👥',
            text: '<strong>몹 디자인 (Mob Design)</strong><br/>6명이 화이트보드 앞에서 함께 설계. 혼자가 아니기에 두렵지 않고, 함께이기에 더 깊게 파고듭니다.'
          },
          {
            icon: '🤖',
            text: '<strong>AI를 파트너로</strong><br/>AI는 우리의 설계를 검증하고, 대안을 제시하는 똑똑한 조력자. 비판적으로 활용하며 사고력을 확장합니다.'
          },
          {
            icon: '⏱️',
            text: '<strong>5 Phase 몰입 시스템</strong><br/>2시간을 5개 Phase로 나눠 요구사항부터 확장성까지 체계적으로 학습. 시간 압박이 집중력을 만듭니다.'
          }
        ]
      }
    },
    leaderIntro: {
      name: '시스템',
      profileImage: '/images/leader-system-design.jpg',
      role: '시니어 백엔드 엔지니어',
      motivation: '면접 준비만으로는 부족했습니다. 실무에서 정말 필요한 건 "시스템을 보는 눈"이었어요. 혼자 공부하다 막막했던 순간들을 기억하며, 함께 성장할 공간을 만들었습니다.',
      philosophy: '완벽한 설계는 없습니다. 다만 상황에 맞는 최선의 선택이 있을 뿐. 트레이드오프를 이해하고, 선택의 이유를 설명할 수 있다면 이미 성장한 겁니다.',
      welcomeMessage: '백지 앞에서 막막한가요? 괜찮아요. 우리는 함께 그림을 그려갈 거니까요. 모르는 것을 솔직히 말하고, 서로에게 배우며 성장하는 시간을 만들어요! 🎨',
      expertise: ['분산시스템', '대용량처리', '트레이드오프'],
      since: '2023년 3월부터',
      totalStudies: 3,
      totalMembers: 42,
      email: 'systemdesign@study.com',
      github: 'https://github.com/systemdesign',
      blog: 'https://system-design-blog.com'
    },
    richText: {
      title: '몹 디자인, 함께 설계한다는 것',
      content: `
        <p>시스템 디자인, 혼자 공부하다 막막했던 경험 있으신가요?<br/>
        "정답이 뭘까?" 하는 불안감, "이게 맞나?" 하는 의구심...</p>

        <p style="color: #888; font-style: italic;">사실 정답은 없습니다. 다만 <span style="color: rgb(195, 232, 141); font-weight: 600;">더 나은 선택</span>이 있을 뿐이죠.</p>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">🎯 몹 디자인이란?</h3>
        <p><span style="color: rgb(130, 170, 255); font-weight: 500;">6명이 하나의 화이트보드 앞에서 함께 시스템을 설계</span>합니다.
        한 명이 마커를 들고 그리고(Driver), 나머지 5명은 아이디어를 내고 질문하며(Navigator),
        15분마다 역할을 바꿔가며 모두가 참여합니다.</p>

        <ul style="line-height: 2;">
          <li><span style="color: rgb(130, 170, 255); font-weight: 500;">혼자가 아니기에</span> 막막하지 않습니다</li>
          <li><span style="color: rgb(130, 170, 255); font-weight: 500;">함께이기에</span> 더 깊게 파고듭니다</li>
          <li><span style="color: rgb(130, 170, 255); font-weight: 500;">다양한 관점</span>이 설계를 풍성하게 만듭니다</li>
        </ul>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">🤖 AI, 우리의 똑똑한 파트너</h3>
        <p>AI를 배척하지 않습니다. 오히려 <span style="color: rgb(195, 232, 141); font-weight: 600;">전략적으로 활용</span>합니다.
        요구사항 정의에서 숫자를 받고, 기술 선택에서 비교표를 받고, 설계를 검증받습니다.
        하지만 <span style="color: rgb(195, 232, 141); font-weight: 600;">맹신하지 않습니다</span>.
        AI의 답변을 비판적으로 분석하고 우리 상황에 맞게 조정하는 것, 그것이 진짜 실력입니다.</p>

        <div style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(130, 170, 255, 0.1)); padding: 30px; border-radius: 12px; margin-top: 40px; border-left: 4px solid #FFD700;">
          <p style="font-size: 18px;"><span style="color: rgb(255, 215, 0); font-weight: bold;">💡 핵심 철학</span></p>
          <p style="margin-top: 16px;">완벽한 설계를 찾지 않습니다.<br/>
          <strong style="color: rgb(195, 232, 141);">트레이드오프를 이해</strong>하고,
          <strong style="color: rgb(130, 170, 255);">선택의 이유를 설명</strong>할 수 있다면<br/>
          그것이 바로 우리가 찾는 성장입니다.</p>
        </div>

        <h3 style="color: rgb(195, 232, 141); margin-top: 40px;">⏱️ 2시간, 5개 Phase</h3>
        <p>매 세션은 <span style="color: rgb(195, 232, 141); font-weight: 600;">타이머</span>와 함께 진행됩니다.
        요구사항 정의 20분, High-Level Design 25분, Deep Dive 35분, 확장성 20분, 회고 15분.
        시간 제약이 집중력을 만들고, 구조화된 프로세스가 학습 효과를 극대화합니다.</p>

        <div style="text-align: center; margin-top: 40px;">
          <p style="font-size: 20px; color: #C3E88D; font-weight: 600;">화이트보드 앞에서 만나요 🎨</p>
          <p style="color: #888; font-style: italic; margin-top: 8px;">완벽하지 않아도, 서툴러도 괜찮습니다. 함께 배우니까요.</p>
        </div>
      `,
      alignment: 'left',
      backgroundColor: '#0a0a0a'
    },
    members: {
      tagHeader: '함께 설계하는 동료들',
      title: '현재 <span style="color: #FFD700;">6명</span>이 <span style="color: #82AAFF;">매주 토요일 저녁</span> 화이트보드 앞에서 만나요',
      subtitle: '다양한 백그라운드, 하나의 목표: 시스템을 보는 눈 키우기',
      layout: 'grid',
      studyType: 'systemDesign',
      showStats: true,
      weeklyMvp: '혁진',
      stats: {
        totalMembers: 6,
        activeMembers: 6,
        totalHours: 96,
        totalProblems: 0,
        participationRate: 100,
        popularAlgorithms: [],
        customStats: [
          { label: '완성한 설계', value: '12개', icon: '🎨' },
          { label: '평균 참여율', value: '100%', icon: '📊' },
          { label: 'AI 질문', value: '240+', icon: '🤖' }
        ]
      },
      members: [
        {
          userId: 'hyukjin',
          name: '혁진',
          role: '백엔드 3년차',
          imageUrl: '/images/member-hyukjin.jpg',
          joinDate: '2024-09-01',
          tagline: 'AI 프롬프트 마스터 🤖',
          streak: 12,
          solvedProblems: 12,
          memorableProblem: 'URL 단축 서비스',
          currentFocus: '분산 시스템 패턴',
          whatIGained: 'AI를 활용한 설계 검증 능력',
          testimonial: '깊이 있는 질문으로 모두를 성장시켜요',
          from: '민수',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '완성한 설계', value: '12개', icon: '🎨' },
            { label: '연속 참여', value: '12주', icon: '🔥' },
            { label: '특기', value: 'DB 설계', icon: '💾' }
          ],
          badges: [
            { type: 'mvp', label: '이번 주 MVP', icon: '👑' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '민수',
          role: '백엔드 2년차',
          imageUrl: '/images/member-minsu.jpg',
          joinDate: '2024-09-01',
          tagline: '용량 계산 전문가 📊',
          streak: 12,
          solvedProblems: 12,
          memorableProblem: '인스타그램 뉴스피드',
          currentFocus: '캐싱 전략',
          whatIGained: 'Back-of-envelope 계산 능력',
          testimonial: '복잡한 계산을 쉽게 설명해줘요',
          from: '지영',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '완성한 설계', value: '12개', icon: '🎨' },
            { label: '연속 참여', value: '12주', icon: '🔥' },
            { label: '특기', value: '용량 설계', icon: '📏' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '지영',
          role: '프론트엔드 4년차',
          imageUrl: '/images/member-jiyoung.jpg',
          joinDate: '2024-09-01',
          tagline: '화이트보드 아티스트 🎨',
          streak: 11,
          solvedProblems: 12,
          memorableProblem: '실시간 채팅 시스템',
          currentFocus: 'WebSocket 아키텍처',
          whatIGained: '백엔드 시스템에 대한 이해',
          testimonial: '프론트 관점에서 질문하며 새 시각 제공',
          from: '수진',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '완성한 설계', value: '12개', icon: '🎨' },
            { label: '연속 참여', value: '11주', icon: '🔥' },
            { label: '특기', value: 'API 설계', icon: '🔌' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '수진',
          role: '백엔드 5년차',
          imageUrl: '/images/member-sujin.jpg',
          joinDate: '2024-09-08',
          tagline: '트레이드오프 탐험가 ⚖️',
          streak: 11,
          solvedProblems: 11,
          memorableProblem: '티켓 예매 시스템',
          currentFocus: '동시성 제어',
          whatIGained: '장단점을 명확히 하는 사고방식',
          testimonial: '항상 "왜?"를 묻는 날카로운 질문',
          from: '현우',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '완성한 설계', value: '11개', icon: '🎨' },
            { label: '연속 참여', value: '11주', icon: '🔥' },
            { label: '특기', value: '트레이드오프', icon: '⚖️' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '현우',
          role: 'DevOps 3년차',
          imageUrl: '/images/member-hyunwoo.jpg',
          joinDate: '2024-09-01',
          tagline: '인프라 구루 🏗️',
          streak: 12,
          solvedProblems: 12,
          memorableProblem: '유튜브 스트리밍',
          currentFocus: 'CDN 최적화',
          whatIGained: '확장성 설계 원칙',
          testimonial: '인프라 관점에서 실무 경험 공유',
          from: '태희',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '완성한 설계', value: '12개', icon: '🎨' },
            { label: '연속 참여', value: '12주', icon: '🔥' },
            { label: '특기', value: '인프라', icon: '🏗️' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        },
        {
          name: '태희',
          role: '백엔드 1년차',
          imageUrl: '/images/member-taehee.jpg',
          joinDate: '2024-09-15',
          tagline: '질문 폭탄 투척자 💣',
          streak: 10,
          solvedProblems: 10,
          memorableProblem: '이미지 업로드 서비스',
          currentFocus: '기본기 다지기',
          whatIGained: '두려움 없이 질문하는 용기',
          testimonial: '초심자의 질문이 가장 본질적이에요',
          from: '혁진',
          recentActivity: '1일 전 활동',
          customFields: [
            { label: '완성한 설계', value: '10개', icon: '🎨' },
            { label: '연속 참여', value: '10주', icon: '🔥' },
            { label: '특기', value: '질문', icon: '❓' }
          ],
          badges: [
            { type: 'special', label: '신입 멤버', icon: '🌟' }
          ],
          isActive: true,
          lastActivity: '1일 전'
        }
      ]
    },
    faq: {
      title: 'FAQ',
      tagHeader: '자주 묻는 질문',
      showIcons: true,
      items: [
        {
          question: '몹 디자인이 정확히 뭔가요?',
          answer: '6명이 하나의 화이트보드 앞에서 함께 시스템을 설계하는 방식입니다. 한 명이 마커를 들고 그리고(Driver), 나머지는 아이디어를 내며(Navigator), 15분마다 역할을 교체합니다. 혼자가 아니기에 두렵지 않고, 함께이기에 더 깊게 배울 수 있어요.',
          category: '방식'
        },
        {
          question: '시스템 디자인 경험이 전혀 없는데 괜찮을까요?',
          answer: '완전히 괜찮습니다! 오히려 초보자의 "왜?"라는 질문이 가장 본질적이에요. Week 1-4는 기본기 다지기 단계로, URL 단축 서비스 같은 간단한 문제부터 시작합니다. 함께 배우는 동료들과 AI의 도움으로 누구나 성장할 수 있어요.',
          category: '참여 자격'
        },
        {
          question: 'AI를 어떻게 활용하나요?',
          answer: 'AI는 우리의 조력자입니다. 요구사항 정의에서 DAU/QPS 같은 숫자를 받고, 기술 선택에서 비교표를 받고, 설계를 검증받습니다. 하지만 맹신하지 않아요. AI의 답변을 비판적으로 분석하고 우리 상황에 맞게 조정하는 게 진짜 배움입니다.',
          category: 'AI 활용'
        },
        {
          question: '모임은 언제, 어디서 진행되나요?',
          answer: '매주 토요일 저녁 20:00-22:00 (2시간), 강남역 인근 스터디룸에서 오프라인으로 진행됩니다. 화이트보드와 마커가 필수라 온라인은 어려워요. 공휴일은 협의하여 휴식합니다.',
          category: '일정'
        },
        {
          question: '한 세션에서 정확히 뭘 하나요?',
          answer: '2시간을 5개 Phase로 나눠 진행합니다: ① 요구사항 정의 (20분) - DAU/QPS 등 숫자 확정, ② High-Level Design (25분) - 큰 그림 그리기, ③ Deep Dive (35분) - 핵심 부분 깊게 파기, ④ 확장성 & 병목 (20분) - 10배 증가 대비, ⑤ 회고 (15분) - KPT 회고. 타이머로 관리하며 집중력을 유지해요.',
          category: '진행 방식'
        },
        {
          question: '참여 비용은 얼마인가요?',
          answer: '12주 기준 약 15만원입니다. (주당 약 12,000원) 스터디룸 대관비와 운영비로 사용됩니다. 화이트보드와 쾌적한 환경을 위한 투자예요.',
          category: '비용'
        },
        {
          question: '12주 커리큘럼은 어떻게 구성되나요?',
          answer: 'Week 1-4는 기본기 (URL 단축, 이미지 업로드 등 초급), Week 5-8은 실력 상승 (뉴스피드, 채팅, 예매 등 중급), Week 9-12는 면접 실전 (배달 추적, 자동완성 등 중고급)으로 점진적으로 난이도가 올라갑니다. 매주 하나의 대표 문제를 함께 설계해요.',
          category: '커리큘럼'
        },
        {
          question: '결석하면 어떻게 되나요?',
          answer: '2주 전에 미리 말씀해주시면 괜찮아요. 하지만 3번 연속 무단 결석/지각은 자동 탈퇴 규칙이 있습니다. 6명이 함께하는 몹 디자인이라 한 명의 빈자리가 크거든요. 서로를 위한 최소한의 약속이에요.',
          category: '출석'
        },
        {
          question: '면접 준비에 도움이 될까요?',
          answer: '네, 하지만 그 이상입니다. 면접에서 물어보는 "인스타그램 설계하세요" 같은 질문에 답하는 능력은 당연히 늘어요. 더 중요한 건 실무에서 "왜 이 기술을 선택했는지" 설명할 수 있는 사고력입니다. 12주 후면 확실히 다른 레벨이 될 거예요.',
          category: '기대 효과'
        }
      ]
    },
    cta: {
      title: '함께 화이트보드 앞에서 만나요!',
      description: '궁금한 점은 언제든 편하게 물어보세요.',
      buttonText: '리더에게 커피챗 신청 ☕',
      buttonUrl: 'https://open.kakao.com/o/systemdesign'
    },
    review: {
      enabled: true,
      tagHeader: '진짜 후기',
      title: '<span style="color: #FFD700;">함께 설계한 동료들</span>의 솔직한 이야기',
      subtitle: '화이트보드 앞에서 함께한 12주의 기록',
      showKeywords: true,
      keywords: ['몹디자인', '성장', 'AI활용', '트레이드오프', '실무역량', '화이트보드', '타임박스', '질문폭탄'],
      displayCount: 3,
      sortBy: 'latest',
      showStats: true,
      reviews: [
        {
          id: 'sd-review-1',
          userId: 'user-sd-1',
          userName: '혁진',
          rating: 5,
          title: '혼자였다면 절대 못 배웠을 것들',
          content: '백지 앞에서 막막했던 제게 "함께"의 힘을 알려준 스터디. 6명이 화이트보드 앞에서 머리를 맞대고 고민하다 보면, 어느새 복잡한 시스템이 명확해지는 마법 같은 순간들. AI한테 물어보는 법도 배우고, 트레이드오프 사고도 체득했어요. 12주가 너무 짧아요!',
          createdAt: '2024-11-25',
          attendCount: 12,
          helpfulCount: 28,
          tags: [
            { id: 'sd-tag-1', category: 'ATMOSPHERE', label: '협업', emoji: '👥', description: '협업' },
            { id: 'sd-tag-2', category: 'GROWTH', label: '성장', emoji: '📈', description: '성장' },
            { id: 'sd-tag-3', category: 'LEARNING', label: 'AI활용', emoji: '🤖', description: 'AI활용' }
          ],
          timeAgo: '1주일 전'
        },
        {
          id: 'sd-review-2',
          userId: 'user-sd-2',
          userName: '민수',
          rating: 5,
          title: '면접 준비 이상의 가치',
          content: '처음엔 면접 준비로 시작했는데, 실무 역량이 확 늘었어요. "이 기술은 왜 쓰는가?", "트레이드오프는 뭔가?"를 항상 생각하게 됐고, 회사에서 기술 선택할 때 자신감이 생겼습니다. 무엇보다 함께 성장하는 5명의 동료를 얻은 게 가장 큰 수확!',
          createdAt: '2024-11-20',
          attendCount: 12,
          helpfulCount: 22,
          tags: [
            { id: 'sd-tag-4', category: 'PRACTICAL', label: '실무역량', emoji: '💼', description: '실무역량' },
            { id: 'sd-tag-5', category: 'GROWTH', label: '자신감', emoji: '💪', description: '자신감' },
            { id: 'sd-tag-6', category: 'COMMUNITY', label: '동료', emoji: '🤝', description: '동료' }
          ],
          timeAgo: '2주일 전'
        },
        {
          id: 'sd-review-3',
          userId: 'user-sd-3',
          userName: '태희',
          rating: 5,
          title: '1년차에게도 기회를 준 스터디',
          content: '경험이 없어서 걱정했는데, 오히려 초보자의 질문이 환영받는 분위기예요. "왜요?", "이해가 안 돼요"라고 말할 수 있는 환경. 선배들도 처음엔 몰랐다는 걸 알게 됐고, 함께 찾아가는 과정 자체가 학습이었어요. 10주 만에 확실히 달라진 제 모습에 뿌듯합니다!',
          createdAt: '2024-11-18',
          attendCount: 10,
          helpfulCount: 18,
          tags: [
            { id: 'sd-tag-7', category: 'ATMOSPHERE', label: '초보환영', emoji: '🌱', description: '초보환영' },
            { id: 'sd-tag-8', category: 'ATMOSPHERE', label: '편안함', emoji: '😌', description: '편안함' },
            { id: 'sd-tag-9', category: 'GROWTH', label: '변화', emoji: '✨', description: '변화' }
          ],
          timeAgo: '2주일 전'
        }
      ]
    },
    howWeRoll: {
      title: '2시간, <span style="color: #FFD700;">5개 Phase</span>로<br/>시스템을 완성하다',
      subtitle: '타이머가 집중력을 만들고, 구조가 학습을 완성합니다',
      tagHeader: '세션 타임테이블',
      scheduleIntro: '매주 토요일 저녁 20:00-22:00, 화이트보드 앞에서 함께 몰입합니다.',
      subHeading: '⏱️ Phase별 몰입 시스템',
      closingMessage: '완벽한 설계보다 <strong>함께 고민한 시간</strong>이 우리를 성장시킵니다.',
      meetingOverview: [
        {
          icon: '📅',
          title: '스터디 기간',
          highlight: '12주 집중 과정',
          description: '매주 1회, 체계적인 난이도 상승',
          type: 'period'
        },
        {
          icon: '🏢',
          title: '정기 모임',
          highlight: '매주 토요일 20:00-22:00',
          description: '강남역 인근 스터디룸 (오프라인 필수)',
          type: 'location'
        },
        {
          icon: '👥',
          title: '인원',
          highlight: '6-7명 (몹 디자인)',
          description: '화이트보드 앞에서 함께 설계',
          type: 'team'
        },
        {
          icon: '💰',
          title: '참여 비용',
          highlight: '12주 약 15만원',
          description: '스터디룸 대관 및 운영비',
          type: 'fee'
        }
      ],
      schedule: [
        {
          time: '20:00-20:05',
          activity: '🔥 시작 & 역할 확인',
          detail: '사회자 확인, 오늘의 문제 소개, 준비 상태 체크',
          type: 'secondary'
        },
        {
          time: '20:05-20:25',
          activity: '📋 Phase 1: 요구사항 정의',
          detail: '브레인스토밍 (5분) → AI에게 PM 역할 시키기 (10분) → 화이트보드 정리 (5분). DAU/QPS/일관성 요구사항 등 숫자로 명확히.',
          type: 'primary'
        },
        {
          time: '20:25-20:50',
          activity: '🏗️ Phase 2: High-Level Design',
          detail: '큰 그림 그리기. 드라이버 1 (15분, 클라이언트→서버→DB 흐름) → 드라이버 2 교체 (5분, API 정의) → AI 검증 (5분)',
          type: 'primary'
        },
        {
          time: '20:50-21:25',
          activity: '🔬 Phase 3: Deep Dive',
          detail: '주제 투표 (5분) → 집중 설계 (25분, 드라이버 2-3회 교체). DB 스키마, 알고리즘, 동시성 제어 등 1-2개 깊게 파기 → 검증 (5분)',
          type: 'primary'
        },
        {
          time: '21:25-21:45',
          activity: '⚡ Phase 4: 확장성 & 병목',
          detail: '병목 찾기 (5분) → 용량 계산 (10분, 저장소/네트워크/서버) → 해결책 (5분, 캐싱/샤딩/복제)',
          type: 'primary'
        },
        {
          time: '21:45-22:00',
          activity: '💬 Phase 5: 회고',
          detail: '설계 요약 (5분) → KPT 회고 (8분, Keep/Problem/Try) → 화이트보드 사진 + 다음 주 예고 (2분)',
          type: 'secondary'
        }
      ]
    },
    journey: {
      tagHeader: '12주의 여정',
      title: '<span style="color: #FFD700;">12개의 시스템 설계</span>로<br/>시스템을 보는 눈을 키우다',
      subtitle: '기본기 → 실력 상승 → 면접 실전, 단계별 성장 로드맵',
      closingMessage: '12주 후, 당신은 확실히 <strong>다른 레벨</strong>이 될 거예요.',
      startDate: '2024-09-01',
      calculateDays: true,
      layout: 'timeline',
      showAchievements: true,
      showIcons: true,
      showStats: true,
      generations: [
        {
          title: 'Week 1-4: 기본기 (초급 문제)',
          description: '시스템 디자인의 기본 플로우를 익힙니다. 요구사항 정의, 컴포넌트 배치, 용량 계산 등 필수 스킬을 다져요.',
          icon: '🌱',
          achievements: [
            '✅ Week 1: URL 단축 서비스 (해시 함수, DB 설계)',
            '✅ Week 2: 이미지 업로드 서비스 (CDN, Object Storage)',
            '✅ Week 3: API Rate Limiter (캐싱, Redis)',
            '✅ Week 4: 인스타그램 팔로우 기능 (관계형 모델링)'
          ],
          status: 'completed'
        },
        {
          title: 'Week 5-8: 실력 상승 (중급 문제)',
          description: '분산 시스템의 핵심 개념을 학습합니다. Push vs Pull, WebSocket, 동시성 제어 등 실무 패턴을 체득해요.',
          icon: '🚀',
          achievements: [
            '✅ Week 5: 인스타그램 뉴스피드 (Push vs Pull, Fan-out)',
            '✅ Week 6: 실시간 채팅 시스템 (WebSocket, Pub/Sub)',
            '✅ Week 7: 티켓 예매 시스템 (동시성 제어, 분산 락)',
            '✅ Week 8: 유튜브 스트리밍 (비디오 인코딩, CDN)'
          ],
          status: 'completed'
        },
        {
          title: 'Week 9-12: 면접 실전 (중고급 문제)',
          description: '복잡한 시스템을 설계하며 실전 감각을 키웁니다. 위치 기반, CRDT, 검색 등 고급 주제를 다뤄요.',
          icon: '💎',
          achievements: [
            '🔄 Week 9: 배달 추적 시스템 (위치 기반, 실시간)',
            '🔄 Week 10: 검색어 자동완성 (Trie, 캐싱, 랭킹)',
            '📋 Week 11: 구글 독스 협업 편집 (CRDT, 충돌 해결)',
            '📋 Week 12: 종합 복습 (취약 부분 재설계)'
          ],
          status: 'ongoing'
        }
      ]
    },
    experience: {
      tagHeader: '시스템 디자인 학습 단계',
      title: '시스템 디자인을 <span style="color: #FFD700;">한다는 건</span>',
      subtitle: '5개 Phase를 거치며 <span style="color: #82AAFF;">생각하는 힘</span>을 키웁니다',
      highlightText: '생각하는 힘',
      layout: 'horizontal',
      enableAnimation: true,
      animationType: 'fadeIn',
      defaultActiveStep: 0,
      navigationStyle: 'numbers',
      mobileCollapse: true,
      steps: [
        {
          label: 'Phase 1',
          title: '📋 요구사항 정의',
          description: '모호한 문제를 <span style="color: #82AAFF;">구체적인 숫자와 명세</span>로 바꿉니다.<br/>DAU는? QPS는? 읽기:쓰기 비율은? AI와 함께 현실적인 수치를 확정해요.',
          illustrationType: 'question'
        },
        {
          label: 'Phase 2',
          title: '🏗️ High-Level Design',
          description: '시스템의 <span style="color: #C3E88D;">큰 그림</span>을 그립니다.<br/>클라이언트부터 DB까지, 주요 컴포넌트와 데이터 흐름을 화이트보드에 표현해요.',
          illustrationType: 'explore'
        },
        {
          label: 'Phase 3',
          title: '🔬 Deep Dive',
          description: '핵심 부분을 <span style="color: #FFD700;">깊게 파고듭니다</span>.<br/>DB 스키마? Push vs Pull? 동시성 제어? 가장 중요한 1-2개를 집중 설계해요.',
          illustrationType: 'problem'
        },
        {
          label: 'Phase 4',
          title: '⚡ 확장성 & 병목',
          description: '<span style="color: #82AAFF;">10배 증가</span>를 대비합니다.<br/>어디가 먼저 터질까? 용량은 얼마나 필요할까? 병목을 찾고 해결책을 모색해요.',
          illustrationType: 'review'
        },
        {
          label: 'Phase 5',
          title: '💬 회고',
          description: '오늘 배운 것을 <span style="color: #C3E88D;">정리하고 내면화</span>합니다.<br/>잘한 점, 아쉬운 점, 다음 시도를 나누며 지속적으로 개선해요.',
          illustrationType: 'grow'
        }
      ]
    }
  }
};
