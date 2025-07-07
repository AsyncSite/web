export const AI_TEMPLATE = `
// AI 플레이어 템플릿
class MyAI {
  constructor() {
    this.name = "My AI";
    this.author = "Your Name";
    this.gameInfo = null;
    this.history = [];
  }

  // 게임 초기화
  init(gameInfo) {
    this.gameInfo = gameInfo;
    this.history = [];
    // gameInfo.keywordPool: 전체 키워드 풀 (인덱스 배열)
    // gameInfo.exclusiveWrongInfo: 내가 아는 오답 정보 (인덱스 배열)
    // gameInfo.answerCount: 정답 개수
    // gameInfo.playerCount: 플레이어 수
  }

  // 추측하기 (제한 시간 내에 인덱스 배열 반환)
  makeGuess(timeLimit) {
    // 여기에 추론 로직을 구현하세요
    // 반환값: 추측하는 키워드들의 인덱스 배열
    
    // 예시: 랜덤하게 정답 개수만큼 선택
    const available = this.gameInfo.keywordPool.filter(
      index => !this.gameInfo.exclusiveWrongInfo.includes(index)
    );
    
    const shuffled = available.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, this.gameInfo.answerCount);
  }

  // 피드백 받기
  receiveFeedback(guess, correctCount) {
    this.history.push({ guess, correctCount });
    // 내 추측과 정답 개수 정보를 저장
  }

  // 다른 플레이어 관찰
  observeOthers(turnResults) {
    // turnResults: 다른 플레이어들의 턴 결과
    // 다른 플레이어의 추측과 결과를 분석하여 전략 수정
  }
}

// AI 인스턴스 생성 (필수)
const ai = new MyAI();
`;

export default AI_TEMPLATE;
