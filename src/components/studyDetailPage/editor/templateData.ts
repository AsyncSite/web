// 스터디 템플릿 데이터
// 각 섹션별로 하드코딩되어 있던 데이터를 중앙화

export interface StudyTemplate {
  id: string;
  name: string;
  sections: {
    hero?: {
      title: string;
      subtitle: string;
      description: string;
      buttonText: string;
      buttonLink: string;
      backgroundImage: string;
      infoBox?: {
        header: string;
        items: Array<{
          icon: string;
          text: string;
        }>;
      };
    };
    faq?: Array<{
      question: string;
      answer: string;
    }>;
    experience?: {
      title: string;
      items: Array<{
        icon: string;
        title: string;
        description: string;
      }>;
    };
    howWeRoll?: {
      title: string;
      items: Array<{
        icon: string;
        title: string;
        description: string;
        details?: Array<{
          label: string;
          value: string;
        }>;
      }>;
    };
    journey?: {
      title: string;
      items: Array<{
        week: string;
        title: string;
        description: string;
        assignments?: string[];
      }>;
    };
    review?: {
      title: string;
      subtitle: string;
      items: Array<{
        author: string;
        role?: string;
        rating: number;
        date: string;
        text: string;
        helpful?: number;
      }>;
    };
    members?: {
      title: string;
      subtitle: string;
      members: Array<{
        name: string;
        role: string;
        bio: string;
        image: string;
        github?: string;
        linkedin?: string;
        tags?: string[];
      }>;
    };
  };
}

