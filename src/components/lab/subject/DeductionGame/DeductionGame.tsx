import React, { useState, useEffect, useRef } from 'react';
import './DeductionGame.css';
import { GameManager } from './ai/GameManager';
import { PlayerFactory } from './ai/PlayerFactory';
import { IPlayer } from './ai/players/BasePlayer';
import { HumanPlayer } from './ai/players/HumanPlayer';
import { PlayerInfo, PlayerType } from './ai/types/PlayerTypes';

type GameScreen = 'mode-selection' | 'difficulty-selection' | 'player-setup' | 'game-config' | 'game-preparation' | 'game';
type GameMode = 'solo' | 'multi';

interface GameConfig {
  keywordPoolSize: number;
  answerCount: number;
  hintCount: number;
  timeLimit: number;
  maxTurns?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'custom';
}

interface GameState {
  keywords: string[];
  answers: number[];
  playerHints: { [playerId: number]: number[] };
  isReady: boolean;
  currentTurn: number;
  turnHistory: TurnResult[];
  gameStatus: 'playing' | 'finished';
  winner?: number;
  revealedAnswers: number[];
  revealedWrongAnswers: number[];
  hintsViewed: { [playerId: number]: boolean };
}

interface TurnResult {
  playerId: number;
  playerName: string;
  guess: number[];
  guessKeywords: string[];
  correctCount: number;
  turnNumber: number;
  timeUsed: number;
}

interface PlayerConfig {
  id: number;
  nickname: string;
  type: PlayerType;
  aiCode?: string;
  aiLanguage?: 'javascript' | 'typescript';
  aiDifficulty?: 'easy' | 'medium' | 'hard';
}

