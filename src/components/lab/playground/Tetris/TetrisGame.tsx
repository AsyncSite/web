import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GameAuthWrapper from '../../../auth/GameAuthWrapper';
import { GameManagerFactory, GameDataManager, TetrisGameData } from '../../../../services/game';
import './TetrisGame.css';

// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = window.innerWidth < 768 ? 28 : 35; // Responsive block size
const COLORS = [null, '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF', '#FF8E0D', '#FFE138', '#3877FF'];
const SHAPES = [
  [], // index 0 is empty
  [[1, 1, 1, 1]], // I
  [[2, 2], [2, 2]], // O
  [[0, 3, 0], [3, 3, 3]], // T
  [[4, 4, 0], [0, 4, 4]], // S
  [[0, 5, 5], [5, 5, 0]], // Z
  [[6, 0, 0], [6, 6, 6]], // J
  [[0, 0, 7], [7, 7, 7]]  // L
];

// Points for different actions
const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2
};

// Speed curve for levels
const LEVEL_SPEEDS = [
  1000, // Level 1
  900,  // Level 2
  800,  // Level 3
  700,  // Level 4
  600,  // Level 5
  500,  // Level 6
  400,  // Level 7
  300,  // Level 8
  200,  // Level 9
  100   // Level 10+
];

interface Position {
  x: number;
  y: number;
}

interface Player {
  pos: Position;
  matrix: number[][];
  next: number[][];
}

interface GameState {
  board: number[][];
  player: Player | null;
  score: number;
  level: number;
  linesCleared: number;
  isGameOver: boolean;
  isPaused: boolean;
  isStarted: boolean;
  maxCombo: number;
  currentCombo: number;
  lastClearedLines: number;
  totalPieces: number;
}

interface TetrisLeaderboardEntry {
  rank: number;
  userName: string;
  score: number;
  level: number;
  linesCleared: number;
  playedAt: string;
}

