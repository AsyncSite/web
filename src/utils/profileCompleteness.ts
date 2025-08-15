import { User } from '../types/auth';

export interface ProfileCompletenessResult {
  percentage: number;
  completedFields: string[];
  missingFields: string[];
  nextStep: string;
  message: string;
}

/**
 * 프로필 완성도 계산
 * 매우 구체적인 함수명과 변수명 사용
 */
export function calculateUserProfileCompleteness(user: User | null): ProfileCompletenessResult {
  if (!user) {
    return {
      percentage: 0,
      completedFields: [],
      missingFields: ['name', 'profileImage', 'role', 'quote', 'bio'],
      nextStep: '프로필을 시작해보세요',
      message: '프로필을 작성하고 AsyncSite 커뮤니티에 참여해보세요!'
    };
  }

  // 각 필드별 가중치 정의
  const profileFieldWeights = {
    name: 20,        // 필수 (회원가입 시 입력)
    profileImage: 25, // 시각적 신뢰도
    role: 20,        // 전문성 표현
    quote: 15,       // 개성 표현
    bio: 20          // 스토리텔링
  };

  const completedFields: string[] = [];
  const missingFields: string[] = [];
  let totalScore = 0;

  // name 체크 (필수 필드)
  if (user.name && user.name.trim().length > 0) {
    completedFields.push('name');
    totalScore += profileFieldWeights.name;
  } else {
    missingFields.push('name');
  }

  // profileImage 체크
  if (user.profileImage && user.profileImage.trim().length > 0) {
    completedFields.push('profileImage');
    totalScore += profileFieldWeights.profileImage;
  } else {
    missingFields.push('profileImage');
  }

  // role 체크
  if (user.role && user.role.trim().length > 0) {
    completedFields.push('role');
    totalScore += profileFieldWeights.role;
  } else {
    missingFields.push('role');
  }

  // quote 체크
  if (user.quote && user.quote.trim().length > 0) {
    completedFields.push('quote');
    totalScore += profileFieldWeights.quote;
  } else {
    missingFields.push('quote');
  }

  // bio 체크 (HTML 태그 제거 후 확인)
  if (user.bio && user.bio.trim().length > 0) {
    // 간단한 HTML 태그 제거 (텍스트 내용이 있는지만 확인)
    const textContent = user.bio.replace(/<[^>]*>/g, '').trim();
    if (textContent.length > 0) {
      completedFields.push('bio');
      totalScore += profileFieldWeights.bio;
    } else {
      missingFields.push('bio');
    }
  } else {
    missingFields.push('bio');
  }

  // 다음 단계 메시지 결정
  let nextStep = '';
  let message = '';
  
  if (totalScore === 100) {
    nextStep = '완벽해요!';
    message = '프로필이 모두 완성되었어요! ✨';
  } else if (totalScore >= 60) {
    nextStep = '거의 다 왔어요!';
    message = `${getMissingFieldsMessage(missingFields)}만 추가하면 완성이에요!`;
  } else if (totalScore >= 30) {
    nextStep = '좋아요! 조금만 더 채워볼까요?';
    message = `${getMissingFieldsMessage(missingFields)}를 추가해보세요`;
  } else {
    nextStep = '프로필을 시작해보세요!';
    message = '프로필을 완성하면 더 많은 기회가 열려요';
  }

  return {
    percentage: totalScore,
    completedFields,
    missingFields,
    nextStep,
    message
  };
}

/**
 * 누락된 필드 메시지 생성
 */
function getMissingFieldsMessage(missingFields: string[]): string {
  const fieldNames: Record<string, string> = {
    name: '이름',
    profileImage: '프로필 이미지',
    role: '역할/직책',
    quote: '인용구',
    bio: '스토리'
  };

  const translatedFields = missingFields
    .slice(0, 2) // 최대 2개만 표시
    .map(field => fieldNames[field] || field);

  if (translatedFields.length === 0) return '';
  if (translatedFields.length === 1) return translatedFields[0];
  
  return translatedFields.join('과 ');
}

/**
 * 프로필 완성도에 따른 색상 클래스 반환
 */
export function getProfileCompletenessColorClass(percentage: number): string {
  if (percentage === 100) return 'profileCompleteness__color__perfect';
  if (percentage >= 80) return 'profileCompleteness__color__excellent';
  if (percentage >= 60) return 'profileCompleteness__color__good';
  if (percentage >= 40) return 'profileCompleteness__color__moderate';
  return 'profileCompleteness__color__start';
}