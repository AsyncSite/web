import { StudyTemplate } from './types';
import { ReviewTagCategory } from '../../../types/reviewTags';

export const algorithmTemplate: StudyTemplate = {
  name: '알고리즘 스터디',
  icon: '💻',
  color: {
    primary: '#C3E88D',
    secondary: '#82AAFF',
    gradient: 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))'
  },
  sections: {
    hero: {
      title: '💯 코테 스터디<br/>테코테코',
      subtitle: '변화 속에서<br/><span class="highlight">변치 않는 ____를 찾다</span>',
      tagHeader: '테코테코와 함께하는 여정',
      features: [
        {
          icon: '🚀',
          title: '체계적인 커리큘럼',
          description: '기초부터 심화까지 단계별 학습'
        },
        {
          icon: '💪',
          title: '실전 문제 풀이',
          description: '매주 새로운 도전과 성장'
        },
        {
          icon: '🤝',
          title: '함께하는 성장',
          description: '서로 배우고 나누는 커뮤니티'
        }
      ]
    },
    faq: {
      tagHeader: '자주 묻는 질문',
      title: '궁금한 점이 있으신가요?',
      subtitle: '테코테코 스터디에 대해 자주 묻는 질문들을 모았습니다',
      faqs: [
        {
          id: 'algo-1',
          question: '프로그래밍을 처음 시작하는데 참여할 수 있나요?',
          answer: '네, 물론입니다! 테코테코는 기초부터 차근차근 학습할 수 있도록 커리큘럼이 구성되어 있습니다. 파이썬이나 자바 기본 문법만 알고 계시다면 충분히 따라오실 수 있어요.'
        },
        {
          id: 'algo-2',
          question: '매주 시간 투자는 얼마나 필요한가요?',
          answer: '주 1회 2시간 정기 모임과 개인 학습 시간 3-4시간 정도가 필요합니다. 문제 난이도에 따라 달라질 수 있지만, 꾸준히 참여하시는 것이 가장 중요해요!'
        },
        {
          id: 'algo-3',
          question: '어떤 문제들을 풀게 되나요?',
          answer: '백준, 프로그래머스, 리트코드의 엄선된 문제들을 단계별로 풀어봅니다. 기업 코딩테스트 기출문제도 다루며, 실전 감각을 기를 수 있습니다.'
        },
        {
          id: 'algo-4',
          question: '온라인으로만 진행되나요?',
          answer: '기본적으로 온라인(Discord)으로 진행되며, 월 1회 오프라인 모임도 있습니다. 오프라인 참여는 선택사항이니 부담 갖지 마세요!'
        },
        {
          id: 'algo-5',
          question: '중간에 따라가기 힘들면 어떻게 하나요?',
          answer: '걱정하지 마세요! 스터디원들이 서로 도와가며 함께 성장합니다. 어려운 문제는 함께 고민하고, 이해될 때까지 설명해드립니다. 포기하지 않는 것이 중요해요.'
        },
        {
          id: 'algo-6',
          question: '스터디 비용은 어떻게 되나요?',
          answer: '월 2만원의 스터디 운영비가 있습니다. 이는 플랫폼 이용료, 자료 제작비, 오프라인 모임 공간 대여 등에 사용됩니다.'
        }
      ]
    },
    review: {
      data: {
        enabled: true,
        tagHeader: '솔직한 후기',
        title: '가장 진솔한 이야기, <br /> 멤버들의 목소리 🗣️',
        subtitle: '숫자와 코드만으로는 설명할 수 없는 <span class="highlight">우리 모임의 진짜 가치</span>를 들어보세요.',
        showStats: false,
        displayCount: 3,
        sortBy: 'latest',
        showKeywords: true,
        keywords: [
          '😌 편안한 분위기',
          '💥 사고의 확장',
          '🤗 배려왕 멤버',
          '🥳 즐거운 분위기',
          '📝 꼼꼼한 코드 리뷰',
          '👩‍💻 실전 코딩',
          '🧠 논리적 사고력',
          '🗣️ 커뮤니케이션 역량',
          '🤖 AI 활용',
          '🌱 함께 성장'
        ]
      },
      reviews: [
        {
          id: 'standard-1',
          userId: 'user1',
          userName: '익명1',
          rating: 5,
          title: '인생의 의미',
          content: '누가 시킨것도 ..부자가 되는 것도 아닌데 코딩테스트 문제를 풀고 바쁜 일상을 탈탈 털어 진지한 이야기를 나눈 소중한 경험',
          createdAt: '2024-02-15',
          attendCount: 3,
          helpfulCount: 2,
          tags: [
            { id: 'growth', emoji: '😃', label: '성장', category: ReviewTagCategory.GROWTH, description: '' },
            { id: 'spark', emoji: '✨', label: '영감', category: ReviewTagCategory.GROWTH, description: '' },
            { id: 'passion', emoji: '🔥', label: '열정', category: ReviewTagCategory.MENTORING, description: '' }
          ],
          timeAgo: '6달 전'
        },
        {
          id: 'standard-2',
          userId: 'user2',
          userName: '익명2',
          rating: 5,
          title: 'Better together !',
          content: '혼자서는 엄두도 못 냈던 어려운 알고리즘 문제들! 스터디 모임에서 함께 고민하고 해결하며 완독하는 뿌듯함을 느꼈습니다. 함께라면 우린 해낼 수 있어요!',
          createdAt: '2023-08-10',
          attendCount: 10,
          helpfulCount: 1,
          tags: [
            { id: 'teamwork', emoji: '🧡', label: '팀워크', category: ReviewTagCategory.COMMUNITY, description: '' },
            { id: 'love', emoji: '😍', label: '사랑', category: ReviewTagCategory.ATMOSPHERE, description: '' },
            { id: 'happy', emoji: '😃', label: '행복', category: ReviewTagCategory.ATMOSPHERE, description: '' }
          ],
          timeAgo: '2년 전'
        },
        {
          id: 'standard-3',
          userId: 'user3',
          userName: '김코딩',
          rating: 5,
          title: '알고리즘 실력이 확실히 늘었어요',
          content: 'DP, 그래프, BFS/DFS... 막막하기만 했던 알고리즘들이 이제는 패턴이 보이기 시작해요. 매주 금요일이 기다려지는 스터디입니다!',
          createdAt: '2024-10-15',
          attendCount: 8,
          helpfulCount: 5,
          tags: [
            { id: 'skill', emoji: '💪', label: '실력향상', category: ReviewTagCategory.GROWTH, description: '' },
            { id: 'pattern', emoji: '🎯', label: '패턴인식', category: ReviewTagCategory.LEARNING, description: '' },
            { id: 'excited', emoji: '🎉', label: '기대감', category: ReviewTagCategory.ATMOSPHERE, description: '' }
          ],
          timeAgo: '1달 전'
        },
        {
          id: 'standard-4',
          userId: 'user4',
          userName: '박개발',
          rating: 5,
          title: '코딩테스트 합격했습니다!',
          content: '스터디에서 배운 문제 해결 접근법과 시간 복잡도 최적화 덕분에 드디어 코딩테스트를 통과했어요. 함께 고민해주신 모든 분들께 감사드립니다.',
          createdAt: '2024-11-20',
          attendCount: 12,
          helpfulCount: 8,
          tags: [
            { id: 'success', emoji: '🎊', label: '합격', category: ReviewTagCategory.PRACTICAL, description: '' },
            { id: 'grateful', emoji: '🙏', label: '감사', category: ReviewTagCategory.COMMUNITY, description: '' },
            { id: 'optimization', emoji: '⚡', label: '최적화', category: ReviewTagCategory.LEARNING, description: '' }
          ],
          timeAgo: '2주 전'
        }
      ]
    },
    leader: {
      name: '김개발',
      profileImage: '/images/face/leader-example.png',
      role: '실패를 두려워하지 않는 10년차 개발자',
      motivation: '혼자 공부하다 막막했던 순간들을 기억합니다. <strong>함께라면 더 멀리 갈 수 있다</strong>는 믿음으로 이 공간을 만들었어요.',
      philosophy: '정답을 알려주기보다 <strong>스스로 생각하는 힘</strong>을 기르는 것을 중요하게 생각합니다.',
      welcomeMessage: '완벽하지 않아도 괜찮아요. <strong>꾸준히 노력하는 것</strong>이 가장 중요합니다. 편하게 질문하고, 자유롭게 의견을 나누어요! 🚀',
      expertise: ['도전', '성장', '공유'],
      since: '2022년 1월부터',
      totalStudies: 5,
      totalMembers: 67,
      email: 'leader@example.com',
      github: 'https://github.com/kimdev',
      blog: 'https://kimdev.blog'
    },
    experience: {
      tagHeader: '성장을 위한 스텝',
      title: '알고리즘 스터디를 한다는 건',
      subtitle: '매주 모임을 통해 <span class="highlight">함께 성장</span>해요',
      steps: [
        {
          number: '01',
          title: '문제 선정',
          description: '난이도별로 엄선된 문제를 풀어요'
        },
        {
          number: '02',
          title: '개인 풀이',
          description: '각자 문제를 풀고 접근법을 정리해요'
        },
        {
          number: '03',
          title: '코드 리뷰',
          description: '서로의 코드를 보며 배워요'
        },
        {
          number: '04',
          title: '개선하기',
          description: '더 나은 알고리즘을 함께 고민해요'
        }
      ]
    },
    journey: {
      tagHeader: '12주 여정',
      title: '체계적인 커리큘럼',
      subtitle: '기초부터 심화까지 <span class="highlight">단계별 성장</span>',
      milestones: [
        {
          week: '1-3주',
          title: '기초 다지기',
          description: '자료구조와 기본 알고리즘',
          topics: ['배열/문자열', '스택/큐', '정렬']
        },
        {
          week: '4-6주',
          title: '핵심 알고리즘',
          description: 'DFS/BFS와 그래프 탐색',
          topics: ['그래프', 'DFS/BFS', '최단경로']
        },
        {
          week: '7-9주',
          title: '고급 알고리즘',
          description: 'DP와 그리디 알고리즘',
          topics: ['DP', '그리디', '이분탐색']
        },
        {
          week: '10-12주',
          title: '실전 대비',
          description: '기업 코딩테스트 기출문제',
          topics: ['카카오', '네이버', '삼성']
        }
      ]
    },
    howWeRoll: {
      tagHeader: '운영 방식',
      title: '우리가 함께하는 방법',
      subtitle: '효율적이고 <span class="highlight">지속 가능한</span> 스터디',
      schedules: [
        {
          day: '매주 금요일',
          time: '저녁 8시-10시',
          description: '온라인 모임 (Discord)',
          icon: '🖥️'
        },
        {
          day: '주중',
          time: '자유시간',
          description: '개인 문제 풀이',
          icon: '✏️'
        },
        {
          day: '월 1회',
          time: '토요일 오후',
          description: '오프라인 모임',
          icon: '☕'
        }
      ]
    },
    members: {
      tagHeader: '함께하는 사람들',
      title: '열정적인 동료들',
      subtitle: '서로 <span class="highlight">격려하며 성장</span>하는 팀',
      members: [
        {
          name: '김알고',
          role: '스터디장',
          bio: '함께 성장하는 것을 좋아하는 개발자',
          profileImage: '/images/members/member1.png'
        },
        {
          name: '이코딩',
          role: '부스터디장',
          bio: '문제 해결을 즐기는 알고리즘 마니아',
          profileImage: '/images/members/member2.png'
        },
        {
          name: '박프로',
          role: '멤버',
          bio: '꾸준함이 최고의 실력이라 믿습니다',
          profileImage: '/images/members/member3.png'
        }
      ]
    },
    richText: {
      title: '추가 정보',
      content: '<h3>스터디 규칙</h3><p>• 매주 3문제 이상 풀기<br/>• 코드 리뷰 필수 참여<br/>• 무단 결석 3회시 퇴출</p><h3>준비물</h3><p>• 노트북<br/>• 열정<br/>• 함께 성장하고자 하는 마음</p>'
    }
  }
};