// 알고리즘 스터디 템플릿 (테코테코 - 복구된 고품질 데이터)
export const algorithmTemplate: StudyTemplate = {
  id: 'algorithm',
  name: '알고리즘 스터디 템플릿',
  sections: {
    hero: {
      title: '💯 코테 스터디<br/>테코테코',
      subtitle: '변화 속에서<br/><span class="highlight">변치 않는 ____를 찾다</span>',
      description: '기술 변화 속 흔들리지 않는 개발자 사고의 뿌리를 탐구하고, 단순한 코딩 테스트를 넘어 자료구조와 알고리즘의 본질에 Deep Dive합니다.',
      buttonText: '참가 신청하기',
      buttonLink: '#apply',
      backgroundImage: '/images/tecoteco/profile1.svg',
      infoBox: {
        header: '함께 성장할 용기',
        items: [
          {
            icon: '💡',
            text: '기술 변화 속 흔들리지 않는 <span class="subtle-highlight" style="color: rgb(130, 170, 255)">개발자 사고의 뿌리</span>를 탐구해요.'
          },
          {
            icon: '📚',
            text: '단순한 코딩 테스트 넘어, 자료구조와 알고리즘의 <span class="highlight" style="color: rgb(255, 234, 0)">본질에 Deep Dive</span> 해요.'
          },
          {
            icon: '🤝',
            text: '서로의 질문이 해답이 되고, <span class="subtle-highlight" style="color: rgb(130, 170, 255)">함께 성장</span>하는 시너지를 경험해요.'
          }
        ]
      }
    },
    faq: [
      {
        question: '스터디 난이도가 어떻게 되나요?',
        answer: '중급 수준의 알고리즘 문제를 다룹니다. 기본적인 자료구조(배열, 리스트, 스택, 큐)를 이해하고 있다면 참여 가능합니다.'
      },
      {
        question: '온라인으로만 진행되나요?',
        answer: '네, 100% 온라인으로 진행됩니다. 매주 화요일 저녁 8시에 Zoom을 통해 만나며, Discord로 일상적인 소통을 합니다.'
      },
      {
        question: '스터디 자료는 제공되나요?',
        answer: '매주 선별된 문제 리스트와 풀이 접근법 가이드를 제공합니다. 또한 핵심 개념 정리 노트도 함께 공유됩니다.'
      },
      {
        question: '참가비가 있나요?',
        answer: '월 3만원의 참가비가 있으며, 이는 스터디 운영(Zoom, 자료 제작 등)과 우수 참여자 시상에 사용됩니다.'
      },
      {
        question: '중도 탈퇴가 가능한가요?',
        answer: '개인 사정으로 중도 탈퇴는 가능하나, 해당 월의 참가비는 환불되지 않습니다. 2주 전 사전 공지를 부탁드립니다.'
      }
    ],
    experience: {
      title: '알고리즘 스터디 경험',
      items: [
        {
          icon: '🎯',
          title: '목표 설정',
          description: '개인별 맞춤 목표를 설정하고 체계적으로 관리합니다. 코딩 테스트 합격부터 알고리즘 대회 입상까지, 각자의 목표를 향해 함께 나아갑니다.'
        },
        {
          icon: '💻',
          title: '문제 풀이',
          description: '매주 엄선된 5-7개의 문제를 풀고 다양한 접근법을 공유합니다. 단순 정답이 아닌, 사고 과정과 최적화 방법을 함께 학습합니다.'
        },
        {
          icon: '🗣️',
          title: '코드 리뷰',
          description: '서로의 코드를 리뷰하며 더 나은 해법을 찾아갑니다. 시간 복잡도, 공간 복잡도, 가독성 측면에서 개선점을 논의합니다.'
        },
        {
          icon: '📚',
          title: '개념 학습',
          description: '알고리즘의 이론적 배경과 실제 적용 사례를 학습합니다. DP, 그래프, 그리디 등 핵심 알고리즘을 깊이 있게 다룹니다.'
        },
        {
          icon: '🏆',
          title: '모의 테스트',
          description: '실제 코딩 테스트와 동일한 환경에서 모의고사를 진행합니다. 시간 관리와 문제 선택 전략을 실전처럼 연습합니다.'
        },
        {
          icon: '🤝',
          title: '스터디 네트워킹',
          description: '같은 목표를 가진 동료들과 네트워크를 형성합니다. 취업 정보 공유, 멘토링, 그리고 지속적인 성장 동반자를 만나게 됩니다.'
        }
      ]
    },
    howWeRoll: {
      title: '우리가 굴러가는 방식',
      items: [
        {
          icon: '📅',
          title: '정기 모임',
          description: '매주 화요일 저녁 8시, 2시간 동안 온라인으로 만납니다.',
          details: [
            { label: '시간', value: '매주 화요일 20:00-22:00' },
            { label: '장소', value: 'Zoom 온라인' },
            { label: '진행', value: '문제 리뷰 + 개념 학습' }
          ]
        },
        {
          icon: '📝',
          title: '과제 & 피드백',
          description: '주 5문제를 풀고, 상세한 풀이를 작성하여 공유합니다.',
          details: [
            { label: '문제 수', value: '주 5-7문제' },
            { label: '난이도', value: '실버~골드' },
            { label: '제출', value: 'GitHub PR' }
          ]
        },
        {
          icon: '👥',
          title: '페어 프로그래밍',
          description: '매주 다른 파트너와 함께 문제를 풀며 사고를 확장합니다.',
          details: [
            { label: '방식', value: '로테이션' },
            { label: '시간', value: '주 1회 1시간' },
            { label: '도구', value: 'VS Code Live Share' }
          ]
        },
        {
          icon: '🎯',
          title: '실전 모의고사',
          description: '월 1회 실제 코테와 동일한 환경에서 모의고사를 진행합니다.',
          details: [
            { label: '주기', value: '월 1회' },
            { label: '시간', value: '2-3시간' },
            { label: '환경', value: '프로그래머스/백준' }
          ]
        }
      ]
    },
    journey: {
      title: '12주 여정',
      items: [
        {
          week: '1-2주차',
          title: '기초 다지기',
          description: '자료구조와 기본 알고리즘 복습',
          assignments: [
            '배열, 문자열 조작 마스터',
            '시간 복잡도 분석 연습',
            '기초 정렬 알고리즘 구현'
          ]
        },
        {
          week: '3-4주차',
          title: '탐색과 정렬',
          description: '효율적인 탐색과 정렬 알고리즘 학습',
          assignments: [
            '이진 탐색 완벽 이해',
            '퀵소트, 머지소트 구현',
            'Two Pointer, Sliding Window'
          ]
        },
        {
          week: '5-6주차',
          title: '자료구조 심화',
          description: '스택, 큐, 트리, 그래프 마스터',
          assignments: [
            '스택/큐 응용 문제',
            '트리 순회와 탐색',
            '그래프 표현과 기초 탐색'
          ]
        },
        {
          week: '7-8주차',
          title: '그래프 알고리즘',
          description: 'DFS, BFS와 최단 경로 알고리즘',
          assignments: [
            'DFS/BFS 완벽 구현',
            '다익스트라, 벨만-포드',
            '위상 정렬과 사이클 탐지'
          ]
        },
        {
          week: '9-10주차',
          title: '동적 계획법',
          description: 'DP의 원리와 다양한 적용',
          assignments: [
            'Top-down vs Bottom-up',
            '대표 DP 패턴 학습',
            '최적화 문제 해결'
          ]
        },
        {
          week: '11-12주차',
          title: '실전 준비',
          description: '기업 코딩 테스트 대비',
          assignments: [
            '기업별 기출 문제 풀이',
            '시간 관리 전략 수립',
            '최종 모의고사 및 회고'
          ]
        }
      ]
    },
    review: {
      title: '참여자 후기',
      subtitle: '함께 성장한 동료들의 이야기',
      items: [
        {
          author: '김개발',
          role: '네이버 입사',
          rating: 5,
          date: '2024.10',
          text: '체계적인 커리큘럼과 동료들의 열정 덕분에 목표했던 기업에 합격할 수 있었습니다. 특히 페어 프로그래밍을 통해 다양한 사고 방식을 배울 수 있었던 것이 큰 도움이 되었습니다.',
          helpful: 42
        },
        {
          author: '박코딩',
          role: '카카오 입사',
          rating: 5,
          date: '2024.09',
          text: '혼자 공부할 때는 쉽게 포기했던 어려운 문제들도 스터디원들과 함께라면 해결할 수 있었습니다. 서로 격려하고 응원하는 분위기가 정말 좋았어요.',
          helpful: 38
        },
        {
          author: '이알고',
          role: '토스 입사',
          rating: 5,
          date: '2024.08',
          text: '단순히 문제를 푸는 것을 넘어서 알고리즘의 본질을 이해하게 되었습니다. 실무에서도 더 효율적인 코드를 작성할 수 있게 되었어요.',
          helpful: 35
        },
        {
          author: '최로직',
          role: '쿠팡 입사',
          rating: 5,
          date: '2024.07',
          text: '모의 테스트가 정말 큰 도움이 되었습니다. 실제 시험장에서도 떨지 않고 실력을 발휘할 수 있었어요. 스터디 덕분에 자신감을 얻었습니다.',
          helpful: 31
        }
      ]
    },
    members: {
      title: '스터디 멤버',
      subtitle: '함께 성장하는 동료들',
      members: [
        {
          name: '홍길동',
          role: '스터디 리더',
          bio: '3년차 백엔드 개발자입니다. 알고리즘을 통해 문제 해결 능력을 기르고 있습니다.',
          image: '/images/members/member1.jpg',
          github: 'https://github.com/honggildong',
          linkedin: 'https://linkedin.com/in/honggildong',
          tags: ['Python', 'Algorithm', 'Backend']
        },
        {
          name: '김철수',
          role: '스터디원',
          bio: '프론트엔드 개발을 공부하며 알고리즘 실력을 키우고 있습니다.',
          image: '/images/members/member2.jpg',
          github: 'https://github.com/kimcs',
          tags: ['JavaScript', 'React', 'Algorithm']
        },
        {
          name: '이영희',
          role: '스터디원',
          bio: '컴퓨터공학 전공 4학년입니다. 대기업 코딩 테스트 준비중입니다.',
          image: '/images/members/member3.jpg',
          github: 'https://github.com/leeyh',
          tags: ['Java', 'Spring', 'Algorithm']
        }
      ]
    }
  }
};

// 템플릿 목록
export const studyTemplates: StudyTemplate[] = [
  algorithmTemplate,
  // 추후 다른 템플릿 추가 가능
];

// 템플릿 가져오기 함수
export function getTemplateById(id: string): StudyTemplate | undefined {
  return studyTemplates.find(template => template.id === id);
}

// 템플릿 이름 목록 가져오기
export function getTemplateOptions(): Array<{ value: string; label: string }> {
  return studyTemplates.map(template => ({
    value: template.id,
    label: template.name
  }));
}