const TetrisGame: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [gameManager, setGameManager] = useState<GameDataManager | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    player: null,
    score: 0,
    level: 1,
    linesCleared: 0,
    isGameOver: false,
    isPaused: false,
    isStarted: false,
    maxCombo: 0,
    currentCombo: 0,
    lastClearedLines: 0,
    totalPieces: 0
  });

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<TetrisLeaderboardEntry[]>([]);
  const [personalBest, setPersonalBest] = useState<number>(0);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Game timing
  const animationIdRef = useRef<number>();
  const dropCounterRef = useRef(0);
  const dropIntervalRef = useRef(1000);
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef<number>(0);

  // Initialize GameManager
  useEffect(() => {
    const manager = GameManagerFactory.getGameManager({
      isAuthenticated,
      enableFallback: true
    });
    setGameManager(manager);
  }, [isAuthenticated]);

  // Show notification
  const showNotification = useCallback((message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Create board
  const createBoard = useCallback(() => {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }, []);

  // Create player
  const createPlayer = useCallback((): Player => {
    const typeId = Math.floor(Math.random() * (SHAPES.length - 1)) + 1;
    const matrix = SHAPES[typeId];
    return {
      pos: { x: Math.floor(COLS / 2) - Math.floor(matrix[0].length / 2), y: 0 },
      matrix: matrix,
      next: SHAPES[Math.floor(Math.random() * (SHAPES.length - 1)) + 1]
    };
  }, []);

  // Collision detection
  const collision = useCallback((board: number[][], player: Player): boolean => {
    const { matrix, pos } = player;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] !== 0) {
          // Check boundaries
          if (pos.x + x < 0 || pos.x + x >= COLS || pos.y + y >= ROWS) {
            return true;
          }
          // Check collision with board
          if (pos.y + y >= 0 && board[pos.y + y][pos.x + x] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  // Merge player into board
  const merge = useCallback((board: number[][], player: Player) => {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          board[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }, []);

  // Clear completed lines
  const clearLines = useCallback((board: number[][]): { clearedCount: number; newBoard: number[][] } => {
    let clearedCount = 0;
    const newBoard = [...board];
    
    outer: for (let y = newBoard.length - 1; y > 0; --y) {
      for (let x = 0; x < newBoard[y].length; ++x) {
        if (newBoard[y][x] === 0) {
          continue outer;
        }
      }
      const row = newBoard.splice(y, 1)[0].fill(0);
      newBoard.unshift(row);
      ++y;
      clearedCount++;
    }
    
    return { clearedCount, newBoard };
  }, []);

  // Calculate score for cleared lines
  const calculateScore = useCallback((linesCleared: number, level: number): number => {
    switch (linesCleared) {
      case 1: return POINTS.SINGLE * level;
      case 2: return POINTS.DOUBLE * level;
      case 3: return POINTS.TRIPLE * level;
      case 4: return POINTS.TETRIS * level;
      default: return 0;
    }
  }, []);

  // Draw matrix
  const drawMatrix = useCallback((
    matrix: number[][], 
    offset: Position, 
    ctx: CanvasRenderingContext2D, 
    blockSize: number
  ) => {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          // Draw block
          ctx.fillStyle = COLORS[value] || '#fff';
          ctx.fillRect(
            (x + offset.x) * blockSize + 1, 
            (y + offset.y) * blockSize + 1, 
            blockSize - 2, 
            blockSize - 2
          );
          
          // Add enhanced 3D effect with gradient
          const gradient = ctx.createLinearGradient(
            (x + offset.x) * blockSize,
            (y + offset.y) * blockSize,
            (x + offset.x + 1) * blockSize,
            (y + offset.y + 1) * blockSize
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
          
          ctx.fillStyle = gradient;
          ctx.fillRect(
            (x + offset.x) * blockSize + 1,
            (y + offset.y) * blockSize + 1,
            blockSize - 2,
            blockSize - 2
          );
          
          // Restore original color for border
          ctx.fillStyle = COLORS[value] || '#fff';
          
          // Add subtle inner border
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(
            (x + offset.x) * blockSize + 2,
            (y + offset.y) * blockSize + 2,
            blockSize - 4,
            blockSize - 4
          );
        }
      });
    });
  }, []);

  // Draw ghost piece with enhanced visibility
  const drawGhost = useCallback((board: number[][], player: Player, ctx: CanvasRenderingContext2D) => {
    const ghost = { ...player, pos: { ...player.pos } };
    
    // Drop ghost to bottom
    while (!collision(board, ghost)) {
      ghost.pos.y++;
    }
    ghost.pos.y--;
    
    // Draw ghost with dashed outline for better visibility
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ghost.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          ctx.strokeRect(
            (x + ghost.pos.x) * BLOCK_SIZE + 2,
            (y + ghost.pos.y) * BLOCK_SIZE + 2,
            BLOCK_SIZE - 4,
            BLOCK_SIZE - 4
          );
        }
      });
    });
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }, [collision]);

  // Draw game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    if (!canvas || !nextCanvas) return;

    const context = canvas.getContext('2d');
    const nextContext = nextCanvas.getContext('2d');
    if (!context || !nextContext) return;

    // Main canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    context.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) {
      context.beginPath();
      context.moveTo(x * BLOCK_SIZE, 0);
      context.lineTo(x * BLOCK_SIZE, ROWS * BLOCK_SIZE);
      context.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      context.beginPath();
      context.moveTo(0, y * BLOCK_SIZE);
      context.lineTo(COLS * BLOCK_SIZE, y * BLOCK_SIZE);
      context.stroke();
    }
    
    drawMatrix(gameState.board, { x: 0, y: 0 }, context, BLOCK_SIZE);
    
    if (gameState.player && gameState.isStarted && !gameState.isGameOver) {
      // Draw ghost piece
      drawGhost(gameState.board, gameState.player, context);
      // Draw actual piece
      drawMatrix(gameState.player.matrix, gameState.player.pos, context, BLOCK_SIZE);
    }

    // Next block canvas
    nextContext.fillStyle = '#000';
    nextContext.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (gameState.player?.next) {
      const blockSizeNext = 25;
      const nextMatrix = gameState.player.next;
      const offsetX = (nextCanvas.width / blockSizeNext - nextMatrix[0].length) / 2;
      const offsetY = (nextCanvas.height / blockSizeNext - nextMatrix.length) / 2;
      drawMatrix(nextMatrix, { x: offsetX, y: offsetY }, nextContext, blockSizeNext);
    }
  }, [gameState.board, gameState.player, gameState.isStarted, gameState.isGameOver, drawMatrix, drawGhost]);

  // Player movements
  const playerMove = useCallback((dir: number) => {
    if (!gameState.player || gameState.isGameOver || gameState.isPaused || !gameState.isStarted) return;
    
    const newPlayer = {
      ...gameState.player,
      pos: { ...gameState.player.pos, x: gameState.player.pos.x + dir }
    };
    
    if (!collision(gameState.board, newPlayer)) {
      setGameState(prev => ({ ...prev, player: newPlayer }));
    }
  }, [gameState.player, gameState.board, gameState.isGameOver, gameState.isPaused, gameState.isStarted, collision]);

  const playerRotate = useCallback((direction: number = 1) => {
    if (!gameState.player || gameState.isGameOver || gameState.isPaused || !gameState.isStarted) return;

    const matrix = gameState.player.matrix;
    const n = matrix.length;
    const newMatrix = Array(matrix[0].length).fill(null).map(() => Array(n).fill(0));
    
    if (direction === 1) {
      // Clockwise rotation
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          newMatrix[j][n - 1 - i] = matrix[i][j];
        }
      }
    } else {
      // Counter-clockwise rotation
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
          newMatrix[matrix[i].length - 1 - j][i] = matrix[i][j];
        }
      }
    }

    const newPlayer = { ...gameState.player, matrix: newMatrix };
    const originalX = newPlayer.pos.x;
    
    // Try wall kicks for smoother rotation
    const kicks = [0, -1, 1, -2, 2];
    for (const kick of kicks) {
      newPlayer.pos.x = originalX + kick;
      if (!collision(gameState.board, newPlayer)) {
        setGameState(prev => ({ ...prev, player: newPlayer }));
        return;
      }
    }
  }, [gameState.player, gameState.board, gameState.isGameOver, gameState.isPaused, gameState.isStarted, collision]);

  const playerDrop = useCallback(() => {
    if (!gameState.player || gameState.isGameOver || gameState.isPaused || !gameState.isStarted) return;

    const newPlayer = {
      ...gameState.player,
      pos: { ...gameState.player.pos, y: gameState.player.pos.y + 1 }
    };

    if (collision(gameState.board, newPlayer)) {
      // Merge and create new piece
      merge(gameState.board, gameState.player);
      const { clearedCount, newBoard } = clearLines(gameState.board);
      
      let scoreIncrease = 0;
      if (clearedCount > 0) {
        scoreIncrease = calculateScore(clearedCount, gameState.level);
      }
      
      const newScore = gameState.score + scoreIncrease + POINTS.SOFT_DROP;
      const newLinesCleared = gameState.linesCleared + clearedCount;
      const newLevel = Math.min(Math.floor(newLinesCleared / 10) + 1, 10); // Cap at level 10
      const newCombo = clearedCount > 0 ? gameState.currentCombo + 1 : 0;
      const newMaxCombo = Math.max(gameState.maxCombo, newCombo);
      
      // Update drop speed with better curve
      dropIntervalRef.current = LEVEL_SPEEDS[Math.min(newLevel - 1, LEVEL_SPEEDS.length - 1)];

      const nextPlayer = createPlayer();
      nextPlayer.matrix = gameState.player.next;
      nextPlayer.next = SHAPES[Math.floor(Math.random() * (SHAPES.length - 1)) + 1];
      
      if (collision(newBoard, nextPlayer)) {
        setGameState(prev => ({ 
          ...prev, 
          board: newBoard,
          isGameOver: true,
          currentCombo: newCombo,
          maxCombo: newMaxCombo
        }));
        handleGameOver();
      } else {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          player: nextPlayer,
          score: newScore,
          level: newLevel,
          linesCleared: newLinesCleared,
          currentCombo: newCombo,
          maxCombo: newMaxCombo,
          lastClearedLines: clearedCount,
          totalPieces: prev.totalPieces + 1
        }));
      }
    } else {
      setGameState(prev => ({ 
        ...prev, 
        player: newPlayer,
        score: prev.score + POINTS.SOFT_DROP
      }));
    }
    
    dropCounterRef.current = 0;
  }, [gameState, collision, merge, clearLines, createPlayer, calculateScore]);

  const playerHardDrop = useCallback(() => {
    if (!gameState.player || gameState.isGameOver || gameState.isPaused || !gameState.isStarted) return;
    
    let dropDistance = 0;
    const newPlayer = { ...gameState.player, pos: { ...gameState.player.pos } };
    
    while (!collision(gameState.board, newPlayer)) {
      newPlayer.pos.y++;
      dropDistance++;
    }
    newPlayer.pos.y--;
    dropDistance--;
    
    setGameState(prev => ({
      ...prev,
      player: newPlayer,
      score: prev.score + (dropDistance * POINTS.HARD_DROP)
    }));
    
    // Force immediate drop
    dropCounterRef.current = dropIntervalRef.current;
  }, [gameState.player, gameState.board, gameState.isGameOver, gameState.isPaused, gameState.isStarted, collision]);

  // Game loop
  const update = useCallback((time: number = 0) => {
    if (gameState.isGameOver || gameState.isPaused || !gameState.isStarted) return;

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    dropCounterRef.current += deltaTime;
    if (dropCounterRef.current > dropIntervalRef.current) {
      playerDrop();
    }

    draw();
    animationIdRef.current = requestAnimationFrame(update);
  }, [gameState.isGameOver, gameState.isPaused, gameState.isStarted, playerDrop, draw]);

  // Load leaderboard
  const loadLeaderboard = useCallback(async () => {
    if (!gameManager) return;

    setIsLoadingLeaderboard(true);
    try {
      const leaderboardResult = await gameManager.getLeaderboard('TETRIS', 10);
      const personalBestResult = await gameManager.getPersonalBest('TETRIS');

      if (leaderboardResult.success) {
        // Map to TetrisLeaderboardEntry format
        const mappedLeaderboard: TetrisLeaderboardEntry[] = leaderboardResult.data.map(entry => ({
          rank: entry.rank,
          userName: entry.userName,
          score: entry.score,
          level: entry.additionalData?.level || 1,
          linesCleared: entry.additionalData?.linesCleared || 0,
          playedAt: entry.playedAt.toISOString()
        }));
        
        setLeaderboard(mappedLeaderboard);
      } else if (!isAuthenticated) {
        showNotification('로그인이 필요한 기능입니다. 게스트로 계속 플레이할 수 있습니다.');
      }

      if (personalBestResult.success) {
        setPersonalBest(personalBestResult.data);
      }
    } catch (error: any) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [gameManager, isAuthenticated, showNotification]);

  // Start new game
  const startNewGame = useCallback(async () => {
    if (!gameManager) return;

    // Start game session
    try {
      const sessionResult = await gameManager.startGameSession('TETRIS');
      if (sessionResult.success) {
        setCurrentSessionId(sessionResult.data.sessionId);
      } else {
        showNotification('세션 시작에 실패했습니다. 게스트 모드로 진행합니다.');
      }
    } catch (error: any) {
      console.error('Failed to start game session:', error);
    }

    startTimeRef.current = Date.now();
    dropCounterRef.current = 0;
    dropIntervalRef.current = 1000;
    lastTimeRef.current = 0;

    const newBoard = createBoard();
    const newPlayer = createPlayer();

    setGameState({
      board: newBoard,
      player: newPlayer,
      score: 0,
      level: 1,
      linesCleared: 0,
      isGameOver: false,
      isPaused: false,
      isStarted: true,
      maxCombo: 0,
      currentCombo: 0,
      lastClearedLines: 0,
      totalPieces: 0
    });

    setShowStartScreen(false);
  }, [gameManager, createBoard, createPlayer, showNotification]);

  // Handle game over
  const handleGameOver = useCallback(async () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    if (!gameManager) return;

    const timeElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // Prepare game result
    const gameResult: TetrisGameData = {
      gameType: 'TETRIS',
      score: gameState.score,
      linesCleared: gameState.linesCleared,
      level: gameState.level,
      maxCombo: gameState.maxCombo,
      timeElapsedSeconds: timeElapsed,
      playedAt: new Date()
    };

    // End game session or save result
    try {
      if (currentSessionId) {
        const endResult = await gameManager.endGameSession(currentSessionId, gameResult);
        if (!endResult.success) {
          showNotification('점수 저장에 실패했습니다. 로컬에 저장됩니다.');
        }
      } else {
        // No session, save directly
        const saveResult = await gameManager.saveGameResult(gameResult);
        if (!saveResult.success) {
          showNotification('점수 저장에 실패했습니다.');
        }
      }

      // Update personal best
      const personalBestResult = await gameManager.getPersonalBest('TETRIS');
      if (personalBestResult.success) {
        setPersonalBest(personalBestResult.data);
      }
    } catch (error: any) {
      console.error('Failed to save game result:', error);
      showNotification('점수 저장 중 오류가 발생했습니다.');
    }

    // Clear session ID
    setCurrentSessionId(null);

    // Load leaderboard
    loadLeaderboard();
  }, [gameManager, currentSessionId, gameState, loadLeaderboard, showNotification]);

  // Handle keyboard input with improved controls
  useEffect(() => {
    let keyDownTimer: NodeJS.Timeout | null = null;
    let isKeyHeld = false;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default for arrow keys to stop page scrolling
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }
      
      if (isKeyHeld && event.key !== 'ArrowDown') return; // Prevent key repeat except for down
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          playerMove(-1);
          if (!isKeyHeld) {
            isKeyHeld = true;
            keyDownTimer = setInterval(() => playerMove(-1), 100);
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          playerMove(1);
          if (!isKeyHeld) {
            isKeyHeld = true;
            keyDownTimer = setInterval(() => playerMove(1), 100);
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          playerDrop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          playerRotate(1);
          break;
        case 'z':
        case 'Z':
          playerRotate(-1); // Counter-clockwise
          break;
        case ' ':
          playerHardDrop();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          if (gameState.isStarted) {
            setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
          }
          break;
        case 'r':
        case 'R':
          if (gameState.isGameOver) {
            startNewGame();
          }
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      if (keyDownTimer && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || 
          event.key === 'a' || event.key === 'A' || event.key === 'd' || event.key === 'D')) {
        clearInterval(keyDownTimer);
        keyDownTimer = null;
        isKeyHeld = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (keyDownTimer) clearInterval(keyDownTimer);
    };
  }, [playerMove, playerDrop, playerRotate, playerHardDrop, gameState.isStarted, gameState.isGameOver, startNewGame]);

  // Set canvas size and prevent layout shift
  useEffect(() => {
    const canvas = canvasRef.current;
    const nextCanvas = nextCanvasRef.current;
    
    if (canvas) {
      // Set dimensions before any drawing to prevent layout shift
      canvas.style.width = `${COLS * BLOCK_SIZE}px`;
      canvas.style.height = `${ROWS * BLOCK_SIZE}px`;
      canvas.width = COLS * BLOCK_SIZE;
      canvas.height = ROWS * BLOCK_SIZE;
    }
    
    if (nextCanvas) {
      nextCanvas.style.width = '120px';
      nextCanvas.style.height = '120px';
      nextCanvas.width = 120;
      nextCanvas.height = 120;
    }
    
    // Initial draw to prevent blank canvas
    draw();
  }, [draw]);

  // Start animation loop when game state changes
  useEffect(() => {
    if (!gameState.isGameOver && !gameState.isPaused && gameState.player && gameState.isStarted) {
      animationIdRef.current = requestAnimationFrame(update);
      return () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
      };
    }
  }, [gameState.isGameOver, gameState.isPaused, gameState.player, gameState.isStarted, update]);

  // Draw when game state changes
  useEffect(() => {
    draw();
  }, [gameState, draw]);

  // Load personal best on mount
  useEffect(() => {
    if (gameManager) {
      loadLeaderboard();
      
      // Load personal best
      gameManager.getPersonalBest('TETRIS').then(result => {
        if (result.success) {
          setPersonalBest(result.data);
        }
      });
    }
  }, [gameManager, loadLeaderboard]);

  // Focus canvas on mount for keyboard input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && gameState.isStarted) {
      canvas.focus();
    }
  }, [gameState.isStarted]);

  return (
    <GameAuthWrapper 
      gameTitle="테트리스" 
      features={{ 
        saveProgress: true, 
        leaderboard: true, 
        achievements: false 
      }}
    >
      <div className="tetris-game" onMouseDown={(e) => e.preventDefault()}>
        {/* Notification */}
        {notification && (
          <div className="tetris-notification">
            {notification}
          </div>
        )}
        
        <div className="tetris-navigation">
          <button 
            className="back-to-lab-button"
            onClick={() => navigate('/lab')}
            aria-label="Lab으로 돌아가기"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Lab으로 돌아가기</span>
          </button>
        </div>
        <h1 className="tetris-title">테트리스</h1>
        
        <div className="tetris-container">
          {showStartScreen && !gameState.isStarted ? (
            <div className="tetris-start-screen">
              <div className="tetris-logo">
                <span className="tetris-logo-text">TETRIS</span>
              </div>
              <div className="tetris-start-info">
                <h2>게임 방법</h2>
                <div className="tetris-controls-info">
                  <div className="control-item">
                    <span className="control-key">←→ / A D</span>
                    <span className="control-desc">좌우 이동</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">↓ / S</span>
                    <span className="control-desc">빠른 낙하</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">↑ / W</span>
                    <span className="control-desc">시계방향 회전</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">Z</span>
                    <span className="control-desc">반시계방향 회전</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">Space</span>
                    <span className="control-desc">즉시 낙하</span>
                  </div>
                  <div className="control-item">
                    <span className="control-key">P / ESC</span>
                    <span className="control-desc">일시정지</span>
                  </div>
                </div>
                <div className="tetris-level-description">
                  <h3>레벨 시스템</h3>
                  <p>• 10줄을 제거할 때마다 레벨 상승</p>
                  <p>• 레벨이 오를수록 블록 낙하 속도 증가</p>
                  <p>• 최고 레벨 10에서는 초당 10개의 블록 속도</p>
                </div>
                {personalBest > 0 && (
                  <div className="tetris-best-score">
                    <p>최고 점수: <span>{personalBest.toLocaleString()}</span></p>
                  </div>
                )}
                <button 
                  className="tetris-button tetris-start-button"
                  onClick={startNewGame}
                >
                  게임 시작
                </button>
                <button 
                  className="tetris-button tetris-leaderboard-button"
                  onClick={() => {
                    setShowLeaderboard(true);
                    if (isAuthenticated) {
                      loadLeaderboard();
                    }
                  }}
                >
                  리더보드
                </button>
              </div>
            </div>
          ) : (
            <div className="tetris-main">
              {/* Game Canvas */}
              <div className="tetris-canvas-container">
                <canvas 
                  ref={canvasRef} 
                  id="tetris" 
                  className="tetris-canvas"
                  tabIndex={0}
                />
                
                {/* Game Over Overlay */}
                {gameState.isGameOver && (
                  <div className="tetris-game-over">
                    <h2>게임 오버</h2>
                    <div className="tetris-final-score">
                      <p className="score-label">최종 점수</p>
                      <p className="score-value">{gameState.score.toLocaleString()}</p>
                      <div className="score-details">
                        <p>레벨: {gameState.level}</p>
                        <p>제거한 줄: {gameState.linesCleared}</p>
                        <p>최대 콤보: {gameState.maxCombo}</p>
                      </div>
                    </div>
                    <div className="tetris-game-over-actions">
                      <button 
                        className="tetris-button tetris-restart-button"
                        onClick={startNewGame}
                      >
                        다시 시작
                      </button>
                      <button 
                        className="tetris-button tetris-home-button"
                        onClick={() => {
                          setShowStartScreen(true);
                          setGameState(prev => ({ ...prev, isStarted: false }));
                        }}
                      >
                        메인 화면
                      </button>
                      <button 
                        className="tetris-button tetris-leaderboard-button"
                        onClick={() => {
                          setShowLeaderboard(true);
                          if (isAuthenticated) {
                            loadLeaderboard();
                          }
                        }}
                      >
                        리더보드
                      </button>
                    </div>
                  </div>
                )}

                {/* Pause Overlay */}
                {gameState.isPaused && !gameState.isGameOver && (
                  <div className="tetris-pause-overlay">
                    <h2>일시정지</h2>
                    <p>P키를 눌러 계속하기</p>
                  </div>
                )}
              </div>

              {/* Game Info */}
              <div className="tetris-info">
                <div className="tetris-info-box">
                  <h3>점수</h3>
                  <p className="tetris-score">{gameState.score.toLocaleString()}</p>
                </div>
                <div className="tetris-info-box">
                  <h3>레벨</h3>
                  <p className="tetris-level">{gameState.level}</p>
                  <span className="level-info">속도: {Math.round(1000 / LEVEL_SPEEDS[Math.min(gameState.level - 1, LEVEL_SPEEDS.length - 1)])}블록/초</span>
                </div>
                <div className="tetris-info-box">
                  <h3>라인</h3>
                  <p className="tetris-lines">{gameState.linesCleared}</p>
                </div>
                <div className="tetris-info-box">
                  <h3>다음</h3>
                  <canvas 
                    ref={nextCanvasRef}
                    id="next"
                    className="tetris-next-canvas"
                  />
                </div>
                {personalBest > 0 && (
                  <div className="tetris-info-box">
                    <h3>최고 기록</h3>
                    <p className="tetris-personal-best">{personalBest.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile Controls */}
          {gameState.isStarted && !showStartScreen && (
            <div className="tetris-mobile-controls">
              <button 
                className="tetris-control-button tetris-rotate-button"
                onTouchStart={() => playerRotate(1)}
                onClick={() => playerRotate(1)}
              >
                ↻
              </button>
              <div className="tetris-direction-controls">
                <button 
                  className="tetris-control-button"
                  onTouchStart={() => playerMove(-1)}
                  onClick={() => playerMove(-1)}
                >
                  ←
                </button>
                <button 
                  className="tetris-control-button"
                  onTouchStart={playerDrop}
                  onClick={playerDrop}
                >
                  ↓
                </button>
                <button 
                  className="tetris-control-button"
                  onTouchStart={() => playerMove(1)}
                  onClick={() => playerMove(1)}
                >
                  →
                </button>
              </div>
              <button 
                className="tetris-control-button tetris-drop-button"
                onTouchStart={playerHardDrop}
                onClick={playerHardDrop}
              >
                ⬇
              </button>
            </div>
          )}
        </div>

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="tetris-modal-overlay" onClick={() => setShowLeaderboard(false)}>
            <div className="tetris-modal" onClick={e => e.stopPropagation()}>
              <h2>리더보드</h2>
              
              {/* Personal Best Display */}
              <div className="tetris-personal-best">
                <h3>개인 최고 기록</h3>
                <div className="personal-best-score">
                  {personalBest > 0 ? (
                    <>
                      <span className="score-label">최고 점수:</span>
                      <span className="score-value">{personalBest.toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="no-score">아직 기록이 없습니다</span>
                  )}
                </div>
              </div>
              
              {/* Global Leaderboard */}
              <div className="tetris-global-leaderboard">
                <h3>전체 순위</h3>
                {!isAuthenticated && (
                  <div className="guest-notice">
                    <p>로그인하면 리더보드에 참여할 수 있습니다!</p>
                    <button 
                      className="tetris-button tetris-login-button"
                      onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                    >
                      로그인하기
                    </button>
                  </div>
                )}
                
                {isLoadingLeaderboard ? (
                  <div className="tetris-loading">로딩 중...</div>
                ) : (
                  <div className="tetris-leaderboard">
                    {leaderboard.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th>순위</th>
                            <th>플레이어</th>
                            <th>점수</th>
                            <th>레벨</th>
                            <th>라인</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map(entry => (
                            <tr key={entry.rank} className={entry.userName === user?.username ? 'current-user' : ''}>
                              <td>{entry.rank}</td>
                              <td>{entry.userName}</td>
                              <td>{entry.score.toLocaleString()}</td>
                              <td>{entry.level}</td>
                              <td>{entry.linesCleared}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-records">
                        {isAuthenticated ? '아직 기록이 없습니다.' : '로그인 후 순위를 확인하세요.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                className="tetris-button tetris-close-button"
                onClick={() => setShowLeaderboard(false)}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </GameAuthWrapper>
  );
};

export default TetrisGame;