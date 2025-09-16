import { StudyTemplate } from './types';
import { ReviewTagCategory } from '../../../types/reviewTags';

export const projectTemplate: StudyTemplate = {
  name: '프로젝트 스터디',
  icon: '🚀',
  color: {
    primary: '#B8A7FF',
    secondary: '#FFB7D5',
    gradient: 'linear-gradient(135deg, rgba(184, 167, 255, 0.1), rgba(255, 183, 213, 0.1))'
  },
  sections: {
    hero: {
      title: '🚀 사이드 프로젝트<br/>함께 만들기',
      subtitle: '아이디어를 현실로<br/><span class="highlight">협업의 시너지</span>',
      tagHeader: '함께 만드는 프로젝트',
      features: [
        {
          icon: '💡',
          title: '아이디어 구현',
          description: '상상을 현실로 만드는 과정'
        },
        {
          icon: '🛠️',
          title: '실무 경험',
          description: '협업 프로세스 체험'
        },
        {
          icon: '📈',
          title: '포트폴리오',
          description: '완성된 결과물로 성장 증명'
        }
      ]
    },
    faq: {
      tagHeader: '프로젝트 가이드',
      title: '프로젝트가 처음이신가요?',
      subtitle: '사이드 프로젝트에 대한 모든 것',
      faqs: [
        {
          id: 'proj-1',
          question: '개발 경험이 부족한데 참여할 수 있나요?',
          answer: '물론입니다! 프로젝트를 통해 배우는 것이 가장 빠른 성장 방법입니다. 역할 분담을 통해 각자 수준에 맞는 기여를 할 수 있어요.'
        },
        {
          id: 'proj-2',
          question: '프로젝트 주제는 어떻게 정하나요?',
          answer: '팀원들이 모여 브레인스토밍을 통해 결정합니다. 실용적이면서도 도전적인 주제를 선택하려고 노력해요.'
        },
        {
          id: 'proj-3',
          question: '기간은 얼마나 걸리나요?',
          answer: '보통 2-3개월 정도 진행합니다. MVP 먼저 만들고 점진적으로 기능을 추가해나가는 방식이에요.'
        }
      ]
    },
    review: {
      data: {
        enabled: true,
        tagHeader: '프로젝트 후기',
        title: '완성의 기쁨, <br /> 팀원들의 이야기 🎯',
        subtitle: '함께 만들어낸 <span class="highlight">특별한 경험</span>을 들어보세요.',
        showStats: false,
        displayCount: 3,
        sortBy: 'latest',
        showKeywords: true,
        keywords: [
          '🚀 런칭 성공',
          '👥 팀워크',
          '💡 창의성',
          '📱 실제 서비스',
          '🎨 디자인',
          '🔧 기술 스택'
        ]
      },
      reviews: [
        {
          id: 'proj-r1',
          userId: 'dev1',
          userName: '프로젝트매니저',
          rating: 5,
          title: '실무 경험을 쌓을 수 있었어요',
          content: '회사에서는 경험하기 힘든 전체 개발 프로세스를 경험할 수 있었습니다. 기획부터 배포까지!',
          createdAt: '2024-11-01',
          attendCount: 4,
          helpfulCount: 3,
          tags: [
            { id: 'experience', emoji: '💼', label: '경험', category: ReviewTagCategory.PRACTICAL, description: '' },
            { id: 'process', emoji: '🔄', label: '프로세스', category: ReviewTagCategory.LEARNING, description: '' }
          ],
          timeAgo: '1달 전'
        }
      ]
    },
    leader: {
      name: '박프로젝트',
      profileImage: '/images/face/project-leader.png',
      role: '함께 만드는 즐거움을 아는 개발자',
      motivation: '혼자서는 한계가 있어요. <strong>팀으로 일할 때 더 큰 것</strong>을 만들 수 있습니다.',
      philosophy: '완벽보다는 <strong>완성</strong>을, 경쟁보다는 <strong>협력</strong>을 추구합니다.',
      welcomeMessage: '실패를 두려워하지 마세요. <strong>도전하는 것</strong> 자체가 성장입니다! 🚀',
      expertise: ['협업', '실행', '완성'],
      since: '2023년 6월부터',
      totalStudies: 3,
      totalMembers: 24,
      email: 'project@example.com',
      github: 'https://github.com/projectteam'
    }
  }
};