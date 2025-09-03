// 도큐멘토 실시간 활동 알림 목 데이터
export interface ActivityData {
  id: number;
  user: string;
  action: string;
  result: string;
  emoji: string;
  time: string;
}

export const MOCK_ACTIVITIES: ActivityData[] = [
  {
    id: 1,
    user: "김민**",
    action: "네이버 블로그 '서울 맛집 탐방기'",
    result: "가독성 9.2점! 문단 구성 완벽 👏",
    emoji: "🍜",
    time: "방금 전"
  },
  {
    id: 2,
    user: "이서**",
    action: "브런치 에세이 '퇴사 후 일상'",
    result: "감정 전달력 향상 제안 5개 받음",
    emoji: "✍️",
    time: "1분 전"
  },
  {
    id: 3,
    user: "박지**",
    action: "육아 일기 '첫 돌잔치 준비'",
    result: "맞춤법 교정 12개, 문장 다듬기 완료",
    emoji: "👶",
    time: "2분 전"
  },
  {
    id: 4,
    user: "서울에서 누군가",
    action: "IT 기술 블로그 'React 18 마이그레이션'",
    result: "전문 용어 순화 제안으로 이해도 UP",
    emoji: "💻",
    time: "방금 전"
  },
  {
    id: 5,
    user: "정우**",
    action: "티스토리 '제주도 한달살기'",
    result: "제목 임팩트 강화! 조회수 예상 2배",
    emoji: "🏝️",
    time: "3분 전"
  },
  {
    id: 6,
    user: "강남에서 누군가",
    action: "인스타그램 캡션 '카페 추천'",
    result: "해시태그 최적화로 도달률 개선",
    emoji: "☕",
    time: "1분 전"
  },
  {
    id: 7,
    user: "최은**",
    action: "자기소개서 '개발자 지원'",
    result: "임팩트 있는 첫 문장으로 수정 완료",
    emoji: "📄",
    time: "방금 전"
  },
  {
    id: 8,
    user: "한예**",
    action: "유튜브 스크립트 '요리 레시피'",
    result: "말하기 자연스러운 문체로 개선",
    emoji: "🎬",
    time: "2분 전"
  },
  {
    id: 9,
    user: "송파구에서 누군가",
    action: "회사 보고서 '분기 실적 분석'",
    result: "논리 구조 개선, 설득력 8→10점",
    emoji: "📊",
    time: "4분 전"
  },
  {
    id: 10,
    user: "윤하**",
    action: "독후감 '나미야 잡화점의 기적'",
    result: "감상 표현 풍부하게 수정 제안",
    emoji: "📚",
    time: "방금 전"
  },
  {
    id: 11,
    user: "임도**",
    action: "프로젝트 제안서 '스타트업 아이디어'",
    result: "핵심 메시지 강조로 설득력 UP",
    emoji: "🚀",
    time: "1분 전"
  },
  {
    id: 12,
    user: "부산에서 누군가",
    action: "네이버 포스트 '운동 루틴'",
    result: "동기부여 문구 추가로 공감도 상승",
    emoji: "💪",
    time: "3분 전"
  },
  {
    id: 13,
    user: "장미**",
    action: "결혼식 축사 원고",
    result: "감동적인 마무리 문장 제안",
    emoji: "💐",
    time: "방금 전"
  },
  {
    id: 14,
    user: "노원구에서 누군가",
    action: "학술 논문 초록",
    result: "학술적 톤 유지하며 가독성 개선",
    emoji: "🎓",
    time: "2분 전"
  },
  {
    id: 15,
    user: "김태**",
    action: "마케팅 카피 '신제품 런칭'",
    result: "구매 욕구 자극하는 문구로 수정",
    emoji: "🛍️",
    time: "1분 전"
  },
  {
    id: 16,
    user: "대구에서 누군가",
    action: "일기 '오늘 하루 회고'",
    result: "감정 표현 더 솔직하게 개선",
    emoji: "📔",
    time: "4분 전"
  },
  {
    id: 17,
    user: "홍수**",
    action: "이메일 '협업 제안'",
    result: "프로페셔널한 톤으로 격상",
    emoji: "📧",
    time: "방금 전"
  },
  {
    id: 18,
    user: "판교에서 누군가",
    action: "링크드인 프로필",
    result: "키워드 최적화로 검색 노출 UP",
    emoji: "💼",
    time: "2분 전"
  },
  {
    id: 19,
    user: "오현**",
    action: "웹소설 '판타지 프롤로그'",
    result: "몰입감 있는 도입부로 개선",
    emoji: "🗡️",
    time: "3분 전"
  },
  {
    id: 20,
    user: "조은**",
    action: "SNS 광고 문구",
    result: "클릭률 예상 35% 상승",
    emoji: "📱",
    time: "1분 전"
  }
];

// 랜덤 활동 가져오기
export function getRandomActivity(): ActivityData {
  const randomIndex = Math.floor(Math.random() * MOCK_ACTIVITIES.length);
  return MOCK_ACTIVITIES[randomIndex];
}

// 시간 텍스트 다양화
export function getTimeText(): string {
  const times = ["방금 전", "1분 전", "2분 전", "3분 전", "조금 전"];
  return times[Math.floor(Math.random() * times.length)];
}