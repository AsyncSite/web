import { StudyTemplate } from './types';
import { ReviewTagCategory } from '../../../types/reviewTags';

export const bookclubTemplate: StudyTemplate = {
  name: '북클럽 스터디',
  icon: '📚',
  color: {
    primary: '#FFB3BA',
    secondary: '#FFDFBA',
    gradient: 'linear-gradient(135deg, rgba(255, 179, 186, 0.1), rgba(255, 223, 186, 0.1))'
  },
  sections: {
    hero: {
      title: '📚 함께 읽는<br/>북클럽',
      subtitle: '한 권의 책에서 시작되는<br/><span class="highlight">깊이 있는 대화</span>',
      tagHeader: '책과 함께하는 성장',
      features: [
        {
          icon: '📖',
          title: '다양한 장르',
          description: '소설부터 인문학까지 폭넓은 독서'
        },
        {
          icon: '💬',
          title: '깊이 있는 토론',
          description: '서로 다른 관점을 나누는 시간'
        },
        {
          icon: '✨',
          title: '꾸준한 독서 습관',
          description: '매달 한 권씩 완독하는 즐거움'
        }
      ]
    },
    faq: {
      tagHeader: '북클럽 가이드',
      title: '독서 모임이 처음이신가요?',
      subtitle: '북클럽에 대한 모든 궁금증을 해결해드립니다',
      faqs: [
        {
          id: 'book-1',
          question: '책을 많이 읽지 않는데 참여할 수 있나요?',
          answer: '물론입니다! 북클럽의 목적이 바로 독서 습관을 만드는 것입니다. 한 달에 한 권씩 함께 읽으며 천천히 독서 근육을 키워나가요.'
        },
        {
          id: 'book-2',
          question: '책은 어떻게 선정하나요?',
          answer: '매달 멤버들이 추천한 책 중에서 투표로 선정합니다. 소설, 에세이, 자기계발서, 인문학 등 다양한 장르를 균형 있게 읽으려고 노력해요.'
        },
        {
          id: 'book-3',
          question: '모임은 어떻게 진행되나요?',
          answer: '월 2회 온라인 모임이 기본이며, 책을 반씩 나누어 읽고 토론합니다. 각자 인상 깊었던 구절과 생각을 나누는 편안한 분위기에요.'
        },
        {
          id: 'book-4',
          question: '책을 다 읽지 못했는데도 참여할 수 있나요?',
          answer: '네, 가능합니다! 읽은 부분까지만이라도 함께 이야기 나누어요. 다른 분들의 이야기를 들으며 책에 대한 흥미를 더 느끼실 수 있을 거예요.'
        },
        {
          id: 'book-5',
          question: '독서 노트를 꼭 작성해야 하나요?',
          answer: '필수는 아니지만 권장합니다. 간단한 메모라도 좋아요. 나중에 돌아봤을 때 큰 자산이 되고, 토론할 때도 도움이 됩니다.'
        },
        {
          id: 'book-6',
          question: '참가비가 있나요?',
          answer: '월 1만원의 운영비가 있습니다. 온라인 플랫폼 이용료와 연말 북파티 비용으로 사용됩니다. 책 구입비는 별도입니다.'
        }
      ]
    },
    review: {
      data: {
        enabled: true,
        tagHeader: '독후감',
        title: '책과 함께한 순간들, <br /> 독자들의 이야기 📖',
        subtitle: '함께 읽고 나눈 <span class="highlight">생생한 독서 경험</span>을 들어보세요.',
        showStats: false,
        displayCount: 3,
        sortBy: 'latest',
        showKeywords: true,
        keywords: [
          '📚 깊이 있는 토론',
          '💡 새로운 관점',
          '☕ 편안한 모임',
          '🎯 핵심 정리',
          '🌈 다양한 해석',
          '✨ 영감 충전',
          '🤝 존중하는 대화',
          '📝 체계적인 정리',
          '🎨 창의적 사고',
          '🌱 지적 성장'
        ]
      },
      reviews: [
        {
          id: 'book-1',
          userId: 'reader1',
          userName: '독서광',
          rating: 5,
          title: '혼자서는 절대 못 읽었을 책',
          content: '평소 어렵다고 생각했던 철학서를 북클럽에서 함께 읽으니 이해가 되더라구요. 다른 분들의 해석을 들으며 책의 깊이를 더 느낄 수 있었습니다.',
          createdAt: '2024-11-01',
          attendCount: 5,
          helpfulCount: 7,
          tags: [
            { id: 'depth', emoji: '🌊', label: '깊이', category: ReviewTagCategory.LEARNING, description: '' },
            { id: 'perspective', emoji: '👀', label: '관점', category: ReviewTagCategory.GROWTH, description: '' },
            { id: 'together', emoji: '🤝', label: '함께', category: ReviewTagCategory.COMMUNITY, description: '' }
          ],
          timeAgo: '1달 전'
        },
        {
          id: 'book-2',
          userId: 'reader2',
          userName: '책벌레',
          rating: 5,
          title: '매달 기다려지는 지적 충전 시간',
          content: '한 달에 한 권씩, 부담 없이 읽을 수 있는 속도가 좋아요. 토론 시간에는 미처 생각하지 못했던 부분들을 발견하게 되어 책을 두 번 읽는 느낌입니다.',
          createdAt: '2024-10-15',
          attendCount: 8,
          helpfulCount: 4,
          tags: [
            { id: 'insight', emoji: '💎', label: '통찰', category: ReviewTagCategory.LEARNING, description: '' },
            { id: 'discussion', emoji: '💬', label: '토론', category: ReviewTagCategory.COMMUNITY, description: '' },
            { id: 'joy', emoji: '😊', label: '즐거움', category: ReviewTagCategory.ATMOSPHERE, description: '' }
          ],
          timeAgo: '6주 전'
        },
        {
          id: 'book-3',
          userId: 'reader3',
          userName: '문학소녀',
          rating: 5,
          title: '책 선정부터 토론까지 완벽해요',
          content: '매번 균형 잡힌 책 선정이 인상적이에요. 소설, 에세이, 자기계발서까지 다양하게 읽으며 독서 스펙트럼을 넓힐 수 있었습니다. 진행자님의 토론 리드도 훌륭해요!',
          createdAt: '2024-09-20',
          attendCount: 10,
          helpfulCount: 6,
          tags: [
            { id: 'variety', emoji: '🎨', label: '다양성', category: ReviewTagCategory.LEARNING, description: '' },
            { id: 'leadership', emoji: '👑', label: '리더십', category: ReviewTagCategory.MENTORING, description: '' },
            { id: 'balance', emoji: '⚖️', label: '균형', category: ReviewTagCategory.ORGANIZATION, description: '' }
          ],
          timeAgo: '2달 전'
        },
        {
          id: 'book-4',
          userId: 'reader4',
          userName: '북스타그램',
          rating: 4,
          title: '독서 습관을 만들어준 고마운 모임',
          content: '혼자서는 책을 끝까지 읽기 힘들었는데, 북클럽 덕분에 매달 한 권씩 완독하는 습관이 생겼어요. 다른 멤버들의 독서 노트를 보는 것도 큰 도움이 됩니다.',
          createdAt: '2024-08-30',
          attendCount: 12,
          helpfulCount: 9,
          tags: [
            { id: 'habit', emoji: '📅', label: '습관', category: ReviewTagCategory.GROWTH, description: '' },
            { id: 'complete', emoji: '✅', label: '완독', category: ReviewTagCategory.PRACTICAL, description: '' },
            { id: 'notes', emoji: '📝', label: '노트', category: ReviewTagCategory.LEARNING, description: '' }
          ],
          timeAgo: '3달 전'
        }
      ]
    },
    leader: {
      name: '이독서',
      profileImage: '/images/face/reader-example.png',
      role: '책과 함께 성장하는 평생 독서가',
      motivation: '혼자 읽던 책이 외로웠어요. <strong>함께 읽고 나누면 더 깊이 이해할 수 있다</strong>는 것을 알게 되었습니다.',
      philosophy: '정답 없는 해석을 존중하고, <strong>다양한 관점을 나누는 것</strong>이 독서의 진정한 즐거움이라 생각해요.',
      welcomeMessage: '책을 완독하지 못해도 괜찮아요. <strong>함께 읽는 즐거움</strong>을 느끼는 것이 가장 중요합니다. 편안한 마음으로 오세요! 📚',
      expertise: ['공감', '사색', '나눔'],
      since: '2021년 3월부터',
      totalStudies: 8,
      totalMembers: 92,
      email: 'bookclub@example.com',
      blog: 'https://readwithme.blog'
    },
    experience: {
      tagHeader: '독서 여정',
      title: '함께 읽는다는 것',
      subtitle: '책 한 권이 주는 <span class="highlight">다양한 시선</span>',
      steps: [
        {
          number: '01',
          title: '책 선정',
          description: '투표로 다음 책을 정해요'
        },
        {
          number: '02',
          title: '개인 독서',
          description: '각자의 속도로 읽어요'
        },
        {
          number: '03',
          title: '토론 준비',
          description: '인상 깊은 구절을 메모해요'
        },
        {
          number: '04',
          title: '함께 나누기',
          description: '생각과 느낌을 공유해요'
        }
      ]
    },
    journey: {
      tagHeader: '연간 독서 계획',
      title: '장르별 독서 여행',
      subtitle: '다양한 세계를 <span class="highlight">함께 탐험</span>',
      milestones: [
        {
          week: '1-3월',
          title: '소설의 계절',
          description: '국내외 문학작품',
          topics: ['한국문학', '해외소설', '고전']
        },
        {
          week: '4-6월',
          title: '지식 충전',
          description: '인문학과 과학',
          topics: ['철학', '역사', '과학']
        },
        {
          week: '7-9월',
          title: '자기계발',
          description: '성장과 변화',
          topics: ['습관', '심리학', '경제']
        },
        {
          week: '10-12월',
          title: '에세이',
          description: '삶의 이야기',
          topics: ['여행', '일상', '관계']
        }
      ]
    },
    howWeRoll: {
      tagHeader: '모임 방식',
      title: '편안한 독서 모임',
      subtitle: '부담 없이 <span class="highlight">즐겁게</span> 참여해요',
      schedules: [
        {
          day: '매월 둘째/넷째 토요일',
          time: '오후 2시-4시',
          description: '온라인 토론 (Zoom)',
          icon: '💬'
        },
        {
          day: '매월 1권',
          time: '자유롭게',
          description: '개인 독서',
          icon: '📖'
        },
        {
          day: '분기별 1회',
          time: '주말',
          description: '북카페 오프라인 모임',
          icon: '☕'
        }
      ]
    },
    members: {
      tagHeader: '북클럽 멤버',
      title: '책을 사랑하는 사람들',
      subtitle: '다양한 배경의 <span class="highlight">독서 동료</span>',
      members: [
        {
          name: '최독서',
          role: '북클럽장',
          bio: '책 속에서 세상을 만나는 독서가',
          profileImage: '/images/members/reader1.png'
        },
        {
          name: '김문학',
          role: '운영진',
          bio: '문학으로 삶을 풍요롭게',
          profileImage: '/images/members/reader2.png'
        },
        {
          name: '이에세이',
          role: '멤버',
          bio: '일상을 기록하는 것을 좋아해요',
          profileImage: '/images/members/reader3.png'
        }
      ]
    },
    richText: {
      title: '북클럽 안내',
      content: '<h3>독서 규칙</h3><p>• 한 달에 한 권 완독<br/>• 토론 시 상호 존중<br/>• 스포일러 주의</p><h3>추천 독서법</h3><p>• 메모하며 읽기<br/>• 인상 깊은 구절 기록<br/>• 독서 후 감상 정리</p>'
    }
  }
};