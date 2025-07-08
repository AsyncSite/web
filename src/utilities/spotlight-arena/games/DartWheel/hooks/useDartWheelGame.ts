import { useState, useCallback, useRef, useEffect } from 'react';
import { Participant, GameStatus } from '../../../../../components/lab/utilities/spotlight-arena/shared/types';
import { 
  DartWheelGameState, 
  DartWheelSection, 
  DartWheelSpinResult,
  DartWheelGameSettings,
  DartWheelEvent,
  DartWheelGameMode,
  DartWheelModeState
} from '../types/dartWheel';
import { 
  dartWheelGenerateWeightedSections, 
  dartWheelShuffleSections,
  DART_WHEEL_WEIGHT_PRESETS 
} from '../utils/dartWheelSectionGenerator';
import { dartWheelGenerateWeightedRotation } from '../utils/dartWheelCalculations';
import {
  dartWheelCreateTeams,
  dartWheelUpdateTeamScores,
  dartWheelDetermineSurvivalElimination,
  dartWheelUpdateSurvivalState,
  dartWheelCalculateTargetResults,
  dartWheelDetermineWinnersByMode,
  dartWheelCheckGameEndCondition,
} from '../utils/dartWheelGameModes';
import { DART_WHEEL_THEME_PALETTES } from '../utils/dartWheelVisualEffects';
import { DartWheelTheme } from '../components/DartWheelThemeSelector';
import { gameHistoryService } from '../../../../../components/lab/utilities/spotlight-arena/shared/services';
import { GameResult } from '../../../../../components/lab/utilities/spotlight-arena/shared/types/storage';

interface UseDartWheelGameProps {
  participants: Participant[];
  winnerCount: number;
}

interface UseDartWheelGameReturn {
  dartWheelGameState: DartWheelGameState;
  dartWheelGameStatus: GameStatus;
  dartWheelWinners: Participant[];
  dartWheelStartGame: () => void;
  dartWheelSpinWheel: () => void;
  dartWheelIsSpinning: boolean;
  dartWheelCurrentParticipant: Participant | null;
  dartWheelEvents: DartWheelEvent[];
  dartWheelShowCountdown: boolean;
  dartWheelSettings: DartWheelGameSettings;
  dartWheelUpdateSettings: (settings: DartWheelGameSettings) => void;
  dartWheelTheme: DartWheelTheme;
  dartWheelSetTheme: (theme: DartWheelTheme) => void;
  dartWheelGameMode: DartWheelGameMode;
  dartWheelSetGameMode: (mode: DartWheelGameMode) => void;
  dartWheelModeState: DartWheelModeState;
}

const DEFAULT_DART_WHEEL_SETTINGS: DartWheelGameSettings = {
  dartWheelMinSpinDuration: 3000,
  dartWheelMaxSpinDuration: 5000,
  dartWheelDecelerationRate: 0.98,
  dartWheelSectionCount: 8,
  dartWheelAutoSpin: false,
  dartWheelSpinDelay: 1000,
  dartWheelEnableWeights: false,
  dartWheelEnableBonus: false,
  dartWheelBonusSectionCount: 1,
  dartWheelGameMode: 'classic',
  dartWheelTargetScore: 100,
  dartWheelTeamCount: 2,
};

const DART_WHEEL_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#DDA0DD', '#F7DC6F', '#85C1E2', '#F8B500'
];

