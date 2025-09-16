import { StudyTemplate } from './types';
import { ReviewTagCategory } from '../../../types/reviewTags';

export const englishTemplate: StudyTemplate = {
  name: '영어 스터디',
  icon: '🌎',
  color: {
    primary: '#88D8B0',
    secondary: '#FFCC5C',
    gradient: 'linear-gradient(135deg, rgba(136, 216, 176, 0.1), rgba(255, 204, 92, 0.1))'
  },
  sections: {
    hero: {
      title: '🌎 English Speaking<br/>Club',
      subtitle: '자신감 있는 영어로<br/><span class="highlight">세계와 소통하기</span>',
      tagHeader: 'Speak with Confidence',
      features: [
        {
          icon: '🗣️',
          title: '실전 회화',
          description: '일상 주제로 자연스럽게'
        },
        {
          icon: '🎯',
          title: '맞춤형 학습',
          description: '개인 레벨에 맞는 진행'
        },
        {
          icon: '🌍',
          title: '글로벌 마인드',
          description: '다양한 문화 이해하기'
        }
      ]
    },
    faq: {
      tagHeader: 'English Guide',
      title: '영어 스터디 참여 안내',
      subtitle: '편안하게 시작하는 영어 회화',
      faqs: [
        {
          id: 'eng-1',
          question: '영어를 잘 못해도 참여할 수 있나요?',
          answer: '네! 레벨별로 그룹을 나누어 진행하므로 부담 없이 참여하실 수 있습니다. 실수를 두려워하지 않는 분위기에요.'
        },
        {
          id: 'eng-2',
          question: '어떤 주제로 대화하나요?',
          answer: '일상, 취미, 여행, 문화, 시사 등 다양한 주제를 다룹니다. 매주 새로운 토픽으로 흥미롭게 진행해요.'
        },
        {
          id: 'eng-3',
          question: '원어민 선생님이 있나요?',
          answer: '월 1회 원어민 게스트와 함께하는 시간이 있습니다. 평소에는 한국인 멤버들끼리 편안하게 연습해요.'
        }
      ]
    },
    review: {
      data: {
        enabled: true,
        tagHeader: 'Reviews',
        title: 'Speaking Journey, <br /> 멤버들의 성장 스토리 🗣️',
        subtitle: '영어로 열어가는 <span class="highlight">새로운 세계</span>를 경험하세요.',
        showStats: false,
        displayCount: 3,
        sortBy: 'latest',
        showKeywords: true,
        keywords: [
          '🗣️ 스피킹 향상',
          '🌍 글로벌',
          '💪 자신감',
          '🎯 실전 영어',
          '📚 어휘력',
          '👥 네트워킹'
        ]
      },
      reviews: [
        {
          id: 'eng-r1',
          userId: 'speaker1',
          userName: '영어러버',
          rating: 5,
          title: '드디어 영어로 말하는게 편해졌어요',
          content: '매주 꾸준히 연습하니 이제는 외국인을 만나도 당황하지 않아요. 실수해도 괜찮다는 분위기가 정말 좋았습니다.',
          createdAt: '2024-10-20',
          attendCount: 15,
          helpfulCount: 7,
          tags: [
            { id: 'confidence', emoji: '💪', label: '자신감', category: ReviewTagCategory.GROWTH, description: '' },
            { id: 'speaking', emoji: '🗣️', label: '스피킹', category: ReviewTagCategory.LEARNING, description: '' }
          ],
          timeAgo: '1달 전'
        }
      ]
    },
    leader: {
      name: '최글로벌',
      profileImage: '/images/face/english-leader.png',
      role: '함께 성장하는 영어 멘토',
      motivation: '영어는 도구입니다. <strong>소통의 즐거움</strong>을 함께 나누고 싶어요.',
      philosophy: '실수는 성장의 증거! <strong>편안한 환경</strong>에서 자유롭게 연습하는 것이 중요해요.',
      welcomeMessage: "Don't be shy! <strong>Let's speak English together</strong> and have fun! 🌎",
      expertise: ['소통', '격려', '성장'],
      since: '2022년 9월부터',
      totalStudies: 6,
      totalMembers: 78,
      email: 'english@example.com',
      blog: 'https://englishclub.blog'
    }
  }
};