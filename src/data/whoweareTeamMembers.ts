// Team member data
export interface WhoWeAreMemberData {
  id: string;
  name: string;
  initials: string;
  role: string;
  quote: string;
  story: string;
  color: string;
  darkColor: string;
  github?: string;
  position: { x: number; y: number; z: number };
  profileImage?: string;
}

export const whoweareTeamMembers: WhoWeAreMemberData[] = [
  {
    id: 'rene-choi',
    name: 'RENE CHOI',
    initials: 'RC',
    role: 'Visionary Builder\n& Product Architect',
    quote: '"결국,\n세상은 만드는 사람들의 것이라고 믿어요."',
    story: 'AsyncSite의 비전을 세우고 아키텍처를 설계하며, 전체 여정의 지도를 그리고 있어요.\n\n머릿속 아이디어가 코드가 되고, 코드가 살아있는 서비스가 되는 순간, 그 순간의 희열을 사랑해요.\n\n막연한 성장에 대한 불안감 대신, 치열하게 몰입하고 단단하게 성장하는 즐거움. 그 값진 경험을 더 많은 동료들과 만들어가고 싶어요.',
    color: '#6366f1',
    darkColor: '#4f46e5',
    position: { x: -4, y: 0, z: 3 },
    profileImage: '/images/face/rene.png'
  },
  {
    id: 'jinwoo-cho',
    name: '진우 조',
    initials: 'JC',
    role: 'System Engineer',
    quote: '"코드는 단순하게, 생각은 깊게"',
    story: '복잡한 문제를 단순하게 풀어내는 것이 진정한 엔지니어링이라고 믿습니다.',
    color: '#f472b6',
    darkColor: '#e11d48',
    position: { x: 4, y: 0, z: 3 },
    profileImage: '/images/face/KrongDev.png'
  },
  {
    id: 'mihyun-park',
    name: '미현 박',
    initials: 'MP',
    role: 'Experience Designer',
    quote: '"사용자의 미소가 최고의 디자인"',
    story: '기술과 인간 사이의 따뜻한 연결고리를 만드는 것이 저의 역할입니다.',
    color: '#C3E88D',
    darkColor: '#a3c76d',
    position: { x: -4, y: 0, z: -3 },
    profileImage: '/images/face/vvoohhee.png'
  },
  {
    id: 'geon-lee',
    name: 'GEON LEE',
    initials: 'GL',
    role: 'Connection Engineer',
    quote: '"데이터 속에 숨은 이야기를 찾아서"',
    story: '숫자 뒤에 숨은 인사이트로 더 나은 결정을 돕는 것이 제 일입니다.',
    color: '#f87171',
    darkColor: '#dc2626',
    position: { x: 4, y: 0, z: -3 },
    profileImage: '/images/face/kdelay.png'
  },
  {
    id: 'jiyeon-kim',
    name: '지연 김',
    initials: 'JK',
    role: 'Growth Path Builder',
    quote: '"함께 성장하는 것이 진짜 성장"',
    story: '개발자들이 외롭지 않게, 서로의 성장을 응원하는 공간을 만들어갑니다.',
    color: '#34d399',
    darkColor: '#10b981',
    position: { x: 0, y: 0, z: 5 },
    profileImage: '/images/face/vvoohhee.png'
  },
  {
    id: 'dongmin-cha',
    name: '차동민',
    initials: 'DC',
    role: 'Platform Engineer',
    quote: '"견고한 기반 위에 혁신을 쌓는다"',
    story: '안정적인 시스템 위에서만 진정한 혁신이 가능하다고 믿습니다.',
    color: '#f59e0b',
    darkColor: '#d97706',
    position: { x: 0, y: 0, z: -5 },
    profileImage: '/images/face/kdelay.png'
  }
];