export function useDartWheelGame({ 
  participants, 
  winnerCount 
}: UseDartWheelGameProps): UseDartWheelGameReturn {
  const [dartWheelGameStatus, setDartWheelGameStatus] = useState<GameStatus>('waiting');
  const [dartWheelWinners, setDartWheelWinners] = useState<Participant[]>([]);
  const [dartWheelShowCountdown, setDartWheelShowCountdown] = useState(false);
  const [dartWheelEvents, setDartWheelEvents] = useState<DartWheelEvent[]>([]);
  
  const dartWheelGameStartTimeRef = useRef<number>(0);
  const dartWheelSettingsRef = useRef<DartWheelGameSettings>(DEFAULT_DART_WHEEL_SETTINGS);
  const [dartWheelSettings, setDartWheelSettings] = useState<DartWheelGameSettings>(DEFAULT_DART_WHEEL_SETTINGS);
  const [dartWheelTheme, setDartWheelTheme] = useState<DartWheelTheme>('casino');
  const [dartWheelGameMode, setDartWheelGameMode] = useState<DartWheelGameMode>('classic');
  const [dartWheelModeState, setDartWheelModeState] = useState<DartWheelModeState>({});
  
  // 다트휠 섹션 초기화
  const initializeDartWheelSections = useCallback((): DartWheelSection[] => {
    const settings = dartWheelSettingsRef.current;
    
    // 가중치 시스템이 활성화된 경우
    if (settings.dartWheelEnableWeights || settings.dartWheelEnableBonus) {
      const sections = dartWheelGenerateWeightedSections(
        settings,
        'balanced' // 기본적으로 균등 분배
      );
      return dartWheelShuffleSections(sections);
    }
    
    // 기존 방식 (균등 분배)
    const sectionCount = settings.dartWheelSectionCount;
    const angleSize = 360 / sectionCount;
    const themeColors = DART_WHEEL_THEME_PALETTES[dartWheelTheme].primary;
    
    return Array.from({ length: sectionCount }, (_, index) => ({
      id: `dartwheel-section-${index}`,
      label: `${(index + 1) * 10}점`,
      value: (index + 1) * 10,
      color: themeColors[index % themeColors.length],
      angle: index * angleSize,
      angleSize: angleSize,
      weight: 1,
    }));
  }, [dartWheelTheme]);

  // 게임 상태 초기화
  const [dartWheelGameState, setDartWheelGameState] = useState<DartWheelGameState>({
    dartWheelStatus: 'idle',
    dartWheelCurrentRotation: 0,
    dartWheelTargetRotation: 0,
    dartWheelSpinStartTime: null,
    dartWheelSpinDuration: 0,
    dartWheelCurrentParticipantIndex: 0,
    dartWheelResults: [],
    dartWheelSections: initializeDartWheelSections(),
  });

  // 현재 참가자 가져오기
  const dartWheelCurrentParticipant = participants[dartWheelGameState.dartWheelCurrentParticipantIndex] || null;

  // 이벤트 추가 헬퍼
  const addDartWheelEvent = useCallback((
    type: DartWheelEvent['type'], 
    data?: Partial<DartWheelEvent>
  ) => {
    const event: DartWheelEvent = {
      type,
      timestamp: Date.now(),
      ...data,
    };
    setDartWheelEvents(prev => [...prev, event]);
  }, []);

  // 게임 시작
  const dartWheelStartGame = useCallback(() => {
    setDartWheelGameStatus('playing');
    setDartWheelShowCountdown(true);
    dartWheelGameStartTimeRef.current = Date.now();
    
    // 게임 모드에 따른 초기화
    const settings = dartWheelSettingsRef.current;
    if (settings.dartWheelGameMode === 'team' && settings.dartWheelTeamCount) {
      const teams = dartWheelCreateTeams(participants, settings.dartWheelTeamCount);
      setDartWheelModeState({ teams });
    } else if (settings.dartWheelGameMode === 'survival') {
      setDartWheelModeState({
        survival: {
          currentRound: 0,
          eliminatedParticipants: [],
          activeParticipants: [...participants],
        },
      });
    }
    
    // 카운트다운 후 게임 시작
    setTimeout(() => {
      setDartWheelShowCountdown(false);
      setDartWheelGameState(prev => ({
        ...prev,
        dartWheelStatus: 'idle',
        dartWheelCurrentParticipantIndex: 0,
        dartWheelResults: [],
      }));
    }, 3000);
  }, [participants]);

  // 휠 회전 시작
  const dartWheelSpinWheel = useCallback(() => {
    if (dartWheelGameState.dartWheelStatus !== 'idle' || !dartWheelCurrentParticipant) {
      return;
    }

    const { dartWheelMinSpinDuration, dartWheelMaxSpinDuration, dartWheelEnableWeights } = dartWheelSettingsRef.current;
    const spinDuration = Math.random() * 
      (dartWheelMaxSpinDuration - dartWheelMinSpinDuration) + 
      dartWheelMinSpinDuration;
    
    // 가중치 기반 회전 각도 생성
    const totalRotation = dartWheelGenerateWeightedRotation(
      dartWheelGameState.dartWheelSections,
      5, // 최소 5회전
      dartWheelEnableWeights
    );

    setDartWheelGameState(prev => ({
      ...prev,
      dartWheelStatus: 'spinning',
      dartWheelSpinStartTime: Date.now(),
      dartWheelSpinDuration: spinDuration,
      dartWheelTargetRotation: prev.dartWheelCurrentRotation + totalRotation,
    }));

    addDartWheelEvent('dartWheel:spinStart', { 
      participant: dartWheelCurrentParticipant 
    });

    // 회전 완료 후 처리
    setTimeout(() => {
      handleDartWheelSpinComplete(totalRotation);
    }, spinDuration);
  }, [dartWheelGameState.dartWheelStatus, dartWheelCurrentParticipant]);

  // 회전 완료 처리
  const handleDartWheelSpinComplete = useCallback((totalRotation: number) => {
    const finalAngle = totalRotation % 360;
    const normalizedAngle = (360 - finalAngle + 90) % 360;
    
    // 가중치 기반 섹션에서는 각도로 섹션 찾기
    let landedSection: DartWheelSection | null = null;
    let accumulatedAngle = 0;
    
    for (const section of dartWheelGameState.dartWheelSections) {
      if (normalizedAngle >= accumulatedAngle && 
          normalizedAngle < accumulatedAngle + section.angleSize) {
        landedSection = section;
        break;
      }
      accumulatedAngle += section.angleSize;
    }
    
    if (!landedSection) {
      landedSection = dartWheelGameState.dartWheelSections[dartWheelGameState.dartWheelSections.length - 1];
    }

    if (!dartWheelCurrentParticipant || !landedSection) return;

    // 보너스 섹션 처리
    let finalValue = landedSection.value;
    let bonusApplied = false;
    
    if (landedSection.isBonus && landedSection.bonusType) {
      bonusApplied = true;
      switch (landedSection.bonusType) {
        case 'double':
          // 이전 점수의 2배 (이전 점수가 없으면 50점)
          const lastResult = dartWheelGameState.dartWheelResults
            .filter(r => r.participant.id === dartWheelCurrentParticipant.id)
            .pop();
          finalValue = lastResult ? lastResult.section.value * 2 : 50;
          break;
        case 'triple':
          // 이전 점수의 3배 (이전 점수가 없으면 100점)
          const lastTripleResult = dartWheelGameState.dartWheelResults
            .filter(r => r.participant.id === dartWheelCurrentParticipant.id)
            .pop();
          finalValue = lastTripleResult ? lastTripleResult.section.value * 3 : 100;
          break;
        case 'respin':
          // 다시 돌리기 - 특별 처리 필요
          finalValue = 0;
          break;
        case 'jackpot':
          finalValue = 200; // 잭팟 점수
          break;
      }
    }

    const spinResult: DartWheelSpinResult = {
      participant: dartWheelCurrentParticipant,
      section: {
        ...landedSection,
        value: finalValue, // 보너스 적용된 최종 값
      },
      spinDuration: dartWheelGameState.dartWheelSpinDuration,
      totalRotation: totalRotation,
      timestamp: Date.now(),
    };

    setDartWheelGameState(prev => ({
      ...prev,
      dartWheelStatus: 'stopped',
      dartWheelCurrentRotation: prev.dartWheelTargetRotation,
      dartWheelResults: [...prev.dartWheelResults, spinResult],
    }));

    addDartWheelEvent('dartWheel:spinComplete', { 
      participant: dartWheelCurrentParticipant,
      result: spinResult,
    });

    // 다시 돌리기 보너스 처리
    if (landedSection.bonusType === 'respin') {
      setTimeout(() => {
        setDartWheelGameState(prev => ({
          ...prev,
          dartWheelStatus: 'idle',
        }));
        // 자동으로 다시 스핀
        setTimeout(() => dartWheelSpinWheel(), 1000);
      }, 2000);
      return;
    }

    // 다음 참가자로 이동 또는 게임 종료
    setTimeout(() => {
      const nextIndex = dartWheelGameState.dartWheelCurrentParticipantIndex + 1;
      
      if (nextIndex < participants.length) {
        setDartWheelGameState(prev => ({
          ...prev,
          dartWheelStatus: 'idle',
          dartWheelCurrentParticipantIndex: nextIndex,
        }));
      } else {
        handleDartWheelGameComplete();
      }
    }, 2000);
  }, [
    dartWheelGameState.dartWheelSections, 
    dartWheelGameState.dartWheelSpinDuration,
    dartWheelGameState.dartWheelCurrentParticipantIndex,
    dartWheelCurrentParticipant, 
    participants.length
  ]);

  // 게임 완료 처리
  const handleDartWheelGameComplete = useCallback(() => {
    // 점수 기준으로 우승자 선정
    const sortedResults = [...dartWheelGameState.dartWheelResults]
      .sort((a, b) => b.section.value - a.section.value);
    
    const winners = sortedResults
      .slice(0, winnerCount)
      .map(result => result.participant);

    setDartWheelWinners(winners);
    setDartWheelGameStatus('finished');
    
    addDartWheelEvent('dartWheel:allSpinsComplete');

    // 게임 결과 저장
    const gameResult: GameResult = {
      gameType: 'dart-wheel',
      participants: participants,
      winners: winners,
      gameConfig: {
        winnerCount,
        sectionCount: dartWheelSettingsRef.current.dartWheelSectionCount,
        results: dartWheelGameState.dartWheelResults,
      },
      startTime: dartWheelGameStartTimeRef.current,
      endTime: Date.now(),
    };

    gameHistoryService.saveGameResult(gameResult);
  }, [
    dartWheelGameState.dartWheelResults, 
    winnerCount, 
    participants,
    dartWheelModeState,
    addDartWheelEvent
  ]);

  // 설정 업데이트
  const dartWheelUpdateSettings = useCallback((newSettings: DartWheelGameSettings) => {
    if (dartWheelGameStatus === 'waiting') {
      setDartWheelSettings(newSettings);
      dartWheelSettingsRef.current = newSettings;
      
      // 설정이 변경되면 섹션 재생성
      const newSections = initializeDartWheelSections();
      setDartWheelGameState(prev => ({
        ...prev,
        dartWheelSections: newSections,
      }));
    }
  }, [dartWheelGameStatus, initializeDartWheelSections]);

  // 테마 변경 시 섹션 재생성
  useEffect(() => {
    if (dartWheelGameStatus === 'waiting') {
      const newSections = initializeDartWheelSections();
      setDartWheelGameState(prev => ({
        ...prev,
        dartWheelSections: newSections,
      }));
    }
  }, [dartWheelTheme, dartWheelGameStatus, initializeDartWheelSections]);

  return {
    dartWheelGameState,
    dartWheelGameStatus,
    dartWheelWinners,
    dartWheelStartGame,
    dartWheelSpinWheel,
    dartWheelIsSpinning: dartWheelGameState.dartWheelStatus === 'spinning',
    dartWheelCurrentParticipant,
    dartWheelEvents,
    dartWheelShowCountdown,
    dartWheelSettings,
    dartWheelUpdateSettings,
    dartWheelTheme,
    dartWheelSetTheme: setDartWheelTheme,
    dartWheelGameMode,
    dartWheelSetGameMode: (mode: DartWheelGameMode) => {
      if (dartWheelGameStatus === 'waiting') {
        setDartWheelGameMode(mode);
        setDartWheelSettings(prev => ({ ...prev, dartWheelGameMode: mode }));
        dartWheelSettingsRef.current = { ...dartWheelSettingsRef.current, dartWheelGameMode: mode };
      }
    },
    dartWheelModeState,
  };
}