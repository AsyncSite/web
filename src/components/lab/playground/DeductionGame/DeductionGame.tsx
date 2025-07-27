import React, { useState, useEffect, useRef } from 'react';
import './DeductionGame.css';
import { GameManager } from './ai/GameManager';
import { PlayerFactory } from './ai/PlayerFactory';
import { IPlayer } from './ai/players/BasePlayer';
import { HumanPlayer } from './ai/players/HumanPlayer';
import { PlayerInfo, PlayerType } from './ai/types/PlayerTypes';
import AIGuideModal from './AIGuideModal';
import DeductionLeaderboard from './components/DeductionLeaderboard';
import GameAuthWrapper from '../../../auth/GameAuthWrapper';
import { useAuth } from '../../../../contexts/AuthContext';
import { GameManagerFactory, GameDataManager, DeductionGameData, TurnDetail } from '../../../../services/game';

type GameScreen =
  | 'mode-selection'
  | 'difficulty-selection'
  | 'player-setup'
  | 'game-config'
  | 'game-preparation'
  | 'game';
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
  const { isAuthenticated } = useAuth();
  const [gameDataManager, setGameDataManager] = useState<GameDataManager | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [guideSlideIndex, setGuideSlideIndex] = useState(0);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isAIGuideModalOpen, setIsAIGuideModalOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
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
    difficulty: 'intermediate',
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
    hintsViewed: {},
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
  // Track hint usage for leaderboard
  const [correctAnswerHintsUsed, setCorrectAnswerHintsUsed] = useState(0);
  const [wrongAnswerHintsUsed, setWrongAnswerHintsUsed] = useState(0);
  const [turnDetailsData, setTurnDetailsData] = useState<TurnDetail[]>([]);
  const [codeEditorModal, setCodeEditorModal] = useState<{
    isOpen: boolean;
    playerId: number | null;
  }>({
    isOpen: false,
    playerId: null,
  });
  const [globalHintsEnabled, setGlobalHintsEnabled] = useState(true);
  // const [isGuideExpanded, setIsGuideExpanded] = useState(true);
  const [isModalExpanded, setIsModalExpanded] = useState(false);
  const [testResults, setTestResults] = useState<
    Array<{ id: number; success: boolean; message: string; details?: any; isFading?: boolean }>
  >([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResultIdCounter, setTestResultIdCounter] = useState(0);

  // Initialize GameManager
  useEffect(() => {
    const manager = GameManagerFactory.getGameManager({
      isAuthenticated,
      enableFallback: true
    });
    setGameDataManager(manager);
  }, [isAuthenticated]);

  // Remove lab-content padding for full screen experience
  useEffect(() => {
    const labContent = document.querySelector('.lab-content') as HTMLElement;
    
    if (labContent) {
      const originalPadding = labContent.style.padding;
      labContent.style.padding = '0';
      
      return () => {
        labContent.style.padding = originalPadding;
      };
    }
  }, []);

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
      {
        id: 2,
        nickname: `AI (${difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'})`,
        type: 'built-in-ai',
        aiDifficulty: difficulty,
      },
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
        aiLanguage: 'javascript',
      });
    }
    setPlayers(newPlayers);
  };

  const updatePlayer = (id: number, updates: Partial<PlayerConfig>) => {
    setPlayers((prev) =>
      prev.map((player) => (player.id === id ? { ...player, ...updates } : player)),
    );
  };

  const canStartGame = () => {
    return players.every((player) => {
      if (!player.nickname.trim()) return false;
      if (player.type === 'custom-ai' && !player.aiCode?.trim()) return false;
      return true;
    });
  };

  const handleStartGame = () => {
    setCurrentScreen('game-config');
  };

  const handleConfigComplete = () => {
    setPreparationStep(0);
    setCurrentScreen('game-preparation');
    initializeGame();
  };

  // 키워드 풀 (실제로는 더 많은 키워드가 필요)
  const keywordCategories = {
    animals: [
      '사자',
      '호랑이',
      '코끼리',
      '기린',
      '원숭이',
      '코알라',
      '판다',
      '펭귄',
      '독수리',
      '상어',
      '고래',
      '돌고래',
      '토끼',
      '고양이',
      '강아지',
      '말',
      '소',
      '돼지',
      '양',
      '염소',
    ],
    foods: [
      '피자',
      '햄버거',
      '스파게티',
      '초밥',
      '김치찌개',
      '불고기',
      '치킨',
      '라면',
      '떡볶이',
      '김밥',
      '샐러드',
      '스테이크',
      '카레',
      '우동',
      '냉면',
      '비빔밥',
      '갈비',
      '삼겹살',
      '회',
      '족발',
    ],
    objects: [
      '컴퓨터',
      '스마트폰',
      '자동차',
      '비행기',
      '기차',
      '자전거',
      '책',
      '연필',
      '가방',
      '시계',
      '안경',
      '모자',
      '신발',
      '옷',
      '침대',
      '의자',
      '책상',
      '냉장고',
      '세탁기',
      '텔레비전',
    ],
    places: [
      '학교',
      '병원',
      '은행',
      '카페',
      '식당',
      '공원',
      '해변',
      '산',
      '도서관',
      '박물관',
      '영화관',
      '쇼핑몰',
      '시장',
      '교회',
      '지하철역',
      '공항',
      '호텔',
      '집',
      '회사',
      '체육관',
    ],
    actions: [
      '걷기',
      '뛰기',
      '수영',
      '춤추기',
      '노래하기',
      '요리하기',
      '공부하기',
      '운전하기',
      '그림그리기',
      '글쓰기',
      '읽기',
      '잠자기',
      '먹기',
      '마시기',
      '웃기',
      '울기',
      '생각하기',
      '말하기',
      '듣기',
      '보기',
    ],
  };

  const generateKeywords = (size: number): string[] => {
    const allKeywords = Object.values(keywordCategories).flat();
    const shuffled = [...allKeywords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  };

  const initializeGame = async () => {
    // Start game session
    if (gameDataManager) {
      try {
        const sessionResult = await gameDataManager.startGameSession('DEDUCTION');
        if (sessionResult.success) {
          setCurrentSessionId(sessionResult.data.sessionId);
        }
      } catch (error) {
        console.error('Failed to start game session:', error);
      }
    }
    
    // Record game start time
    setGameStartTime(Date.now());
    
    // Reset hint usage counters
    setCorrectAnswerHintsUsed(0);
    setWrongAnswerHintsUsed(0);
    setTurnDetailsData([]);
    
    // 1단계: 키워드 생성
    setPreparationStep(1);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const keywords = generateKeywords(gameConfig.keywordPoolSize);

    // 2단계: 정답 선택
    setPreparationStep(2);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const answerIndices: number[] = [];
    const shuffledIndices = Array.from({ length: keywords.length }, (_, i) => i).sort(
      () => Math.random() - 0.5,
    );
    for (let i = 0; i < gameConfig.answerCount; i++) {
      answerIndices.push(shuffledIndices[i]);
    }

    // 3단계: 힌트 배포
    setPreparationStep(3);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const playerHints: { [playerId: number]: number[] } = {};
    const nonAnswerIndices = shuffledIndices.filter((i) => !answerIndices.includes(i));

    players.forEach((player) => {
      const hints: number[] = [];
      const availableHints = [...nonAnswerIndices].sort(() => Math.random() - 0.5);
      for (let i = 0; i < gameConfig.hintCount && i < availableHints.length; i++) {
        hints.push(availableHints[i]);
      }
      playerHints[player.id] = hints;
    });

    // 4단계: 준비 완료
    setPreparationStep(4);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setGameState({
      keywords,
      answers: answerIndices,
      playerHints,
      isReady: true,
      currentTurn: 0, // GameManager가 관리하므로 0으로 시작
      turnHistory: [],
      gameStatus: 'playing',
      revealedAnswers: [],
      revealedWrongAnswers: [],
      hintsViewed: {},
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
      maxTurns: gameConfig.maxTurns,
      globalHintsEnabled: globalHintsEnabled,
    });

    // 플레이어 생성
    const gamePlayers: IPlayer[] = players.map((config) => {
      const playerInfo: PlayerInfo = {
        id: config.id,
        nickname: config.nickname,
        type: config.type,
        aiDifficulty: config.aiDifficulty,
        customCode: config.aiCode,
        customLanguage: config.aiLanguage,
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
        setGameState((prev) => ({
          ...prev,
          currentTurn: context.currentTurn,
        }));
      },
      onTurnEnd: (result) => {
        setIsAIThinking(false);
        // Get updated game context to sync revealed wrong answers from global hints
        const context = manager.getGameContext();
        setGameState((prev) => {
          const newState = {
            ...prev,
            turnHistory: [...prev.turnHistory, result],
            revealedWrongAnswers: context.revealedWrongAnswers,
          };
          return newState;
        });
      },
      onGameEnd: async (winner) => {
        const timeElapsed = Math.floor((Date.now() - gameStartTime) / 1000);
        const humanPlayer = players.find(p => p.type === 'human');
        const didWin = !!(winner && humanPlayer && winner.getInfo().nickname === humanPlayer.nickname);
        
        // Get the latest game context from GameManager to ensure we have all turns
        const finalContext = manager.getGameContext();
        
        
        // Calculate score based on various factors
        const baseScore = 1000;
        const turnBonus = Math.max(0, (gameConfig.maxTurns || 20) - finalContext.currentTurn) * 50;
        const timeBonus = Math.max(0, 300 - timeElapsed) * 2;
        const difficultyMultiplier = gameMode === 'solo' 
          ? (soloDifficulty === 'easy' ? 1 : soloDifficulty === 'medium' ? 1.5 : 2)
          : 1;
        const humanGuessCount = humanPlayer ? finalContext.turnHistory.filter(t => t.playerName === humanPlayer.nickname).length : 0;
        const totalScore = didWin 
          ? Math.floor((baseScore + turnBonus + timeBonus) * difficultyMultiplier)
          : Math.floor(humanGuessCount * 50);

        // Find opponent info
        const opponent = players.find(p => p.id !== humanPlayer?.id);
        const isAIOpponent = opponent?.type === 'built-in-ai' || opponent?.type === 'custom-ai';
        
        // Save game result
        if (gameDataManager && humanPlayer) {
          const gameResult: DeductionGameData = {
            gameType: 'DEDUCTION',
            score: totalScore,
            difficulty: gameMode === 'solo' ? soloDifficulty : 'medium',
            guessesCount: humanGuessCount,
            hintsUsed: correctAnswerHintsUsed + wrongAnswerHintsUsed, // For backward compatibility
            wrongAnswerHintsUsed: wrongAnswerHintsUsed,
            correctAnswerHintsUsed: correctAnswerHintsUsed,
            playersCount: players.length,
            won: didWin,
            opponentType: isAIOpponent ? 'AI' : 'HUMAN',
            opponentDifficulty: isAIOpponent && opponent ? opponent.aiDifficulty : undefined,
            opponentId: !isAIOpponent && opponent ? opponent.nickname : undefined,
            timeElapsedSeconds: timeElapsed,
            playedAt: new Date(),
            turnDetails: turnDetailsData
          };

          try {
            if (currentSessionId) {
              await gameDataManager.endGameSession(currentSessionId, gameResult);
            } else {
              await gameDataManager.saveGameResult(gameResult);
            }
          } catch (error) {
            console.error('Failed to save game result:', error);
          }
        }

        if (winner) {
          const winnerInfo = winner.getInfo();
          setGameState((prev) => ({
            ...prev,
            gameStatus: 'finished',
            winner: winnerInfo.id,
          }));
        } else {
          setGameState((prev) => ({
            ...prev,
            gameStatus: 'finished',
          }));
        }
        
        // Removed automatic leaderboard display
        // User can click "리더보드 보기" button to view leaderboard
      },
      onTimerTick: (remainingTime) => {
        setTimeRemaining(remainingTime);
      },
      onAIThinking: (thinking) => {
        setIsAIThinking(thinking);
      },
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
      setTimeRemaining((prev) => {
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
      .filter((index) => !gameState.revealedWrongAnswers.includes(index));

    const shuffled = [...availableKeywords].sort(() => Math.random() - 0.5);
    const autoSelection = shuffled.slice(0, gameConfig.answerCount);

    setSelectedKeywords(autoSelection);

    // 잠시 후 자동 제출
    setTimeout(() => {
      submitGuessWithSelection(autoSelection);
    }, 500);
  };

  const runAICodeTest = async (aiCode: string, language: 'javascript' | 'typescript') => {
    setIsTestRunning(true);

    try {
      // 1. 먼저 기본 문법 검사만 수행
      try {
        new Function(aiCode);
      } catch (e: any) {
        const newResult = {
          id: testResultIdCounter,
          success: false,
          message: '문법 오류',
          details: { error: e.message },
        };
        setTestResultIdCounter((prev) => prev + 1);
        setTestResults((prev) => [...prev, newResult]);

        setTimeout(() => {
          setTestResults((prev) =>
            prev.map((r) => (r.id === newResult.id ? { ...r, isFading: true } : r)),
          );
          setTimeout(() => {
            setTestResults((prev) => prev.filter((r) => r.id !== newResult.id));
          }, 500);
        }, 2000);
        return;
      }

      // 2. makeGuess 함수 존재 확인
      if (!aiCode.includes('function makeGuess') && !aiCode.includes('makeGuess =')) {
        const newResult = {
          id: testResultIdCounter,
          success: false,
          message: 'makeGuess 함수를 찾을 수 없습니다',
          details: { tip: 'function makeGuess(gameState) { ... } 형식으로 작성해주세요' },
        };
        setTestResultIdCounter((prev) => prev + 1);
        setTestResults((prev) => [...prev, newResult]);

        setTimeout(() => {
          setTestResults((prev) =>
            prev.map((r) => (r.id === newResult.id ? { ...r, isFading: true } : r)),
          );
          setTimeout(() => {
            setTestResults((prev) => prev.filter((r) => r.id !== newResult.id));
          }, 500);
        }, 2000);
        return;
      }

      // 3. 간단한 결함 검사 및 성능 측정
      const testCode = `
        ${aiCode}
        
        // 테스트 실행
        (function() {
          try {
            if (typeof makeGuess !== 'function') {
              throw new Error('makeGuess 함수가 정의되지 않았습니다');
            }
            
            // 다양한 크기의 테스트 데이터
            const testCases = [
              {
                keywords: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
                myHints: [0, 3, 7],
                answerCount: 4,
                previousGuesses: [],
                revealedAnswers: [],
                revealedWrongAnswers: [15, 18],
                currentTurn: 1,
                timeLimit: 60
              },
              {
                keywords: ['사자', '호랑이', '코끼리', '기린', '원숭이', '판다', '코알라', '펭귄', '독수리', '상어'],
                myHints: [0, 2, 5],
                answerCount: 3,
                previousGuesses: [{ playerId: 1, guess: [1, 3, 4], correctCount: 1 }],
                revealedAnswers: [],
                revealedWrongAnswers: [9],
                currentTurn: 2,
                timeLimit: 60
              },
              {
                keywords: Array.from({length: 50}, (_, i) => \`키워드\${i+1}\`),
                myHints: [0, 5, 10, 15, 20],
                answerCount: 5,
                previousGuesses: [],
                revealedAnswers: [25],
                revealedWrongAnswers: [1, 2, 3, 4],
                currentTurn: 1,
                timeLimit: 60
              }
            ];
            
            let totalTime = 0;
            const executionTimes = [];
            
            // 각 테스트 케이스를 10번씩 실행하여 평균 성능 측정
            for (let i = 0; i < testCases.length; i++) {
              const testCase = testCases[i];
              
              for (let j = 0; j < 10; j++) {
                const startTime = performance.now();
                const result = makeGuess(testCase);
                const endTime = performance.now();
                const execTime = endTime - startTime;
                
                executionTimes.push(execTime);
                totalTime += execTime;
                
                // 기본 검증
                if (!Array.isArray(result)) {
                  throw new Error('반환값이 배열이 아닙니다');
                }
                
                if (result.length !== testCase.answerCount) {
                  throw new Error(\`잘못된 개수의 선택 (기대: \${testCase.answerCount}, 실제: \${result.length})\`);
                }
                
                // 유효성 검사
                for (const idx of result) {
                  if (typeof idx !== 'number' || !Number.isInteger(idx)) {
                    throw new Error(\`유효하지 않은 인덱스: \${idx}\`);
                  }
                  if (idx < 0 || idx >= testCase.keywords.length) {
                    throw new Error(\`범위를 벗어난 인덱스: \${idx}\`);
                  }
                  if (testCase.myHints.includes(idx)) {
                    throw new Error(\`힌트로 받은 키워드를 선택했습니다 (인덱스: \${idx})\`);
                  }
                }
                
                // 중복 검사
                const uniqueSet = new Set(result);
                if (uniqueSet.size !== result.length) {
                  throw new Error('중복된 선택이 있습니다');
                }
              }
            }
            
            // 평균 실행 시간 계산
            const avgTime = totalTime / executionTimes.length;
            const maxTime = Math.max(...executionTimes);
            const minTime = Math.min(...executionTimes);
            
            // 첫 번째 테스트의 결과를 샘플로 반환
            const sampleResult = makeGuess(testCases[0]);
            
            return { 
              success: true, 
              result: sampleResult, 
              keywords: sampleResult.map(idx => testCases[0].keywords[idx]),
              performance: {
                avgTime: avgTime.toFixed(3),
                minTime: minTime.toFixed(3),
                maxTime: maxTime.toFixed(3),
                totalRuns: executionTimes.length
              }
            };
          } catch (error) {
            return { success: false, error: error.message };
          }
        })()
      `;

      const startTime = Date.now();
      let testResult;

      try {
        testResult = eval(testCode);
      } catch (e: any) {
        testResult = { success: false, error: e.message };
      }

      const executionTime = Date.now() - startTime;

      if (testResult && testResult.success) {
        const avgTime = parseFloat(testResult.performance.avgTime);
        const speedLevel =
          avgTime < 0.5 ? '매우 빠름' : avgTime < 2 ? '빠름' : avgTime < 5 ? '보통' : '느림';

        const newResult = {
          id: testResultIdCounter,
          success: true,
          message: `테스트 통과! AI 코드가 정상적으로 작동합니다.`,
          details: {
            executionTime: `${executionTime}ms`,
            selectedKeywords: testResult.keywords.join(', '),
            selectedIndices: testResult.result,
            performance: testResult.performance,
            speedLevel,
          },
        };
        setTestResultIdCounter((prev) => prev + 1);
        setTestResults((prev) => [...prev, newResult]);

        // 2초 후 자동으로 사라지도록 설정
        setTimeout(() => {
          setTestResults((prev) =>
            prev.map((r) => (r.id === newResult.id ? { ...r, isFading: true } : r)),
          );
          setTimeout(() => {
            setTestResults((prev) => prev.filter((r) => r.id !== newResult.id));
          }, 500);
        }, 2000);
      } else {
        const newResult = {
          id: testResultIdCounter,
          success: false,
          message: '테스트 실패',
          details: { error: testResult?.error || '알 수 없는 오류' },
        };
        setTestResultIdCounter((prev) => prev + 1);
        setTestResults((prev) => [...prev, newResult]);

        // 2초 후 자동으로 사라지도록 설정
        setTimeout(() => {
          setTestResults((prev) =>
            prev.map((r) => (r.id === newResult.id ? { ...r, isFading: true } : r)),
          );
          setTimeout(() => {
            setTestResults((prev) => prev.filter((r) => r.id !== newResult.id));
          }, 500);
        }, 2000);
      }
    } catch (error) {
      const newResult = {
        id: testResultIdCounter,
        success: false,
        message: '테스트 실행 중 오류가 발생했습니다',
        details: { error: error instanceof Error ? error.message : String(error) },
      };
      setTestResultIdCounter((prev) => prev + 1);
      setTestResults((prev) => [...prev, newResult]);

      setTimeout(() => {
        setTestResults((prev) =>
          prev.map((r) => (r.id === newResult.id ? { ...r, isFading: true } : r)),
        );
        setTimeout(() => {
          setTestResults((prev) => prev.filter((r) => r.id !== newResult.id));
        }, 500);
      }, 2000);
    } finally {
      setIsTestRunning(false);
    }
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
      hintsViewed: {},
    });
    setSelectedKeywords([]);
    setTimeRemaining(0);
    setIsMyTurn(false);
    setIsAIThinking(false);
    setHintViewingPhase(false);
    setCurrentViewingPlayer(0);
    setIsSubmitting(false);
  };

  const handleGlobalHintsToggle = () => {
    const newValue = !globalHintsEnabled;
    setGlobalHintsEnabled(newValue);

    // Update GameManager if it exists and sync the game state
    if (gameManagerRef.current) {
      gameManagerRef.current.setGlobalHintsEnabled(newValue);

      // Get updated game context and sync revealedWrongAnswers
      const updatedContext = gameManagerRef.current.getGameContext();
      setGameState((prev) => ({
        ...prev,
        revealedWrongAnswers: [...updatedContext.revealedWrongAnswers],
      }));
    }
  };

  const revealAnswerHint = () => {
    if (gameManagerRef.current) {
      const success = gameManagerRef.current.revealAnswer();
      if (success) {
        const context = gameManagerRef.current.getGameContext();
        setGameState((prev) => ({
          ...prev,
          revealedAnswers: context.revealedAnswers,
        }));
        setCorrectAnswerHintsUsed(prev => prev + 1);
      }
    } else {
      const unrevealedAnswers = gameState.answers.filter(
        (ans) => !gameState.revealedAnswers.includes(ans),
      );
      if (unrevealedAnswers.length > 0) {
        const randomAnswer =
          unrevealedAnswers[Math.floor(Math.random() * unrevealedAnswers.length)];
        setGameState((prev) => ({
          ...prev,
          revealedAnswers: [...prev.revealedAnswers, randomAnswer],
        }));
        setCorrectAnswerHintsUsed(prev => prev + 1);
      }
    }
  };

  const revealWrongHint = () => {
    if (gameManagerRef.current) {
      const success = gameManagerRef.current.revealWrongAnswer();
      if (success) {
        const context = gameManagerRef.current.getGameContext();
        setGameState((prev) => ({
          ...prev,
          revealedWrongAnswers: context.revealedWrongAnswers,
        }));
        setWrongAnswerHintsUsed(prev => prev + 1);
      }
    } else {
      const wrongAnswers = gameState.keywords
        .map((_, index) => index)
        .filter(
          (index) =>
            !gameState.answers.includes(index) && !gameState.revealedWrongAnswers.includes(index),
        );

      if (wrongAnswers.length > 0) {
        const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
        setGameState((prev) => ({
          ...prev,
          revealedWrongAnswers: [...prev.revealedWrongAnswers, randomWrong],
        }));
        setWrongAnswerHintsUsed(prev => prev + 1);
      }
    }
  };

  const toggleKeywordSelection = (keywordIndex: number) => {
    setSelectedKeywords((prev) => {
      if (prev.includes(keywordIndex)) {
        return prev.filter((index) => index !== keywordIndex);
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

    const correctCount = selection.filter((index) => gameState.answers.includes(index)).length;

    const isWinner =
      correctCount === gameConfig.answerCount &&
      selection.every((index) => gameState.answers.includes(index));

    const currentPlayerId = ((gameState.currentTurn - 1) % players.length) + 1;
    const currentPlayer = players.find((p) => p.id === currentPlayerId);
    const isHumanPlayer = currentPlayer?.type === 'human';

    // 실제 사용 시간 계산
    const actualTimeUsed = turnStartTime
      ? Math.round((Date.now() - turnStartTime) / 1000)
      : gameConfig.timeLimit - timeRemaining;

    // Record turn detail for human player
    if (isHumanPlayer) {
      const turnDetail: TurnDetail = {
        turnNumber: gameState.currentTurn,
        thinkTimeSeconds: actualTimeUsed,
        wasCorrect: isWinner,
        hintUsedBefore: null // Will be updated in hint functions
      };
      setTurnDetailsData(prev => [...prev, turnDetail]);
    }

    const turnResult: TurnResult = {
      playerId: currentPlayerId,
      playerName: currentPlayer?.nickname || `플레이어 ${currentPlayerId}`,
      guess: [...selection],
      guessKeywords: selection.map((index) => gameState.keywords[index]),
      correctCount,
      turnNumber: gameState.currentTurn,
      timeUsed: actualTimeUsed,
    };

    // 최대 턴 수 확인
    const isMaxTurnsReached = gameConfig.maxTurns && gameState.currentTurn >= gameConfig.maxTurns;

    setGameState((prev) => ({
      ...prev,
      turnHistory: [...prev.turnHistory, turnResult],
      currentTurn: prev.currentTurn + 1,
      gameStatus: isWinner ? 'finished' : isMaxTurnsReached ? 'finished' : 'playing',
      winner: isWinner ? currentPlayerId : undefined,
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
        return players.find((p) => p.id === playerInfo.id);
      }
    }
    const currentPlayerId = ((gameState.currentTurn - 1) % players.length) + 1;
    return players.find((p) => p.id === currentPlayerId);
  };

  const isGameOver = () => {
    return (
      gameState.gameStatus === 'finished' ||
      (gameConfig.maxTurns && gameState.currentTurn > gameConfig.maxTurns)
    );
  };

  const difficultyPresets = {
    beginner: { keywordPoolSize: 30, answerCount: 3, hintCount: 5, timeLimit: 90, maxTurns: 15 },
    intermediate: {
      keywordPoolSize: 50,
      answerCount: 5,
      hintCount: 5,
      timeLimit: 60,
      maxTurns: 20,
    },
    advanced: { keywordPoolSize: 80, answerCount: 7, hintCount: 4, timeLimit: 45, maxTurns: 25 },
  };

  const applyPreset = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const preset = difficultyPresets[difficulty];
    setGameConfig({ ...preset, difficulty });
  };

  const updateGameConfig = (updates: Partial<GameConfig>) => {
    setGameConfig((prev) => ({ ...prev, ...updates, difficulty: 'custom' }));
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

    const player = players.find((p) => p.id === codeEditorModal.playerId);
    if (!player) return null;

    return (
      <div
        className="modal-overlay"
        onClick={() => {
          setCodeEditorModal({ isOpen: false, playerId: null });
          setIsModalExpanded(false);
        }}
      >
        <div
          className={`modal-content code-editor-modal ${isModalExpanded ? 'expanded' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3>{player.nickname} AI 코드 에디터</h3>
            <div className="modal-header-actions">
              <button
                className="modal-expand-btn"
                onClick={() => setIsModalExpanded(!isModalExpanded)}
                title={isModalExpanded ? '기본 크기로' : '전체 화면 모드'}
              >
                {isModalExpanded ? '↙' : '↗'}
              </button>
              <button
                className="modal-close"
                onClick={() => {
                  setCodeEditorModal({ isOpen: false, playerId: null });
                  setIsModalExpanded(false);
                }}
              >
                ×
              </button>
            </div>
          </div>

          <div className="code-editor-container" style={{ position: 'relative' }}>
            {/* <AIGuidePanel 
              isExpanded={isGuideExpanded} 
              onToggle={() => setIsGuideExpanded(!isGuideExpanded)}
              onInsertTemplate={(template: any) => {
                updatePlayer(player.id, { aiCode: template });
              }}
            /> */}
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
                  className="btn btn-small btn-guide"
                  onClick={() => setIsAIGuideModalOpen(true)}
                >
                  📖 가이드 보기
                </button>
                <button
                  className="btn btn-small"
                  onClick={() => {
                    updatePlayer(player.id, { aiCode: '' });
                    setTestResults([]);
                  }}
                >
                  초기화
                </button>
                <button
                  className="btn btn-small"
                  onClick={() => {
                    const exampleCode =
                      player.aiLanguage === 'typescript'
                        ? `// AI 전략 함수 (TypeScript)
interface GameState {
  keywords: string[];
  myHints: number[];
  answerCount: number;
  previousGuesses: { playerId: number; guess: number[]; correctCount: number }[];
  revealedAnswers: number[];
  revealedWrongAnswers: number[];
  currentTurn: number;
  timeLimit: number;
}

function makeGuess(gameState: GameState): number[] {
  const { keywords, myHints, previousGuesses, revealedAnswers, revealedWrongAnswers, answerCount } = gameState;
  
  // 가능한 키워드 인덱스 목록 (힌트와 공개된 오답 제외)
  const availableIndices: number[] = keywords
    .map((_, index) => index)
    .filter(idx => !revealedWrongAnswers.includes(idx) && !myHints.includes(idx));
  
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
  const { keywords, myHints, previousGuesses, revealedAnswers, revealedWrongAnswers, answerCount } = gameState;
  
  // 가능한 키워드 인덱스 목록 (힌트와 공개된 오답 제외)
  const availableIndices = keywords
    .map((_, index) => index)
    .filter(idx => !revealedWrongAnswers.includes(idx) && !myHints.includes(idx));
  
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
                <button
                  className="btn btn-small btn-test"
                  onClick={() => {
                    if (player.aiCode) {
                      runAICodeTest(player.aiCode, player.aiLanguage || 'javascript');
                    }
                  }}
                  disabled={!player.aiCode || isTestRunning}
                >
                  {isTestRunning ? (
                    <>
                      테스트 중<span className="loading-dots"></span>
                    </>
                  ) : (
                    '테스트 실행'
                  )}
                </button>
              </div>
            </div>

            <div className="editor-wrapper">
              <div
                className="line-numbers"
                onScroll={(e) => {
                  const textarea = e.currentTarget.nextElementSibling as HTMLTextAreaElement;
                  if (textarea) textarea.scrollTop = e.currentTarget.scrollTop;
                }}
              >
                {((player.aiCode || '') + '\n').split('\n').map((_, index) => (
                  <div key={index} className="line-number">
                    {index + 1}
                  </div>
                ))}
              </div>
              <textarea
                className="code-editor"
                value={player.aiCode || ''}
                onChange={(e) => updatePlayer(player.id, { aiCode: e.target.value })}
                onScroll={(e) => {
                  const lineNumbers = e.currentTarget.previousElementSibling as HTMLDivElement;
                  if (lineNumbers) lineNumbers.scrollTop = e.currentTarget.scrollTop;
                }}
                placeholder={
                  player.aiLanguage === 'typescript'
                    ? '// TypeScript AI 전략 코드를 작성하세요\n// 타입 정의와 함께 작성해주세요'
                    : '// JavaScript AI 전략 코드를 작성하세요\n// function makeGuess(gameState) { ... }'
                }
                spellCheck={false}
              />
            </div>

            <div className="test-results-container">
              {testResults.map((result) => (
                <div
                  key={result.id}
                  className={`test-result-panel ${result.success ? 'success' : 'error'} ${result.isFading ? 'fade-out' : ''}`}
                >
                  <div className="test-result-header">
                    <h4>
                      {result.success ? (
                        <>
                          <span className="success-icon"></span>테스트 성공
                        </>
                      ) : (
                        <>
                          <span className="error-icon"></span>테스트 실패
                        </>
                      )}
                    </h4>
                    <button
                      className="close-result"
                      onClick={() => {
                        setTestResults((prev) => prev.filter((r) => r.id !== result.id));
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <p className="test-result-message">{result.message}</p>
                  {result.details && (
                    <div className="test-result-details">
                      {result.success ? (
                        <>
                          <div>샘플 선택: {result.details.selectedKeywords}</div>
                          {result.details.performance && (
                            <>
                              <div
                                style={{
                                  marginTop: '10px',
                                  borderTop: '1px solid rgba(255,255,255,0.2)',
                                  paddingTop: '10px',
                                }}
                              >
                                <strong>성능 측정 결과</strong>
                              </div>
                              <div style={{ marginTop: '5px' }}>
                                평균 실행 시간: {result.details.performance.avgTime}ms (
                                {result.details.speedLevel})
                              </div>
                              <div>
                                최소/최대: {result.details.performance.minTime}ms /{' '}
                                {result.details.performance.maxTime}ms
                              </div>
                              <div
                                style={{
                                  fontSize: '0.85em',
                                  color: 'rgba(255,255,255,0.7)',
                                  marginTop: '5px',
                                }}
                              >
                                * 30회 실행 (3가지 크기의 데이터 × 10회)
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <pre>{JSON.stringify(result.details, null, 2)}</pre>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="editor-footer">
              <div className="code-stats">
                <span>줄: {(player.aiCode || '').split('\n').length}</span>
                <span>문자: {(player.aiCode || '').length}</span>
              </div>
              <button
                className="btn-large btn-primary"
                onClick={() => {
                  setCodeEditorModal({ isOpen: false, playerId: null });
                  setIsModalExpanded(false);
                  setTestResults([]);
                }}
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
      <div className="guide-link-container">
        <button onClick={() => setIsGuideModalOpen(true)} className="guide-link">
          ?<span>게임 방법</span>
        </button>
      </div>
      <h2 style={{ marginTop: '60px' }}>게임 모드를 선택하세요</h2>
      <div className="mode-cards">
        <div className="mode-card" onClick={() => handleModeSelect('solo')}>
          <h3>개인전</h3>
          <p>
            AI와 1:1 대결하는 모드입니다.
            <br />
            난이도를 선택할 수 있어요.
          </p>
        </div>
        <div className="mode-card" onClick={() => handleModeSelect('multi')}>
          <h3>멀티플레이</h3>
          <p>
            2~6명이 함께 플레이하는 모드입니다.
            <br />
            친구들과 함께 즐겨보세요.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDifficultySelection = () => (
    <div className="game-screen difficulty-selection">
      <div className="back-button-container">
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
          <p>
            AI가 무작위로 키워드를 선택합니다.
            <br />
            편안하게 게임을 즐기세요.
          </p>
        </div>
        <div className="difficulty-card" onClick={() => handleDifficultySelect('medium')}>
          <h3>🌿 보통</h3>
          <p>
            AI가 공개된 정답을 활용합니다.
            <br />
            적당한 도전을 원한다면 선택하세요.
          </p>
        </div>
        <div className="difficulty-card" onClick={() => handleDifficultySelect('hard')}>
          <h3>🌳 어려움</h3>
          <p>
            AI가 이전 추측을 분석합니다.
            <br />
            진정한 실력을 시험해보세요.
          </p>
        </div>
      </div>
    </div>
  );

  const renderPlayerSetup = () => (
    <div className="game-screen">
      <div className="back-button-container">
        <button
          className="btn-large btn-secondary"
          onClick={() =>
            setCurrentScreen(gameMode === 'solo' ? 'difficulty-selection' : 'mode-selection')
          }
        >
          ← 뒤로가기
        </button>
      </div>

      {gameMode === 'multi' && players.length === 0 && (
        <div className="form-section" style={{ marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center' }}>플레이어 수를 선택하세요</h2>
          <div className="btn-group" style={{ justifyContent: 'center', marginTop: '40px' }}>
            {[2, 3, 4, 5, 6].map((num) => (
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
          <h2 style={{ textAlign: 'center', marginTop: '60px' }}>
            {gameMode === 'solo' ? '플레이어 설정' : `${playerCount}명 플레이어 설정`}
          </h2>
          <div className="players-grid">
            {players
              .filter((player) => (gameMode === 'solo' ? player.id === 1 : true))
              .map((player) => (
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

                  {(gameMode === 'multi' || (gameMode === 'solo' && player.id === 1)) && (
                    <div className="form-section">
                      <div className="radio-group">
                        <div
                          className="radio-option"
                          onClick={() => updatePlayer(player.id, { type: 'human', aiCode: '' })}
                        >
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
                        <div
                          className="radio-option"
                          onClick={() => {
                            updatePlayer(player.id, { type: 'custom-ai' });
                            setCodeEditorModal({ isOpen: true, playerId: player.id });
                          }}
                        >
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
                          <label htmlFor={`ai-${player.id}`}>
                            {gameMode === 'solo' ? '커스텀 AI' : 'AI'}
                          </label>
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
                          <small>
                            코드가 작성되었습니다 ({player.aiCode.split('\n').length}줄)
                          </small>
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
      <div className="back-button-container">
        <button
          className="btn-large btn-secondary"
          onClick={() => setCurrentScreen('player-setup')}
        >
          ← 뒤로가기
        </button>
      </div>

      <h2 style={{ textAlign: 'center' }}>게임 설정</h2>

      {/* 난이도 프리셋 */}
      <div className="form-section">
        <h3 style={{ textAlign: 'center' }}>난이도 프리셋</h3>
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
              onClick={() =>
                updateGameConfig({ keywordPoolSize: Math.max(20, gameConfig.keywordPoolSize - 10) })
              }
            >
              -
            </button>
            <span className="number-display">{gameConfig.keywordPoolSize}개</span>
            <button
              className="btn btn-small"
              onClick={() =>
                updateGameConfig({
                  keywordPoolSize: Math.min(100, gameConfig.keywordPoolSize + 10),
                })
              }
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
              onClick={() =>
                updateGameConfig({ answerCount: Math.max(2, gameConfig.answerCount - 1) })
              }
            >
              -
            </button>
            <span className="number-display">{gameConfig.answerCount}개</span>
            <button
              className="btn btn-small"
              onClick={() =>
                updateGameConfig({ answerCount: Math.min(15, gameConfig.answerCount + 1) })
              }
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
              onClick={() =>
                updateGameConfig({ hintCount: Math.min(20, gameConfig.hintCount + 1) })
              }
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
              onClick={() =>
                updateGameConfig({ timeLimit: Math.max(15, gameConfig.timeLimit - 15) })
              }
            >
              -
            </button>
            <span className="number-display">{gameConfig.timeLimit}초</span>
            <button
              className="btn btn-small"
              onClick={() =>
                updateGameConfig({ timeLimit: Math.min(180, gameConfig.timeLimit + 15) })
              }
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
              onClick={() =>
                updateGameConfig({
                  maxTurns: gameConfig.maxTurns ? Math.max(5, gameConfig.maxTurns - 5) : 15,
                })
              }
            >
              -
            </button>
            <span className="number-display">
              {gameConfig.maxTurns ? `${gameConfig.maxTurns}턴` : '무제한'}
            </span>
            <button
              className="btn btn-small"
              onClick={() =>
                updateGameConfig({
                  maxTurns: gameConfig.maxTurns ? Math.min(50, gameConfig.maxTurns + 5) : 20,
                })
              }
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
        <span>
          현재 난이도:{' '}
          <strong>
            {gameConfig.difficulty === 'beginner'
              ? '초급'
              : gameConfig.difficulty === 'intermediate'
                ? '중급'
                : gameConfig.difficulty === 'advanced'
                  ? '고급'
                  : '커스텀'}
          </strong>
        </span>
      </div>

      <div className="setup-actions">
        <button className="btn-large btn-primary" onClick={handleConfigComplete}>
          설정 완료
        </button>
      </div>
    </div>
  );

  const renderGamePreparation = () => {
    const preparationSteps = [
      { title: '⚙️ 게임 초기화', description: '게임 환경을 설정하고 있습니다.' },
      {
        title: '📚 키워드 생성',
        description: `${gameConfig.keywordPoolSize}개의 키워드를 생성하고 있습니다.`,
      },
      {
        title: '🎯 정답 선택',
        description: `${gameConfig.answerCount}개의 정답을 무작위로 선택하고 있습니다.`,
      },
      { title: '💡 힌트 배포', description: '각 플레이어에게 오답 힌트를 배포하고 있습니다.' },
      { title: '✅ 최종 확인', description: '게임 준비를 완료하고 있습니다.' },
    ];

    return (
      <div className="game-screen">
        {preparationStep < 5 ? (
          <>
            <h2>
              게임 준비 중<span className="loading-dots"></span>
            </h2>
            <div className="preparation-progress">
              <div className="progress-steps">
                {preparationSteps.map((step, index) => (
                  <div
                    key={index}
                    className={`progress-step ${index < preparationStep ? 'completed' : index === preparationStep ? 'active' : 'pending'}`}
                  >
                    <div className="step-circle">
                      <span className="step-number">{index + 1}</span>
                      {index < preparationStep ? (
                        <span className="success-icon-overlay"></span>
                      ) : index === preparationStep ? (
                        <span className="loading-spinner"></span>
                      ) : null}
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
            <div className="deduction-game-summary">
              <div className="deduction-summary-grid">
                <div className="summary-item">
                  <h4>참가자</h4>
                  <div className="player-chips">
                    {players.map((player) => (
                      <span key={player.id} className="player-chip">
                        {player.nickname} (
                        {player.type === 'built-in-ai'
                          ? 'AI'
                          : player.type === 'custom-ai'
                            ? 'Custom AI'
                            : '인간'}
                        )
                      </span>
                    ))}
                  </div>
                </div>

                <div className="summary-item">
                  <h4>게임 정보</h4>
                  <div className="game-info-grid">
                    <div>
                      키워드 풀: <strong>{gameConfig.keywordPoolSize}개</strong>
                    </div>
                    <div>
                      정답 개수: <strong>{gameConfig.answerCount}개</strong>
                    </div>
                    <div>
                      힌트 개수: <strong>{gameConfig.hintCount}개</strong>
                    </div>
                    <div>
                      턴 시간: <strong>{gameConfig.timeLimit}초</strong>
                    </div>
                    <div>
                      최대 턴: <strong>{gameConfig.maxTurns || '무제한'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="deduction-game-start-section">
                <div className="countdown-info">
                  <h3>모든 준비가 완료되었습니다!</h3>
                  <p>게임을 시작하시겠습니까?</p>
                </div>

                <div className="setup-actions" style={{ justifyContent: 'flex-start' }}>
                  <button
                    className="btn-large btn-secondary"
                    onClick={() => setCurrentScreen('game-config')}
                  >
                    ← 설정 변경
                  </button>
                  <button className="btn-large btn-primary" onClick={startActualGame}>
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
      const viewingPlayer = players.find((p) => p.id === currentViewingPlayer);
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
              gameState.playerHints,
            );
          } else {
            // GameManager 없이 게임 시작 시 타이머 시작
            setTimeout(() => {
              setGameState((prev) => ({
                ...prev,
                currentTurn: 1,
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
              <button className="btn btn-exit-small" onClick={exitGame}>
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
                    onClick={() =>
                      setGameState((prev) => ({
                        ...prev,
                        hintsViewed: { ...prev.hintsViewed, [currentViewingPlayer]: true },
                      }))
                    }
                  >
                    내 힌트 보기
                  </button>
                </div>
              ) : (
                <div className="hint-display">
                  <h4>내 힌트 (이 키워드들은 정답이 아닙니다)</h4>
                  <div className="hint-chips">
                    {gameState.playerHints[currentViewingPlayer]?.map((hintIndex) => (
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
                            gameState.playerHints,
                          );
                        } else {
                          // GameManager 없이 게임 시작 시 타이머 시작
                          setTimeout(() => {
                            setGameState((prev) => ({
                              ...prev,
                              currentTurn: 1,
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
            <h2>게임 종료!</h2>
            {gameState.winner ? (
              <div className="winner-announcement">
                <div className="victory-icon"></div>
                <h3>
                  {players.find((p) => p.id === gameState.winner)?.nickname}님이 승리했습니다!
                </h3>
                <p>축하합니다! 정답을 모두 맟추셨습니다.</p>
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
                {gameState.answers.map((answerIndex) => (
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
                    <div className="turn-keywords">선택: {turn.guessKeywords.join(', ')}</div>
                    <div className="turn-result">
                      {turn.correctCount}/{gameConfig.answerCount} 정답 ({turn.timeUsed}초 소요)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!isAuthenticated && (
              <div className="guest-notice-game-over">
                <p>💡 게스트로 플레이 중입니다. 로그인하면 리더보드에 점수를 등록할 수 있습니다!</p>
              </div>
            )}
            
            <div className="setup-actions">
              <button
                className="btn-large btn-primary"
                onClick={() => setShowLeaderboard(true)}
              >
                리더보드 보기
              </button>
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
            <h3>
              턴 {gameState.currentTurn}
              {gameConfig.maxTurns && ` / ${gameConfig.maxTurns}`}
            </h3>
            <p>
              {currentPlayer?.nickname}의 차례
              {isAIThinking && (
                <span className="ai-thinking">
                  생각하는 중<span className="loading-dots"></span>
                </span>
              )}
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
                    backgroundColor:
                      timeRemaining <= 10 ? '#FF5722' : timeRemaining <= 30 ? '#FFC107' : '#4CAF50',
                  }}
                />
              </div>
            </div>
            <button className="btn btn-exit" onClick={exitGame} title="게임 종료">
              나가기
            </button>
          </div>
        </div>

        <div className="game-layout">
          {/* 왼쪽: 키워드 그리드 */}
          <div className="game-main">
            <div className="keyword-selection">
              <h4>
                키워드를 선택하세요 ({selectedKeywords.length}/{gameConfig.answerCount})
              </h4>
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
                  {selectedKeywords.map((index) => (
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
              <div className="global-hints-toggle">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={globalHintsEnabled}
                    onChange={handleGlobalHintsToggle}
                    className="toggle-checkbox"
                  />
                  <span className="toggle-switch"></span>
                  <span className="toggle-text">
                    글로벌 힌트 {globalHintsEnabled ? '켜짐' : '꺼짐'}
                  </span>
                </label>
                <small className="toggle-description">
                  모든 선택이 오답일 경우 자동으로 오답 표시
                </small>
              </div>
              <div className="hint-buttons">
                <button
                  className="btn btn-hint"
                  onClick={revealAnswerHint}
                  disabled={gameState.answers.length === gameState.revealedAnswers.length}
                >
                  정답 1개 공개
                </button>
                <button className="btn btn-hint" onClick={revealWrongHint}>
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
                {players.map((player) => (
                  <div
                    key={player.id}
                    className={`player-status ${currentPlayer?.id === player.id ? 'current' : ''}`}
                  >
                    <span className="player-name">{player.nickname}</span>
                    <span className="player-type">
                      (
                      {player.type === 'built-in-ai'
                        ? 'AI'
                        : player.type === 'custom-ai'
                          ? 'Custom AI'
                          : '인간'}
                      )
                    </span>
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
                      <span>
                        턴 {turn.turnNumber}: {turn.playerName}
                      </span>
                    </div>
                    <div className="history-keywords">{turn.guessKeywords.join(', ')}</div>
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

  const renderGuideModal = () => {
    if (!isGuideModalOpen) return null;

    const guideSlides = [
      {
        title: '게임 목표: 숨겨진 키워드를 찾아라!',
        content:
          '수많은 키워드 풀에서 정답으로 지정된 몇 개의 키워드를 가장 먼저 찾아내는 플레이어가 승리합니다.',
      },
      {
        title: '핵심 규칙: 단서와 추론',
        content:
          "각 플레이어는 자신만 아는 '힌트(정답이 아닌 키워드)'를 받습니다. 매 턴, 정답이라 생각하는 키워드들을 추측하면, 그중에 진짜 정답이 '몇 개'인지 결과만 알려줍니다.",
      },
      {
        title: '승리 조건: 완벽한 추리',
        content:
          '모든 정답 키워드를 정확히 맞추는 추측을 가장 먼저 한 플레이어가 게임의 승자가 됩니다. 제한 시간이 있으니 신속하고 정확한 추리가 필요합니다!',
      },
    ];

    const goToNextSlide = () => {
      setGuideSlideIndex((prev) => (prev + 1) % guideSlides.length);
    };

    const goToPrevSlide = () => {
      setGuideSlideIndex((prev) => (prev - 1 + guideSlides.length) % guideSlides.length);
    };

    return (
      <div className="modal-overlay" onClick={() => setIsGuideModalOpen(false)}>
        <div className="modal-content guide-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>게임 가이드</h3>
            <button className="modal-close" onClick={() => setIsGuideModalOpen(false)}>
              ×
            </button>
          </div>
          <div className="guide-slides-container">
            <div className="guide-slide">
              <h4>{guideSlides[guideSlideIndex].title}</h4>
              <p>{guideSlides[guideSlideIndex].content}</p>
            </div>
          </div>
          <div className="guide-controls">
            <button onClick={goToPrevSlide}>이전</button>
            <div className="slide-indicators">
              {guideSlides.map((_, index) => (
                <span
                  key={index}
                  className={`indicator ${guideSlideIndex === index ? 'active' : ''}`}
                ></span>
              ))}
            </div>
            <button onClick={goToNextSlide}>다음</button>
          </div>
        </div>
      </div>
    );
  };

  // 테마 결정 함수
  const getThemeClass = () => {
    // 모드 선택 화면과 난이도 선택 화면에서는 항상 기본 테마
    if (currentScreen === 'mode-selection' || currentScreen === 'difficulty-selection') {
      return 'theme-intermediate';
    }

    if (gameMode === 'solo') {
      // 솔로 모드에서는 난이도에 따라 테마 결정
      switch (soloDifficulty) {
        case 'easy':
          return 'theme-beginner';
        case 'medium':
          return 'theme-intermediate';
        case 'hard':
          return 'theme-advanced';
        default:
          return 'theme-intermediate';
      }
    } else {
      // 멀티플레이어 모드는 항상 커스텀(네온 초록색) 테마
      return 'theme-custom';
    }
  };

  return (
    <GameAuthWrapper 
      gameTitle="추리 게임" 
      features={{ 
        saveProgress: false, 
        leaderboard: true, 
        achievements: false 
      }}
    >
      <div className={`deduction-game ${getThemeClass()}`}>
        <div className="deduction-container">
          <div className="game-header">
            <h1>Exclusive Deduction Game</h1>
            <p>서로 다른 단서로 정답을 추론하는 게임</p>
          </div>
          <div className="game-content">
            <div className="game-wrapper">

              {currentScreen === 'mode-selection' && renderModeSelection()}
              {currentScreen === 'difficulty-selection' && renderDifficultySelection()}
              {currentScreen === 'player-setup' && renderPlayerSetup()}
              {currentScreen === 'game-config' && renderGameConfig()}
              {currentScreen === 'game-preparation' && renderGamePreparation()}
              {currentScreen === 'game' && renderGameScreen()}
            </div>
          </div>

          {renderCodeEditorModal()}
          {renderGuideModal()}
          <AIGuideModal isOpen={isAIGuideModalOpen} onClose={() => setIsAIGuideModalOpen(false)} />
          <DeductionLeaderboard 
            isVisible={showLeaderboard} 
            onClose={() => setShowLeaderboard(false)} 
          />
        </div>
      </div>
    </GameAuthWrapper>
  );
};

export default DeductionGame;