const DeductionGame: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('mode-selection');
  const [gameMode, setGameMode] = useState<GameMode>('solo');
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<PlayerConfig[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    keywordPoolSize: 50,
    answerCount: 5,
    hintCount: 5,
    timeLimit: 60,
    maxTurns: 20,
    difficulty: 'intermediate'
  });
  const [gameState, setGameState] = useState<GameState>({
    keywords: [],
    answers: [],
    playerHints: {},
    isReady: false,
    currentTurn: 0,
    turnHistory: [],
    gameStatus: 'playing',
    revealedAnswers: [],
    revealedWrongAnswers: [],
    hintsViewed: {}
  });
  const [preparationStep, setPreparationStep] = useState(0);
  const [selectedKeywords, setSelectedKeywords] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hintViewingPhase, setHintViewingPhase] = useState(false);
  const [currentViewingPlayer, setCurrentViewingPlayer] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiTimeoutId, setAiTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [soloDifficulty, setSoloDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const gameManagerRef = useRef<GameManager | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number>(0);
  const [codeEditorModal, setCodeEditorModal] = useState<{ isOpen: boolean; playerId: number | null }>({ 
    isOpen: false, 
    playerId: null 
  });

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'solo') {
      // 솔로 모드는 난이도 선택 화면으로
      setCurrentScreen('difficulty-selection');
    } else {
      // 멀티 모드는 플레이어 수 선택 후 설정
      setPlayers([]);
      setCurrentScreen('player-setup');
    }
  };

  const handleDifficultySelect = (difficulty: 'easy' | 'medium' | 'hard') => {
    setSoloDifficulty(difficulty);
    setPlayerCount(2);
    setPlayers([
      { id: 1, nickname: '', type: 'human', aiLanguage: 'javascript' },
      { id: 2, nickname: `AI (${difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'})`, type: 'built-in-ai', aiDifficulty: difficulty }
    ]);
    setCurrentScreen('player-setup');
  };

  const handlePlayerCountSelect = (count: number) => {
    setPlayerCount(count);
    const newPlayers: PlayerConfig[] = [];
    for (let i = 1; i <= count; i++) {
      newPlayers.push({
        id: i,
        nickname: '',
        type: 'human',
        aiLanguage: 'javascript'
      });
    }
    setPlayers(newPlayers);
  };

  const updatePlayer = (id: number, updates: Partial<PlayerConfig>) => {
    setPlayers(prev => prev.map(player => 
      player.id === id ? { ...player, ...updates } : player
    ));
  };

  const canStartGame = () => {
    return players.every(player => {
      if (!player.nickname.trim()) return false;
      if (player.type === 'custom-ai' && !player.aiCode?.trim()) return false;
      return true;
    });
  };

  const handleStartGame = () => {
    console.log('Moving to game config with players:', players);
    setCurrentScreen('game-config');
  };

  const handleConfigComplete = () => {
    console.log('Game config complete:', gameConfig);
    setPreparationStep(0);
    setCurrentScreen('game-preparation');
    initializeGame();
  };

  // 키워드 풀 (실제로는 더 많은 키워드가 필요)
  const keywordCategories = {
    animals: ['사자', '호랑이', '코끼리', '기린', '원숭이', '코알라', '판다', '펭귄', '독수리', '상어', '고래', '돌고래', '토끼', '고양이', '강아지', '말', '소', '돼지', '양', '염소'],
    foods: ['피자', '햄버거', '스파게티', '초밥', '김치찌개', '불고기', '치킨', '라면', '떡볶이', '김밥', '샐러드', '스테이크', '카레', '우동', '냉면', '비빔밥', '갈비', '삼겹살', '회', '족발'],
    objects: ['컴퓨터', '스마트폰', '자동차', '비행기', '기차', '자전거', '책', '연필', '가방', '시계', '안경', '모자', '신발', '옷', '침대', '의자', '책상', '냉장고', '세탁기', '텔레비전'],
    places: ['학교', '병원', '은행', '카페', '식당', '공원', '해변', '산', '도서관', '박물관', '영화관', '쇼핑몰', '시장', '교회', '지하철역', '공항', '호텔', '집', '회사', '체육관'],
    actions: ['걷기', '뛰기', '수영', '춤추기', '노래하기', '요리하기', '공부하기', '운전하기', '그림그리기', '글쓰기', '읽기', '잠자기', '먹기', '마시기', '웃기', '울기', '생각하기', '말하기', '듣기', '보기']
  };

  const generateKeywords = (size: number): string[] => {
    const allKeywords = Object.values(keywordCategories).flat();
    const shuffled = [...allKeywords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  };

  const initializeGame = async () => {
    // 1단계: 키워드 생성
    setPreparationStep(1);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const keywords = generateKeywords(gameConfig.keywordPoolSize);
    
    // 2단계: 정답 선택
    setPreparationStep(2);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const answerIndices: number[] = [];
    const shuffledIndices = Array.from({length: keywords.length}, (_, i) => i).sort(() => Math.random() - 0.5);
    for (let i = 0; i < gameConfig.answerCount; i++) {
      answerIndices.push(shuffledIndices[i]);
    }
    
    // 3단계: 힌트 배포
    setPreparationStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const playerHints: { [playerId: number]: number[] } = {};
    const nonAnswerIndices = shuffledIndices.filter(i => !answerIndices.includes(i));
    
    players.forEach(player => {
      const hints: number[] = [];
      const availableHints = [...nonAnswerIndices].sort(() => Math.random() - 0.5);
      for (let i = 0; i < gameConfig.hintCount && i < availableHints.length; i++) {
        hints.push(availableHints[i]);
      }
      playerHints[player.id] = hints;
    });
    
    // 4단계: 준비 완료
    setPreparationStep(4);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setGameState({
      keywords,
      answers: answerIndices,
      playerHints,
      isReady: true,
      currentTurn: 0,  // GameManager가 관리하므로 0으로 시작
      turnHistory: [],
      gameStatus: 'playing',
      revealedAnswers: [],
      revealedWrongAnswers: [],
      hintsViewed: {}
    });
    
    setPreparationStep(5); // 완료 상태
  };


  const startActualGame = () => {
    // GameManager 초기화
    const manager = new GameManager({
      keywordPoolSize: gameConfig.keywordPoolSize,
      answerCount: gameConfig.answerCount,
      hintCount: gameConfig.hintCount,
      timeLimit: gameConfig.timeLimit,
      maxTurns: gameConfig.maxTurns
    });

    // 플레이어 생성
    const gamePlayers: IPlayer[] = players.map(config => {
      const playerInfo: PlayerInfo = {
        id: config.id,
        nickname: config.nickname,
        type: config.type,
        aiDifficulty: config.aiDifficulty,
        customCode: config.aiCode,
        customLanguage: config.aiLanguage
      };
      return PlayerFactory.createPlayer(playerInfo);
    });

    manager.setPlayers(gamePlayers);

    // 이벤트 핸들러 설정
    manager.setEventHandlers({
      onTurnStart: (player) => {
        const playerInfo = player.getInfo();
        setIsMyTurn(playerInfo.type === 'human');
        // 턴 시작 시간 기록
        setTurnStartTime(Date.now());
        // GameManager의 currentTurn과 동기화
        const context = manager.getGameContext();
        setGameState(prev => ({
          ...prev,
          currentTurn: context.currentTurn
        }));
      },
      onTurnEnd: (result) => {
        setIsAIThinking(false);
        setGameState(prev => ({
          ...prev,
          turnHistory: [...prev.turnHistory, result]
        }));
      },
      onGameEnd: (winner) => {
        if (winner) {
          const winnerInfo = winner.getInfo();
          setGameState(prev => ({
            ...prev,
            gameStatus: 'finished',
            winner: winnerInfo.id
          }));
        } else {
          setGameState(prev => ({
            ...prev,
            gameStatus: 'finished'
          }));
        }
      },
      onTimerTick: (remainingTime) => {
        setTimeRemaining(remainingTime);
      },
      onAIThinking: (thinking) => {
        setIsAIThinking(thinking);
      }
    });

    gameManagerRef.current = manager;

    setHintViewingPhase(true);
    setCurrentViewingPlayer(1);
    setCurrentScreen('game');
  };

  const startTimer = () => {
    // GameManager를 사용하는 경우 타이머를 직접 관리하지 않음
    if (gameManagerRef.current) {
      return;
    }
    
    // 기존 타이머가 있다면 먼저 정리
    clearTimer();
    
    // 턴 시작 시간 기록
    setTurnStartTime(Date.now());
    setTimeRemaining(gameConfig.timeLimit);
    
    const intervalId = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // 타이머를 먼저 정리하고 handleTimeUp 호출
          clearInterval(intervalId);
          setTimerIntervalId(null);
          // setTimeout으로 다음 프레임에서 실행하여 상태 업데이트 충돌 방지
          setTimeout(() => {
            handleTimeUp();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimerIntervalId(intervalId);
  };

  const clearTimer = () => {
    if (timerIntervalId) {
      clearInterval(timerIntervalId);
      setTimerIntervalId(null);
    }
  };

  const handleTimeUp = () => {
    // 시간 초과시 랜덤하게 키워드 선택하여 자동 제출
    const availableKeywords = gameState.keywords
      .map((_, index) => index)
      .filter(index => !gameState.revealedWrongAnswers.includes(index));
    
    const shuffled = [...availableKeywords].sort(() => Math.random() - 0.5);
    const autoSelection = shuffled.slice(0, gameConfig.answerCount);
    
    setSelectedKeywords(autoSelection);
    
    // 잠시 후 자동 제출
    setTimeout(() => {
      submitGuessWithSelection(autoSelection);
    }, 500);
  };

  const exitGame = () => {
    clearTimer();
    // AI 타임아웃도 정리
    if (aiTimeoutId) {
      clearTimeout(aiTimeoutId);
      setAiTimeoutId(null);
    }
    // GameManager 정리
    if (gameManagerRef.current) {
      gameManagerRef.current.stopGame();
      gameManagerRef.current = null;
    }
    setCurrentScreen('mode-selection');
    // 게임 상태 초기화
    setGameState({
      keywords: [],
      answers: [],
      playerHints: {},
      isReady: false,
      currentTurn: 0,
      turnHistory: [],
      gameStatus: 'playing',
      revealedAnswers: [],
      revealedWrongAnswers: [],
      hintsViewed: {}
    });
    setSelectedKeywords([]);
    setTimeRemaining(0);
    setIsMyTurn(false);
    setIsAIThinking(false);
    setHintViewingPhase(false);
    setCurrentViewingPlayer(0);
    setIsSubmitting(false);
  };


  const revealAnswerHint = () => {
    if (gameManagerRef.current) {
      const success = gameManagerRef.current.revealAnswer();
      if (success) {
        const context = gameManagerRef.current.getGameContext();
        setGameState(prev => ({
          ...prev,
          revealedAnswers: context.revealedAnswers
        }));
      }
    } else {
      const unrevealedAnswers = gameState.answers.filter(ans => !gameState.revealedAnswers.includes(ans));
      if (unrevealedAnswers.length > 0) {
        const randomAnswer = unrevealedAnswers[Math.floor(Math.random() * unrevealedAnswers.length)];
        setGameState(prev => ({
          ...prev,
          revealedAnswers: [...prev.revealedAnswers, randomAnswer]
        }));
      }
    }
  };

  const revealWrongHint = () => {
    if (gameManagerRef.current) {
      const success = gameManagerRef.current.revealWrongAnswer();
      if (success) {
        const context = gameManagerRef.current.getGameContext();
        setGameState(prev => ({
          ...prev,
          revealedWrongAnswers: context.revealedWrongAnswers
        }));
      }
    } else {
      const wrongAnswers = gameState.keywords
        .map((_, index) => index)
        .filter(index => !gameState.answers.includes(index) && !gameState.revealedWrongAnswers.includes(index));
      
      if (wrongAnswers.length > 0) {
        const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        setGameState(prev => ({
          ...prev,
          revealedWrongAnswers: [...prev.revealedWrongAnswers, randomWrong]
        }));
      }
    }
  };

  const toggleKeywordSelection = (keywordIndex: number) => {
    setSelectedKeywords(prev => {
      if (prev.includes(keywordIndex)) {
        return prev.filter(index => index !== keywordIndex);
      } else if (prev.length < gameConfig.answerCount) {
        return [...prev, keywordIndex];
      }
      return prev;
    });
  };

  const submitGuess = async () => {
    if (selectedKeywords.length !== gameConfig.answerCount || isSubmitting) return;
    
    if (gameManagerRef.current) {
      setIsSubmitting(true);
      try {
        await gameManagerRef.current.submitHumanGuess(selectedKeywords);
        setSelectedKeywords([]);
      } catch (error) {
        console.error('Failed to submit guess:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      submitGuessWithSelection(selectedKeywords);
    }
  };

  const submitGuessWithSelection = (selection: number[]) => {
    // GameManager를 사용하는 경우 이 함수를 사용하지 않음
    if (gameManagerRef.current) return;
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    // 타이머 정리 (새로운 타이머 시작 전에)
    clearTimer();

    const correctCount = selection.filter(index => 
      gameState.answers.includes(index)
    ).length;

    const isWinner = correctCount === gameConfig.answerCount && 
                     selection.every(index => gameState.answers.includes(index));

    const currentPlayerId = ((gameState.currentTurn - 1) % players.length) + 1;
    const currentPlayer = players.find(p => p.id === currentPlayerId);

    // 실제 사용 시간 계산
    const actualTimeUsed = turnStartTime ? Math.round((Date.now() - turnStartTime) / 1000) : gameConfig.timeLimit - timeRemaining;
    
    const turnResult: TurnResult = {
      playerId: currentPlayerId,
      playerName: currentPlayer?.nickname || `플레이어 ${currentPlayerId}`,
      guess: [...selection],
      guessKeywords: selection.map(index => gameState.keywords[index]),
      correctCount,
      turnNumber: gameState.currentTurn,
      timeUsed: actualTimeUsed
    };

    // 최대 턴 수 확인
    const isMaxTurnsReached = gameConfig.maxTurns && gameState.currentTurn >= gameConfig.maxTurns;
    
    setGameState(prev => ({
      ...prev,
      turnHistory: [...prev.turnHistory, turnResult],
      currentTurn: prev.currentTurn + 1,
      gameStatus: isWinner ? 'finished' : (isMaxTurnsReached ? 'finished' : 'playing'),
      winner: isWinner ? currentPlayerId : undefined
    }));

    setSelectedKeywords([]);
    
    if (!isWinner && !isMaxTurnsReached) {
      // 다음 턴을 위해 타이머 재시작
      setTimeout(() => {
        startTimer();
      }, 100);
    }
    
    // 제출 상태 리셋
    setTimeout(() => {
      setIsSubmitting(false);
    }, 500);
  };

  const getCurrentPlayer = () => {
    if (gameManagerRef.current) {
      const currentPlayer = gameManagerRef.current.getCurrentPlayer();
      if (currentPlayer) {
        const playerInfo = currentPlayer.getInfo();
        return players.find(p => p.id === playerInfo.id);
      }
    }
    const currentPlayerId = ((gameState.currentTurn - 1) % players.length) + 1;
    return players.find(p => p.id === currentPlayerId);
  };

  const isGameOver = () => {
    return gameState.gameStatus === 'finished' || 
           (gameConfig.maxTurns && gameState.currentTurn > gameConfig.maxTurns);
  };

  const difficultyPresets = {
    beginner: { keywordPoolSize: 30, answerCount: 3, hintCount: 5, timeLimit: 90, maxTurns: 15 },
    intermediate: { keywordPoolSize: 50, answerCount: 5, hintCount: 5, timeLimit: 60, maxTurns: 20 },
    advanced: { keywordPoolSize: 80, answerCount: 7, hintCount: 4, timeLimit: 45, maxTurns: 25 }
  };

  const applyPreset = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const preset = difficultyPresets[difficulty];
    setGameConfig({ ...preset, difficulty });
  };

  const updateGameConfig = (updates: Partial<GameConfig>) => {
    setGameConfig(prev => ({ ...prev, ...updates, difficulty: 'custom' }));
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimer();
      if (aiTimeoutId) {
        clearTimeout(aiTimeoutId);
      }
    };
  }, []);

  const renderCodeEditorModal = () => {
    if (!codeEditorModal.isOpen || !codeEditorModal.playerId) return null;
    
    const player = players.find(p => p.id === codeEditorModal.playerId);
    if (!player) return null;

    return (
      <div className="modal-overlay" onClick={() => setCodeEditorModal({ isOpen: false, playerId: null })}>
        <div className="modal-content code-editor-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{player.nickname} AI 코드 에디터</h3>
            <button 
              className="modal-close"
              onClick={() => setCodeEditorModal({ isOpen: false, playerId: null })}
            >
              ×
            </button>
          </div>
          
          <div className="code-editor-container">
            <div className="editor-toolbar">
              <div className="editor-left">
                <span className="editor-info">코드 작성</span>
                <div className="language-selector">
                  <button
                    className={`lang-btn ${player.aiLanguage === 'javascript' ? 'active' : ''}`}
                    onClick={() => updatePlayer(player.id, { aiLanguage: 'javascript' })}
                  >
                    JavaScript
                  </button>
                  <button
                    className={`lang-btn ${player.aiLanguage === 'typescript' ? 'active' : ''}`}
                    onClick={() => updatePlayer(player.id, { aiLanguage: 'typescript' })}
                  >
                    TypeScript
                  </button>
                </div>
              </div>
              <div className="editor-actions">
                <button 
                  className="btn btn-small"
                  onClick={() => updatePlayer(player.id, { aiCode: '' })}
                >
                  초기화
                </button>
                <button 
                  className="btn btn-small"
                  onClick={() => {
                    const exampleCode = player.aiLanguage === 'typescript' 
                      ? `// AI 전략 함수 (TypeScript)
interface GameState {
  keywords: string[];
  myHints: number[];
  previousGuesses: number[][];
  revealedAnswers: number[];
  revealedWrongs: number[];
  answerCount: number;
}

function makeGuess(gameState: GameState): number[] {
  const { keywords, myHints, previousGuesses, revealedAnswers, revealedWrongs, answerCount } = gameState;
  
  // 가능한 키워드 인덱스 목록
  const availableIndices: number[] = keywords
    .map((_, index) => index)
    .filter(idx => !revealedWrongs.includes(idx));
  
  // 이미 공개된 정답 우선 선택
  const selectedIndices: number[] = [...revealedAnswers];
  
  // 나머지는 랜덤 선택
  while (selectedIndices.length < answerCount) {
    const remaining = availableIndices.filter(idx => !selectedIndices.includes(idx));
    if (remaining.length === 0) break;
    
    const randomIdx = remaining[Math.floor(Math.random() * remaining.length)];
    selectedIndices.push(randomIdx);
  }
  
  return selectedIndices;
}`
                      : `// AI 전략 함수 (JavaScript)
function makeGuess(gameState) {
  const { keywords, myHints, previousGuesses, revealedAnswers, revealedWrongs, answerCount } = gameState;
  
  // 가능한 키워드 인덱스 목록
  const availableIndices = keywords
    .map((_, index) => index)
    .filter(idx => !revealedWrongs.includes(idx));
  
  // 이미 공개된 정답 우선 선택
  const selectedIndices = [...revealedAnswers];
  
  // 나머지는 랜덤 선택
  while (selectedIndices.length < answerCount) {
    const remaining = availableIndices.filter(idx => !selectedIndices.includes(idx));
    if (remaining.length === 0) break;
    
    const randomIdx = remaining[Math.floor(Math.random() * remaining.length)];
    selectedIndices.push(randomIdx);
  }
  
  return selectedIndices;
}`;
                    updatePlayer(player.id, { aiCode: exampleCode });
                  }}
                >
                  예제 코드
                </button>
              </div>
            </div>
            
            <div className="editor-wrapper">
              <div className="line-numbers">
                {((player.aiCode || '') + '\n').split('\n').map((_, index) => (
                  <div key={index} className="line-number">{index + 1}</div>
                ))}
              </div>
              <textarea
                className="code-editor"
                value={player.aiCode || ''}
                onChange={(e) => updatePlayer(player.id, { aiCode: e.target.value })}
                placeholder={player.aiLanguage === 'typescript' 
                  ? "// TypeScript AI 전략 코드를 작성하세요\n// 타입 정의와 함께 작성해주세요"
                  : "// JavaScript AI 전략 코드를 작성하세요\n// function makeGuess(gameState) { ... }"
                }
                spellCheck={false}
              />
            </div>
            
            <div className="editor-footer">
              <div className="code-stats">
                <span>줄: {(player.aiCode || '').split('\n').length}</span>
                <span>문자: {(player.aiCode || '').length}</span>
              </div>
              <button 
                className="btn-large btn-primary"
                onClick={() => setCodeEditorModal({ isOpen: false, playerId: null })}


              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderModeSelection = () => (
    <div className="game-screen mode-selection">
      <h2>게임 모드를 선택하세요</h2>
      <div className="mode-cards">
        <div className="mode-card" onClick={() => handleModeSelect('solo')}>
          <h3>개인전</h3>
          <p>AI와 1:1 대결하는 모드입니다.<br/>난이도를 선택할 수 있어요.</p>
        </div>
        <div className="mode-card" onClick={() => handleModeSelect('multi')}>
          <h3>멀티플레이</h3>
          <p>2~6명이 함께 플레이하는 모드입니다.<br/>친구들과 함께 즐겨보세요.</p>
        </div>
      </div>
    </div>
  );

  const renderDifficultySelection = () => (
    <div className="game-screen difficulty-selection">
      <div className="setup-actions" style={{ justifyContent: 'flex-start', marginBottom: '30px' }}>
        <button 
          className="btn-large btn-secondary" 
          onClick={() => setCurrentScreen('mode-selection')}
        >
          ← 뒤로가기
        </button>
      </div>
      
      <h2>AI 난이도를 선택하세요</h2>
      <div className="difficulty-cards">
        <div className="difficulty-card" onClick={() => handleDifficultySelect('easy')}>
          <h3>🌱 쉬움</h3>
          <p>AI가 무작위로 키워드를 선택합니다.<br/>편안하게 게임을 즐기세요.</p>
        </div>
        <div className="difficulty-card" onClick={() => handleDifficultySelect('medium')}>
          <h3>🌿 보통</h3>
          <p>AI가 공개된 정답을 활용합니다.<br/>적당한 도전을 원한다면 선택하세요.</p>
        </div>
        <div className="difficulty-card" onClick={() => handleDifficultySelect('hard')}>
          <h3>🌳 어려움</h3>
          <p>AI가 이전 추측을 분석합니다.<br/>진정한 실력을 시험해보세요.</p>
        </div>
      </div>
    </div>
  );

  const renderPlayerSetup = () => (
    <div className="game-screen">
      <div className="setup-actions">
        <button 
          className="btn-large btn-secondary" 
          onClick={() => setCurrentScreen('mode-selection')}
        >
          ← 뒤로가기
        </button>
      </div>

      {gameMode === 'multi' && players.length === 0 && (
        <div className="form-section">
          <h2>플레이어 수를 선택하세요</h2>
          <div className="btn-group" style={{ justifyContent: 'center', marginTop: '20px' }}>
            {[2, 3, 4, 5, 6].map(num => (
              <button
                key={num}
                className="btn-large btn-secondary"
                onClick={() => handlePlayerCountSelect(num)}
              >
                {num}명
              </button>
            ))}
          </div>
        </div>
      )}

      {players.length > 0 && (
        <>
          <h2>{gameMode === 'solo' ? '플레이어 설정' : `${playerCount}명 플레이어 설정`}</h2>
          <div className="players-grid">
            {players.filter(player => gameMode === 'solo' ? player.type === 'human' : true).map((player) => (
              <div key={player.id} className="player-setup">
                <h4>{gameMode === 'solo' ? '플레이어' : `플레이어 ${player.id}`}</h4>
                
                <div className="form-section">
                  <input
                    type="text"
                    className="input-field"
                    placeholder="닉네임을 입력하세요"
                    value={player.nickname}
                    onChange={(e) => updatePlayer(player.id, { nickname: e.target.value })}
                    maxLength={20}
                  />
                </div>

                {gameMode === 'multi' && (
                  <div className="form-section">
                    <div className="radio-group">
                      <div className="radio-option">
                        <input
                          type="radio"
                          id={`human-${player.id}`}
                          name={`playerType-${player.id}`}
                          value="human"
                          checked={player.type === 'human'}
                          onChange={() => updatePlayer(player.id, { type: 'human', aiCode: '' })}
                        />
                        <label htmlFor={`human-${player.id}`}>인간</label>
                      </div>
                      <div className="radio-option">
                        <input
                          type="radio"
                          id={`ai-${player.id}`}
                          name={`playerType-${player.id}`}
                          value="custom-ai"
                          checked={player.type === 'custom-ai'}
                          onChange={() => {
                            updatePlayer(player.id, { type: 'custom-ai' });
                            setCodeEditorModal({ isOpen: true, playerId: player.id });
                          }}
                        />
                        <label htmlFor={`ai-${player.id}`}>AI</label>
                      </div>
                    </div>
                  </div>
                )}

                {player.type === 'custom-ai' && (
                  <div className="form-section">
                    <button
                      className="btn-large btn-ai-code"
                      onClick={() => setCodeEditorModal({ isOpen: true, playerId: player.id })}
                      style={{ width: '100%' }}
                    >
                      <span className="btn-ai-icon">&lt;/&gt;</span>
                      <span>{player.aiCode ? 'AI 코드 수정' : 'AI 코드 작성'}</span>
                    </button>
                    {player.aiCode && (
                      <div className="code-preview">
                        <small>코드가 작성되었습니다 ({player.aiCode.split('\n').length}줄)</small>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="setup-actions">
            <button
              className="btn-large btn-primary"
              onClick={handleStartGame}
              disabled={!canStartGame()}
            >
              게임 시작
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderGameConfig = () => (
    <div className="game-screen">
      <div className="setup-actions" style={{ justifyContent: 'flex-start', marginBottom: '30px' }}>
        <button 
          className="btn-large btn-secondary" 
          onClick={() => setCurrentScreen('player-setup')}
        >
          ← 뒤로가기
        </button>
      </div>

      <h2>게임 설정</h2>
      
      {/* 난이도 프리셋 */}
      <div className="form-section">
        <h3>난이도 프리셋</h3>
        <div className="btn-group" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className={`btn-large ${gameConfig.difficulty === 'beginner' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => applyPreset('beginner')}
          >
            초급
          </button>
          <button
            className={`btn-large ${gameConfig.difficulty === 'intermediate' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => applyPreset('intermediate')}
          >
            중급
          </button>
          <button
            className={`btn-large ${gameConfig.difficulty === 'advanced' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => applyPreset('advanced')}
          >
            고급
          </button>
        </div>
      </div>

      {/* 상세 설정 */}
      <div className="config-grid">
        <div className="config-item">
          <h4>키워드 풀 크기</h4>
          <p>전체 키워드 개수</p>
          <div className="number-input-group">
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ keywordPoolSize: Math.max(20, gameConfig.keywordPoolSize - 10) })}
            >
              -
            </button>
            <span className="number-display">{gameConfig.keywordPoolSize}개</span>
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ keywordPoolSize: Math.min(100, gameConfig.keywordPoolSize + 10) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="config-item">
          <h4>정답 개수</h4>
          <p>찾아야 할 정답 수</p>
          <div className="number-input-group">
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ answerCount: Math.max(2, gameConfig.answerCount - 1) })}
            >
              -
            </button>
            <span className="number-display">{gameConfig.answerCount}개</span>
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ answerCount: Math.min(15, gameConfig.answerCount + 1) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="config-item">
          <h4>힌트 개수</h4>
          <p>각 플레이어별 오답 힌트</p>
          <div className="number-input-group">
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ hintCount: Math.max(2, gameConfig.hintCount - 1) })}
            >
              -
            </button>
            <span className="number-display">{gameConfig.hintCount}개</span>
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ hintCount: Math.min(20, gameConfig.hintCount + 1) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="config-item">
          <h4>턴 제한시간</h4>
          <p>각 턴당 시간</p>
          <div className="number-input-group">
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ timeLimit: Math.max(15, gameConfig.timeLimit - 15) })}
            >
              -
            </button>
            <span className="number-display">{gameConfig.timeLimit}초</span>
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ timeLimit: Math.min(180, gameConfig.timeLimit + 15) })}
            >
              +
            </button>
          </div>
        </div>

        <div className="config-item">
          <h4>최대 턴 수</h4>
          <p>게임 종료 조건</p>
          <div className="number-input-group">
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ maxTurns: gameConfig.maxTurns ? Math.max(5, gameConfig.maxTurns - 5) : 15 })}
            >
              -
            </button>
            <span className="number-display">{gameConfig.maxTurns ? `${gameConfig.maxTurns}턴` : '무제한'}</span>
            <button 
              className="btn btn-small" 
              onClick={() => updateGameConfig({ maxTurns: gameConfig.maxTurns ? Math.min(50, gameConfig.maxTurns + 5) : 20 })}
            >
              +
            </button>
          </div>
          <button 
            className="btn btn-small" 
            onClick={() => updateGameConfig({ maxTurns: gameConfig.maxTurns ? undefined : 20 })}
            style={{ marginTop: '10px' }}
          >
            {gameConfig.maxTurns ? '무제한으로 변경' : '제한 설정'}
          </button>
        </div>
      </div>

      {/* 현재 난이도 표시 */}
      <div className="difficulty-indicator">
        <span>현재 난이도: <strong>{
          gameConfig.difficulty === 'beginner' ? '초급' :
          gameConfig.difficulty === 'intermediate' ? '중급' :
          gameConfig.difficulty === 'advanced' ? '고급' : '커스텀'
        }</strong></span>
      </div>

      <div className="setup-actions">
        <button
          className="btn-large btn-primary"
          onClick={handleConfigComplete}
        >
          설정 완료
        </button>
      </div>
    </div>
  );

  const renderGamePreparation = () => {
    const preparationSteps = [
      { title: '게임 초기화', description: '게임 환경을 설정하고 있습니다.' },
      { title: '키워드 생성', description: `${gameConfig.keywordPoolSize}개의 키워드를 생성하고 있습니다.` },
      { title: '정답 선택', description: `${gameConfig.answerCount}개의 정답을 무작위로 선택하고 있습니다.` },
      { title: '힌트 배포', description: '각 플레이어에게 오답 힌트를 배포하고 있습니다.' },
      { title: '최종 확인', description: '게임 준비를 완료하고 있습니다.' }
    ];

    return (
      <div className="game-screen">
        {preparationStep < 5 ? (
          <>
            <h2>게임 준비 중...</h2>
            <div className="preparation-progress">
              <div className="progress-steps">
                {preparationSteps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`progress-step ${index < preparationStep ? 'completed' : index === preparationStep ? 'active' : 'pending'}`}
                  >
                    <div className="step-circle">
                      {index < preparationStep ? '✓' : index + 1}
                    </div>
                    <div className="step-content">
                      <h4>{step.title}</h4>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${(preparationStep / 5) * 100}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <h2>게임 준비 완료!</h2>
            <div className="game-summary">
              <div className="summary-grid">
                <div className="summary-item">
                  <h4>참가자</h4>
                  <div className="player-chips">
                    {players.map(player => (
                      <span key={player.id} className="player-chip">
                        {player.nickname} ({player.type === 'built-in-ai' ? 'AI' : player.type === 'custom-ai' ? 'Custom AI' : '인간'})
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="summary-item">
                  <h4>게임 정보</h4>
                  <div className="game-info-grid">
                    <div>키워드 풀: <strong>{gameConfig.keywordPoolSize}개</strong></div>
                    <div>정답 개수: <strong>{gameConfig.answerCount}개</strong></div>
                    <div>힌트 개수: <strong>{gameConfig.hintCount}개</strong></div>
                    <div>턴 시간: <strong>{gameConfig.timeLimit}초</strong></div>
                    <div>최대 턴: <strong>{gameConfig.maxTurns || '무제한'}</strong></div>
                  </div>
                </div>

              </div>
              
              <div className="game-start-section">
                <div className="countdown-info">
                  <h3>모든 준비가 완료되었습니다!</h3>
                  <p>게임을 시작하시겠습니까?</p>
                </div>
                
                <div className="setup-actions">
                  <button 
                    className="btn-large btn-secondary" 
                    onClick={() => setCurrentScreen('game-config')}
                  >
                    ← 설정 변경
                  </button>
                  <button 
                    className="btn-large btn-primary" 
                    onClick={startActualGame}
                  >
                    게임 시작! 🎮
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderGameScreen = () => {
    const currentPlayer = getCurrentPlayer();
    const isGameFinished = isGameOver();

    // 힌트 보기 단계
    if (hintViewingPhase) {
      const viewingPlayer = players.find(p => p.id === currentViewingPlayer);
      const hasViewedHints = gameState.hintsViewed[currentViewingPlayer];
      
      // AI 플레이어는 건너뛰기
      if (viewingPlayer?.type === 'built-in-ai') {
        const nextPlayer = currentViewingPlayer + 1;
        if (nextPlayer <= players.length) {
          setTimeout(() => setCurrentViewingPlayer(nextPlayer), 0);
        } else {
          setHintViewingPhase(false);
          if (gameManagerRef.current) {
            gameManagerRef.current.startGame(
              gameState.keywords,
              gameState.answers,
              gameState.playerHints
            );
          } else {
            // GameManager 없이 게임 시작 시 타이머 시작
            setTimeout(() => {
              setGameState(prev => ({
                ...prev,
                currentTurn: 1
              }));
              startTimer();
            }, 100);
          }
        }
        return null;
      }

      return (
        <div className="game-screen">
          <div className="hint-viewing-phase">
            <div className="exit-button-container">
              <button 
                className="btn btn-exit-small"
                onClick={exitGame}
              >
                게임 종료
              </button>
            </div>
            <h2>힌트 확인 단계</h2>
            <div className="viewing-instructions">
              <h3>{viewingPlayer?.nickname}님의 차례입니다</h3>
              <p>다른 플레이어는 화면을 보지 마세요!</p>
              
              {!hasViewedHints ? (
                <div className="hint-reveal">
                  <p>아래 버튼을 눌러 본인만의 힌트를 확인하세요.</p>
                  <button 
                    className="btn-large btn-primary"
                    onClick={() => setGameState(prev => ({
                      ...prev,
                      hintsViewed: { ...prev.hintsViewed, [currentViewingPlayer]: true }
                    }))}
                  >
                    내 힌트 보기
                  </button>
                </div>
              ) : (
                <div className="hint-display">
                  <h4>내 힌트 (이 키워드들은 정답이 아닙니다)</h4>
                  <div className="hint-chips">
                    {gameState.playerHints[currentViewingPlayer]?.map(hintIndex => (
                      <span key={hintIndex} className="hint-chip">
                        {gameState.keywords[hintIndex]}
                      </span>
                    ))}
                  </div>
                  <p>힌트를 기억하고 다음 버튼을 눌러주세요.</p>
                  <button 
                    className="btn-large btn-secondary"
                    onClick={() => {
                      const nextPlayer = currentViewingPlayer + 1;
                      if (nextPlayer <= players.length) {
                        setCurrentViewingPlayer(nextPlayer);
                      } else {
                        setHintViewingPhase(false);
                        // GameManager로 게임 시작
                        if (gameManagerRef.current) {
                          gameManagerRef.current.startGame(
                            gameState.keywords,
                            gameState.answers,
                            gameState.playerHints
                          );
                        } else {
                          // GameManager 없이 게임 시작 시 타이머 시작
                          setTimeout(() => {
                            setGameState(prev => ({
                              ...prev,
                              currentTurn: 1
                            }));
                            startTimer();
                          }, 100);
                        }
                      }
                    }}
                  >
                    확인 완료
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (isGameFinished) {
      return (
        <div className="game-screen">
          <div className="game-over">
            <h2>🎉 게임 종료!</h2>
            {gameState.winner ? (
              <div className="winner-announcement">
                <h3>{players.find(p => p.id === gameState.winner)?.nickname}님이 승리했습니다!</h3>
                <p>축하합니다! 정답을 모두 맞추셨습니다.</p>
              </div>
            ) : (
              <div className="draw-announcement">
                <h3>무승부</h3>
                <p>최대 턴 수에 도달했습니다.</p>
              </div>
            )}
            
            <div className="final-answers">
              <h4>정답은:</h4>
              <div className="answer-list">
                {gameState.answers.map(answerIndex => (
                  <span key={answerIndex} className="answer-chip">
                    {gameState.keywords[answerIndex]}
                  </span>
                ))}
              </div>
            </div>

            <div className="game-history">
              <h4>게임 기록</h4>
              <div className="history-list">
                {gameState.turnHistory.map((turn, index) => (
                  <div key={index} className="history-item">
                    <div className="turn-info">
                      <strong>턴 {turn.turnNumber}</strong> - {turn.playerName}
                    </div>
                    <div className="turn-keywords">
                      선택: {turn.guessKeywords.join(', ')}
                    </div>
                    <div className="turn-result">
                      {turn.correctCount}/{gameConfig.answerCount} 정답 ({turn.timeUsed}초 소요)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="setup-actions">
              <button 
                className="btn-large btn-secondary" 
                onClick={() => setCurrentScreen('mode-selection')}
              >
                새 게임
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="game-screen game-playing">
        {/* 게임 상태 헤더 */}
        <div className="game-header-info">
          <div className="turn-info">
            <h3>턴 {gameState.currentTurn}{gameConfig.maxTurns && ` / ${gameConfig.maxTurns}`}</h3>
            <p>
              {currentPlayer?.nickname}의 차례
              {isAIThinking && <span className="ai-thinking"> (생각하는 중...)</span>}
            </p>
          </div>
          <div className="header-controls">
            <div className="timer">
              <div className={`time-display ${timeRemaining <= 10 ? 'warning' : ''}`}>
                {timeRemaining}초
              </div>
              <div className="timer-bar">
                <div 
                  className="timer-fill" 
                  style={{ 
                    width: `${(timeRemaining / gameConfig.timeLimit) * 100}%`,
                    backgroundColor: timeRemaining <= 10 ? '#FF5722' : 
                                   timeRemaining <= 30 ? '#FFC107' : '#4CAF50'
                  }}
                />
              </div>
            </div>
            <button 
              className="btn btn-exit"
              onClick={exitGame}
              title="게임 종료"
            >
              나가기
            </button>
          </div>
        </div>

        <div className="game-layout">
          {/* 왼쪽: 키워드 그리드 */}
          <div className="game-main">
            <div className="keyword-selection">
              <h4>키워드를 선택하세요 ({selectedKeywords.length}/{gameConfig.answerCount})</h4>
              <div className="keywords-grid">
                {gameState.keywords.map((keyword, index) => {
                  const isSelected = selectedKeywords.includes(index);
                  const isRevealedAnswer = gameState.revealedAnswers.includes(index);
                  const isRevealedWrong = gameState.revealedWrongAnswers.includes(index);
                  
                  return (
                    <button
                      key={index}
                      className={`keyword-btn ${isSelected ? 'selected' : ''} ${isRevealedAnswer ? 'revealed-answer' : ''} ${isRevealedWrong ? 'revealed-wrong' : ''}`}
                      onClick={() => toggleKeywordSelection(index)}
                      disabled={isSubmitting || isAIThinking || !isMyTurn}
                    >
                      {keyword}
                      {isRevealedAnswer && <span className="reveal-indicator">✓</span>}
                      {isRevealedWrong && <span className="reveal-indicator">❌</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="guess-controls">
              <div className="selected-display">
                <h5>선택된 키워드:</h5>
                <div className="selected-keywords">
                  {selectedKeywords.map(index => (
                    <span key={index} className="selected-chip">
                      {gameState.keywords[index]}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="control-buttons">
                <button 
                  className="btn-large btn-secondary"
                  onClick={() => setSelectedKeywords([])}
                  disabled={selectedKeywords.length === 0}
                >
                  선택 초기화
                </button>
                <button 
                  className="btn-large btn-primary"
                  onClick={submitGuess}
                  disabled={selectedKeywords.length !== gameConfig.answerCount || isSubmitting}
                >
                  추측 제출
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 게임 정보 */}
          <div className="game-sidebar">
            <div className="global-hints">
              <h4>게임 힌트</h4>
              <div className="hint-buttons">
                <button 
                  className="btn btn-hint"
                  onClick={revealAnswerHint}
                  disabled={gameState.answers.length === gameState.revealedAnswers.length}
                >
                  정답 1개 공개
                </button>
                <button 
                  className="btn btn-hint"
                  onClick={revealWrongHint}
                >
                  오답 1개 공개
                </button>
              </div>
              <div className="revealed-info">
                {gameState.revealedAnswers.length > 0 && (
                  <div>
                    <small>공개된 정답: {gameState.revealedAnswers.length}개</small>
                  </div>
                )}
                {gameState.revealedWrongAnswers.length > 0 && (
                  <div>
                    <small>공개된 오답: {gameState.revealedWrongAnswers.length}개</small>
                  </div>
                )}
              </div>
            </div>

            <div className="players-status">
              <h4>플레이어 현황</h4>
              <div className="players-list">
                {players.map(player => (
                  <div 
                    key={player.id} 
                    className={`player-status ${currentPlayer?.id === player.id ? 'current' : ''}`}
                  >
                    <span className="player-name">{player.nickname}</span>
                    <span className="player-type">({player.type === 'built-in-ai' ? 'AI' : player.type === 'custom-ai' ? 'Custom AI' : '인간'})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="turn-history">
              <h4>턴 기록</h4>
              <div className="history-scroll">
                {gameState.turnHistory.slice(-5).map((turn, index) => (
                  <div key={index} className="history-entry">
                    <div className="history-header">
                      <span>턴 {turn.turnNumber}: {turn.playerName}</span>
                    </div>
                    <div className="history-keywords">
                      {turn.guessKeywords.join(', ')}
                    </div>
                    <div className="history-result">
                      {turn.correctCount}/{gameConfig.answerCount} 정답
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="deduction-game">
      <div className="game-content">
        <div className="game-wrapper">
          <div className="game-header">
            <h1>Exclusive Deduction Game</h1>
            <p>서로 다른 단서로 정답을 추론하는 게임</p>
          </div>
          
          {currentScreen === 'mode-selection' && renderModeSelection()}
          {currentScreen === 'difficulty-selection' && renderDifficultySelection()}
          {currentScreen === 'player-setup' && renderPlayerSetup()}
          {currentScreen === 'game-config' && renderGameConfig()}
          {currentScreen === 'game-preparation' && renderGamePreparation()}
          {currentScreen === 'game' && renderGameScreen()}
        </div>
        
        {renderCodeEditorModal()}
      </div>
    </div>
  );
};

export default DeductionGame;