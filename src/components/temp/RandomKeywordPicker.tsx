import React, { useState } from 'react';
import './RandomKeywordPicker.css';

interface Question {
  category: string;
  text: string;
}

const questions: Question[] = [
  // 성장과 도전
  { category: "성장과 도전", text: "슬럼프를 극복했던 경험이 있나요?" },
  { category: "성장과 도전", text: "최근에 가장 큰 성취감이나 보람을 느낀 순간은 언제인가요?" },
  { category: "성장과 도전", text: "실패를 통해 배운 가장 큰 교훈은 무엇인가요?" },
  { category: "성장과 도전", text: "자신이 가장 성장했다고 느꼈던 순간은 언제였나요?" },
  { category: "성장과 도전", text: "과거의 나에게 한 가지 조언을 한다면 무엇을 말하고 싶나요?" },
  
  // 일과 삶의 균형
  { category: "일과 삶의 균형", text: "당신의 완벽한 하루는 어떤 모습인가요?" },
  { category: "일과 삶의 균형", text: "일과 삶의 균형을 맞추기 위해 어떤 노력을 하고 있나요?" },
  { category: "일과 삶의 균형", text: "스트레스를 관리하거나 풀기 위해 가장 효과적인 방법은 무엇인가요?" },
  { category: "일과 삶의 균형", text: "가장 기억에 남는 휴식 방법은 무엇이었나요?" },
  { category: "일과 삶의 균형", text: "번아웃을 방지하기 위해 어떤 루틴을 만들고 있나요?" },
  
  // 커리어와 자기 계발
  { category: "커리어와 자기 계발", text: "이직이나 커리어 전환을 고민했던 적이 있나요? 그 이유는 무엇인가요?" },
  { category: "커리어와 자기 계발", text: "지금 하고 있는 일을 선택한 이유는 무엇인가요?" },
  { category: "커리어와 자기 계발", text: "새로운 기술이나 도전에 대한 두려움을 극복하는 방법은 무엇인가요?" },
  { category: "커리어와 자기 계발", text: "당신이 가장 존경하는 롤모델은 누구이며, 그 이유는 무엇인가요?" },
  { category: "커리어와 자기 계발", text: "자신의 커리어에서 가장 도전적이었던 프로젝트는 무엇인가요?" },
  
  // 영감과 동기
  { category: "영감과 동기", text: "당신에게 가장 큰 영감을 주는 사람이나 사건은 무엇인가요?" },
  { category: "영감과 동기", text: "최근에 읽거나 본 콘텐츠 중에서 가장 마음에 남은 것은 무엇인가요?" },
  { category: "영감과 동기", text: "자신을 계속 앞으로 나아가게 만드는 원동력은 무엇인가요?" },
  { category: "영감과 동기", text: "무기력함을 느낄 때 어떻게 다시 동기를 찾나요?" },
  { category: "영감과 동기", text: "어릴 적 꿈과 현재의 나는 얼마나 닮아 있나요?" },
  
  // 관계와 공감
  { category: "관계와 공감", text: "다른 사람들과 일할 때 가장 중요하게 여기는 가치는 무엇인가요?" },
  { category: "관계와 공감", text: "누군가에게 큰 도움을 받았던 기억이 있나요?" },
  { category: "관계와 공감", text: "타인과의 갈등을 해결했던 가장 효과적인 방법은 무엇인가요?" },
  { category: "관계와 공감", text: "가장 감사했던 순간은 언제인가요?" },
  { category: "관계와 공감", text: "나를 가장 잘 이해해주는 사람은 누구인가요?" },
  
  // 취미와 개인적인 관심사
  { category: "취미와 개인적인 관심사", text: "최근에 새로 시작한 취미나 관심사는 무엇인가요?" },
  { category: "취미와 개인적인 관심사", text: "어린 시절부터 지금까지 좋아했던 활동 중에서 꾸준히 하고 있는 것이 있나요?" },
  { category: "취미와 개인적인 관심사", text: "만약 제한 없이 무엇이든 할 수 있다면, 무엇을 해보고 싶나요?" },
  { category: "취미와 개인적인 관심사", text: "가장 몰입했던 순간은 언제인가요?" },
  { category: "취미와 개인적인 관심사", text: "당신에게 완벽한 여행지는 어디인가요?" },
  
  // 미래와 꿈
  { category: "미래와 꿈", text: "10년 후의 나는 어떤 모습이길 바라나요?" },
  { category: "미래와 꿈", text: "앞으로 꼭 도전해보고 싶은 것은 무엇인가요?" },
  { category: "미래와 꿈", text: "세상을 바꾸는 데 기여할 수 있다면 어떤 방식으로 기여하고 싶나요?" },
  { category: "미래와 꿈", text: "당신의 인생에서 가장 중요한 가치는 무엇인가요?" },
  { category: "미래와 꿈", text: "죽기 전에 반드시 이루고 싶은 한 가지는 무엇인가요?" },
  
  // 철학적/자기 성찰
  { category: "철학적/자기 성찰", text: "삶에서 가장 소중한 것은 무엇인가요?" },
  { category: "철학적/자기 성찰", text: "가장 후회되는 일은 무엇이며, 그것을 어떻게 받아들였나요?" },
  { category: "철학적/자기 성찰", text: "행복이란 무엇이라고 생각하나요?" },
  { category: "철학적/자기 성찰", text: "시간을 되돌릴 수 있다면 어떤 순간으로 돌아가고 싶나요?" },
  { category: "철학적/자기 성찰", text: "스스로를 정의한다면, 당신은 어떤 사람인가요?" }
];

