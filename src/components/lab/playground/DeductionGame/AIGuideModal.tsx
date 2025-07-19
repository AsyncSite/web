import React, { useState } from 'react';
import './AIGuideModal.css';

interface AIGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIGuideModal: React.FC<AIGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'examples'>('basic');

  if (!isOpen) return null;

  return (
    <div className="ai-guide-modal-overlay" onClick={onClose}>
      <div className="ai-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-guide-header">
          <h2>🎮 AI 작성 가이드</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="ai-guide-tabs">
          <button
            className={`tab-button ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            기본 가이드
          </button>
          <button
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
            onClick={() => setActiveTab('advanced')}
          >
            고급 전략
          </button>
          <button
            className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`}
            onClick={() => setActiveTab('examples')}
          >
            예제 코드
          </button>
        </div>

        <div className="ai-guide-content">
          {activeTab === 'basic' && (
            <div className="guide-section">
              <h3>📌 함수 시그니처</h3>
              <pre className="code-block">
{`function makeGuess(gameState) {
    // AI 로직 구현
    return [0, 1, 2]; // 추측한 키워드의 인덱스 배열
}`}
              </pre>

              <h3>📊 gameState 객체 구조</h3>
              <pre className="code-block">
{`{
    keywords: ['사자', '호랑이', '코끼리', ...],  // 모든 키워드
    myHints: [1, 3],                            // 정답이 아닌 인덱스
    answerCount: 3,                             // 찾아야 할 정답 개수
    
    previousGuesses: [                          // 모든 추측 기록
        {
            playerId: 1,
            guess: [0, 1, 2],                   // 추측한 인덱스
            correctCount: 2                     // 맞춘 개수
        }
    ],
    
    revealedAnswers: [0],                       // 공개된 정답
    revealedWrongAnswers: [5, 7],              // 공개된 오답
    
    currentTurn: 5,                             // 현재 턴
    maxTurns: 20,                              // 최대 턴 (선택)
    timeLimit: 60                               // 제한 시간(초)
}`}
              </pre>

              <h3>✅ 필수 규칙</h3>
              <ul className="guide-list">
                <li>배열 길이는 반드시 <code>answerCount</code>와 같아야 함</li>
                <li><code>myHints</code>와 <code>revealedWrongAnswers</code>는 선택 불가</li>
                <li><code>revealedAnswers</code>는 반드시 포함</li>
                <li>2초 이내에 결과 반환</li>
              </ul>

              <h3>🚫 사용 금지</h3>
              <ul className="guide-list">
                <li><code>eval()</code>, <code>Function()</code></li>
                <li><code>setTimeout</code>, <code>setInterval</code></li>
                <li><code>fetch</code>, <code>XMLHttpRequest</code></li>
                <li><code>import</code>, <code>require</code></li>
              </ul>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="guide-section">
              <h3>🧠 추측 분석 전략</h3>
              <p>이전 추측들을 분석하여 각 키워드의 점수를 계산합니다:</p>
              <ul className="guide-list">
                <li>정답이 포함된 추측의 키워드들에 가중치 부여</li>
                <li>정답이 없는 추측의 키워드들은 감점</li>
                <li>교집합/차집합 분석으로 확실한 정답 추론</li>
              </ul>

              <h3>🎯 전략 수준</h3>
              <div className="strategy-levels">
                <div className="strategy-level">
                  <span className="level-badge bronze">🥉 브론즈</span>
                  <p>기본 제약사항을 지키며 랜덤 선택</p>
                </div>
                <div className="strategy-level">
                  <span className="level-badge silver">🥈 실버</span>
                  <p>이전 추측 결과를 점수화하여 분석</p>
                </div>
                <div className="strategy-level">
                  <span className="level-badge gold">🥇 골드</span>
                  <p>추측 간의 차이를 비교하여 논리적 추론</p>
                </div>
                <div className="strategy-level">
                  <span className="level-badge platinum">💎 플래티넘</span>
                  <p>제약 조건 충족 알고리즘 구현</p>
                </div>
              </div>

              <h3>💡 고급 팁</h3>
              <ul className="guide-list">
                <li>두 추측의 차이가 1개일 때, 정답 개수 차이로 확실한 답 추론 가능</li>
                <li>정답이 0개인 추측의 모든 키워드는 오답으로 확정</li>
                <li>베이지안 추론으로 각 키워드의 확률 계산</li>
                <li>정보 이득이 최대인 추측 선택</li>
              </ul>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="guide-section">
              <h3>🎲 기본 랜덤 AI</h3>
              <pre className="code-block">
{`function makeGuess(gameState) {
    const canSelect = [];
    
    `}<span className="code-comment">// 선택 가능한 키워드 찾기</span>{`
    for (let i = 0; i < gameState.keywords.length; i++) {
        if (!gameState.myHints.includes(i) && 
            !gameState.revealedWrongAnswers.includes(i)) {
            canSelect.push(i);
        }
    }
    
    `}<span className="code-comment">// 공개된 정답 포함</span>{`
    const myGuess = [...gameState.revealedAnswers];
    
    `}<span className="code-comment">// 나머지를 랜덤하게 선택</span>{`
    while (myGuess.length < gameState.answerCount && canSelect.length > 0) {
        const randomIndex = Math.floor(Math.random() * canSelect.length);
        const selected = canSelect[randomIndex];
        
        if (!myGuess.includes(selected)) {
            myGuess.push(selected);
            canSelect.splice(randomIndex, 1);
        }
    }
    
    return myGuess;
}`}
              </pre>

              <h3>📊 점수 기반 AI</h3>
              <pre className="code-block">
{`function makeGuess(gameState) {
    const scores = new Map();
    
    // 모든 키워드에 점수 초기화
    for (let i = 0; i < gameState.keywords.length; i++) {
        scores.set(i, 0);
    }
    
    // 이전 추측 분석
    gameState.previousGuesses.forEach(guess => {
        if (guess.correctCount > 0) {
            // 맞춘 개수가 있으면 점수 부여
            const points = guess.correctCount / guess.guess.length;
            guess.guess.forEach(idx => {
                scores.set(idx, scores.get(idx) + points);
            });
        } else {
            // 하나도 못 맞췄으면 감점
            guess.guess.forEach(idx => {
                scores.set(idx, scores.get(idx) - 1);
            });
        }
    });
    
    // 사용 불가능한 키워드 제거
    [...gameState.myHints, ...gameState.revealedWrongAnswers].forEach(idx => {
        scores.delete(idx);
    });
    
    // 점수 순으로 정렬하여 선택
    const sorted = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
    
    const result = [...gameState.revealedAnswers];
    for (const idx of sorted) {
        if (result.length >= gameState.answerCount) break;
        if (!result.includes(idx)) {
            result.push(idx);
        }
    }
    
    return result;
}`}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGuideModal;