// 실시간 중계 메시지 템플릿
export const getEventCommentary = (snailName: string, eventName: string): string => {
  const templates: { [key: string]: string[] } = {
    '반짝이는 이슬': [
      `${snailName} 달팽이가 반짝이는 이슬을 먹고 가속합니다!`,
      `오! ${snailName} 달팽이가 마법의 이슬로 스피드업!`,
      `${snailName} 달팽이, 이슬의 힘으로 날아갑니다!`,
    ],
    '꿀잠 타임': [
      `${snailName} 달팽이가 꿀잠에 빠졌습니다...`,
      `이런! ${snailName} 달팽이가 낮잠을 자네요!`,
      `${snailName} 달팽이, 잠시 휴식 타임입니다.`,
    ],
    '미끄러운 나뭇잎': [
      `${snailName} 달팽이가 나뭇잎을 타고 미끄러집니다!`,
      `우와! ${snailName} 달팽이의 나뭇잎 서핑!`,
      `${snailName} 달팽이, 나뭇잎 익스프레스 탑승!`,
    ],
    '맛있는 풀잎': [
      `${snailName} 달팽이가 맛있는 풀잎을 발견했네요!`,
      `${snailName} 달팽이, 간식 타임입니다~`,
      `냠냠! ${snailName} 달팽이가 식사 중입니다.`,
    ],
    '갑작스런 바람': [
      `헉! ${snailName} 달팽이가 바람에 날려갑니다!`,
      `강풍 주의! ${snailName} 달팽이가 뒤로 밀렸습니다!`,
      `${snailName} 달팽이, 바람과의 싸움에서 패배...`,
    ],
    '슈퍼 부스터': [
      `대박! ${snailName} 달팽이가 슈퍼 부스터 발동!`,
      `${snailName} 달팽이, 로켓 모드 ON!`,
      `믿을 수 없는 속도! ${snailName} 달팽이가 날아갑니다!`,
    ],
    '방향 감각 상실': [
      `어? ${snailName} 달팽이가 방향을 잃었습니다!`,
      `${snailName} 달팽이, 어디로 가는 거야?`,
      `혼란스러운 ${snailName} 달팽이, 뒤로 가고 있어요!`,
    ],
    '깜짝 도약': [
      `점프! ${snailName} 달팽이의 깜짝 도약!`,
      `${snailName} 달팽이가 순간이동을 했나요?`,
      `놀라운 점프력! ${snailName} 달팽이가 앞으로!`,
    ],
    '춤추는 달팽이': [
      `${snailName} 달팽이가 춤을 추기 시작했어요!`,
      `흥겨운 ${snailName} 달팽이의 댄스 타임!`,
      `${snailName} 달팽이, 음악에 빠졌나 봅니다~`,
    ],
  };

  const messages = templates[eventName] || [`${snailName} 달팽이에게 무언가 일어났습니다!`];
  return messages[Math.floor(Math.random() * messages.length)];
};

export const getRaceCommentary = (snails: any[], leaders: string[]): string => {
  const messages = [
    `${leaders[0]} 달팽이가 선두를 달리고 있습니다!`,
    `치열한 선두 경쟁! ${leaders.slice(0, 2).join(', ')} 달팽이!`,
    `박진감 넘치는 레이스가 계속되고 있습니다!`,
    `${leaders[0]} 달팽이가 앞서나가고 있네요!`,
    `접전! ${leaders.slice(0, 3).join(', ')} 달팽이가 경쟁 중!`,
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

export const getFinishCommentary = (winnerName: string, rank: number): string => {
  if (rank === 1) {
    return `🎉 ${winnerName} 달팽이가 1등으로 결승선 통과!`;
  } else if (rank === 2) {
    return `${winnerName} 달팽이가 2등으로 들어왔습니다!`;
  } else if (rank === 3) {
    return `${winnerName} 달팽이, 3등 완주!`;
  }
  return `${winnerName} 달팽이가 ${rank}등으로 완주했습니다.`;
};
