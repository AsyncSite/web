import { Participant } from '../../../shared/types';
import { DartWheelSection } from '../types/dartWheel';

/**
 * 다트휠 게임 메시지 생성 유틸리티
 */

// 게임 시작 메시지
export function dartWheelGetStartMessage(participantCount: number): string {
  const messages = [
    `${participantCount}명의 참가자가 다트휠 게임을 시작합니다!`,
    `다트휠이 곧 회전합니다. ${participantCount}명의 운명은?`,
    `행운의 다트휠! ${participantCount}명의 도전자가 준비되었습니다.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// 스핀 시작 메시지
export function dartWheelGetSpinStartMessage(participant: Participant): string {
  const messages = [
    `${participant.name}님이 다트휠을 돌립니다!`,
    `${participant.name}님의 차례! 휠이 회전합니다.`,
    `행운을 빕니다, ${participant.name}님! 휠이 돌아갑니다.`,
    `${participant.name}님, 과연 어떤 점수가 나올까요?`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// 스핀 중 메시지
export function dartWheelGetSpinningMessage(): string {
  const messages = [
    '휠이 빠르게 회전하고 있습니다...',
    '과연 어디에 멈출까요?',
    '운명의 순간이 다가옵니다...',
    '두근두근... 결과는?',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// 결과 메시지
export function dartWheelGetResultMessage(
  participant: Participant, 
  section: DartWheelSection
): string {
  // 보너스 섹션인 경우
  if (section.isBonus && section.bonusType) {
    switch (section.bonusType) {
      case 'double':
        return `🎊 ${participant.name}님이 2배 보너스를 획득! ${section.value}점!`;
      case 'triple':
        return `🎊🎊🎊 ${participant.name}님이 3배 보너스를 터뜨렸습니다! ${section.value}점!`;
      case 'respin':
        return `🔄 ${participant.name}님이 다시 돌리기 찬스를 얻었습니다!`;
      case 'jackpot':
        return `💰 잭팟! ${participant.name}님이 최고 점수 ${section.value}점을 획득했습니다!`;
    }
  }
  
  // 일반 섹션인 경우
  const isHighScore = section.value >= 60;
  const isLowScore = section.value <= 20;
  
  if (isHighScore) {
    return `🎉 대박! ${participant.name}님이 ${section.value}점을 획득했습니다!`;
  } else if (isLowScore) {
    return `😅 ${participant.name}님은 ${section.value}점... 다음엔 더 잘하실 거예요!`;
  } else {
    return `${participant.name}님이 ${section.value}점을 획득했습니다!`;
  }
}

// 게임 종료 메시지
export function dartWheelGetGameEndMessage(winners: Participant[]): string {
  if (winners.length === 0) {
    return '게임이 종료되었습니다!';
  } else if (winners.length === 1) {
    return `🏆 ${winners[0].name}님이 최고 점수로 우승했습니다!`;
  } else {
    const winnerNames = winners.map(w => w.name).join(', ');
    return `🏆 ${winnerNames}님이 공동 우승했습니다!`;
  }
}

// 대기 메시지
export function dartWheelGetWaitingMessage(nextParticipant: Participant): string {
  const messages = [
    `다음은 ${nextParticipant.name}님 차례입니다.`,
    `${nextParticipant.name}님, 준비되셨나요?`,
    `잠시 후 ${nextParticipant.name}님이 도전합니다.`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// 격려 메시지
export function dartWheelGetEncouragementMessage(): string {
  const messages = [
    '행운을 빕니다! 🍀',
    '최고 점수에 도전하세요!',
    '긴장하지 마세요, 할 수 있습니다!',
    '이번엔 대박이 날 것 같은 느낌!',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}