const RandomKeywordPicker: React.FC = () => {
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([...questions]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [history, setHistory] = useState<Question[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const pickRandomQuestion = () => {
    if (availableQuestions.length === 0) {
      alert('모든 질문을 뽑았습니다! 리셋 버튼을 눌러주세요.');
      return;
    }

    setIsAnimating(true);
    
    // 애니메이션 효과
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const selected = availableQuestions[randomIndex];
      
      // 선택된 질문을 제거하고 상태 업데이트
      const newAvailable = availableQuestions.filter((_, index) => index !== randomIndex);
      setAvailableQuestions(newAvailable);
      
      // 현재 질문이 있으면 히스토리에 추가
      if (currentQuestion) {
        setHistory([currentQuestion, ...history]);
      }
      
      setCurrentQuestion(selected);
      setIsAnimating(false);
      
      // 마지막 질문인 경우 축하 효과
      if (newAvailable.length === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 500);
  };

  const reset = () => {
    setAvailableQuestions([...questions]);
    setCurrentQuestion(null);
    setHistory([]);
  };

  return (
    <div className="keyword-picker-container">
      <div className="keyword-picker">
        <h1>🎲 랜덤 질문 뽑기</h1>
        
        <div className="stats">
          <span>전체 {questions.length}</span>
          <span>남음 {availableQuestions.length}</span>
          <span>뽑음 {questions.length - availableQuestions.length}</span>
        </div>

        <div className="current-question-area">
          {currentQuestion ? (
            <div className={`current-question ${isAnimating ? 'animating' : ''}`}>
              <div className="category-badge">{currentQuestion.category}</div>
              <h2>{currentQuestion.text}</h2>
            </div>
          ) : (
            <div className="placeholder">
              <p>버튼을 눌러 질문을 뽑아보세요!</p>
            </div>
          )}
        </div>

        <div className="button-group">
          <button 
            className="pick-button"
            onClick={pickRandomQuestion}
            disabled={availableQuestions.length === 0 || isAnimating}
          >
            {isAnimating ? '뽑는 중...' : '질문 뽑기'}
          </button>
          
          <button 
            className="reset-button"
            onClick={reset}
          >
            리셋
          </button>
        </div>

        {history.length > 0 && (
          <div className="history">
            <h3>이전 질문들</h3>
            <div className="history-list">
              {history.map((q, index) => (
                <div key={index} className="history-item">
                  <span className="history-category">{q.category}</span>
                  <span className="history-text">{q.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomKeywordPicker;