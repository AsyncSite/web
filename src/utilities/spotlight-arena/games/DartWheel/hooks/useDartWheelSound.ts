import { useEffect, useRef, useCallback } from 'react';
import { dartWheelSoundManager, DartWheelSoundType } from '../utils/dartWheelSoundManager';
import { DartWheelGameState, DartWheelSection } from '../types/dartWheel';

interface UseDartWheelSoundProps {
  dartWheelGameState: DartWheelGameState;
  dartWheelCurrentRotation?: number;
  dartWheelIsEnabled?: boolean;
}

export function useDartWheelSound({
  dartWheelGameState,
  dartWheelCurrentRotation = 0,
  dartWheelIsEnabled = true,
}: UseDartWheelSoundProps) {
  const dartWheelLastSectionRef = useRef<string | null>(null);
  const dartWheelTickIntervalRef = useRef<number | null>(null);
  const dartWheelBgmStartedRef = useRef<boolean>(false);

  // 현재 섹션 계산
  const calculateCurrentSection = useCallback((): DartWheelSection | null => {
    const normalizedAngle = (360 - (dartWheelCurrentRotation % 360) + 90) % 360;
    let accumulatedAngle = 0;
    
    for (const section of dartWheelGameState.dartWheelSections) {
      if (normalizedAngle >= accumulatedAngle && 
          normalizedAngle < accumulatedAngle + section.angleSize) {
        return section;
      }
      accumulatedAngle += section.angleSize;
    }
    
    return dartWheelGameState.dartWheelSections[0] || null;
  }, [dartWheelCurrentRotation, dartWheelGameState.dartWheelSections]);

  // 게임 상태에 따른 사운드 제어
  useEffect(() => {
    if (!dartWheelIsEnabled) return;

    switch (dartWheelGameState.dartWheelStatus) {
      case 'spinning':
        // 스핀 시작 사운드
        dartWheelSoundManager.playDartWheelSound('spin_start');
        
        // 루프 사운드 시작
        setTimeout(() => {
          dartWheelSoundManager.playDartWheelSound('spin_loop');
        }, 300);
        
        // 틱 사운드 시작
        if (dartWheelTickIntervalRef.current) {
          clearInterval(dartWheelTickIntervalRef.current);
        }
        
        dartWheelTickIntervalRef.current = window.setInterval(() => {
          const currentSection = calculateCurrentSection();
          if (currentSection && currentSection.id !== dartWheelLastSectionRef.current) {
            dartWheelSoundManager.playDartWheelSound('tick');
            dartWheelLastSectionRef.current = currentSection.id;
          }
        }, 50);
        break;

      case 'stopped':
        // 스핀 종료
        dartWheelSoundManager.stopDartWheelSound('spin_loop');
        dartWheelSoundManager.playDartWheelSound('spin_end');
        
        // 틱 사운드 정지
        if (dartWheelTickIntervalRef.current) {
          clearInterval(dartWheelTickIntervalRef.current);
          dartWheelTickIntervalRef.current = null;
        }
        
        // 결과 사운드 재생
        setTimeout(() => {
          playDartWheelResultSound();
        }, 500);
        break;

      case 'idle':
        // 사운드 정리
        dartWheelSoundManager.stopDartWheelSound('spin_loop');
        if (dartWheelTickIntervalRef.current) {
          clearInterval(dartWheelTickIntervalRef.current);
          dartWheelTickIntervalRef.current = null;
        }
        break;
    }
  }, [dartWheelGameState.dartWheelStatus, dartWheelIsEnabled, calculateCurrentSection]);

  // 결과 사운드 재생
  const playDartWheelResultSound = useCallback(() => {
    const latestResult = dartWheelGameState.dartWheelResults[dartWheelGameState.dartWheelResults.length - 1];
    if (!latestResult) return;

    const { section } = latestResult;
    
    // 보너스 섹션
    if (section.isBonus) {
      dartWheelSoundManager.playDartWheelSound('result_bonus');
      return;
    }

    // 점수별 사운드
    if (section.value >= 70) {
      dartWheelSoundManager.playDartWheelSound('result_high');
    } else if (section.value >= 40) {
      dartWheelSoundManager.playDartWheelSound('result_medium');
    } else {
      dartWheelSoundManager.playDartWheelSound('result_low');
    }
  }, [dartWheelGameState.dartWheelResults]);

  // 카운트다운 사운드
  const playDartWheelCountdownSound = useCallback(() => {
    if (dartWheelIsEnabled) {
      dartWheelSoundManager.playDartWheelSound('countdown');
    }
  }, [dartWheelIsEnabled]);

  // BGM 제어
  const startDartWheelBGM = useCallback(() => {
    if (dartWheelIsEnabled && !dartWheelBgmStartedRef.current) {
      dartWheelSoundManager.playDartWheelSound('bgm');
      dartWheelBgmStartedRef.current = true;
    }
  }, [dartWheelIsEnabled]);

  const stopDartWheelBGM = useCallback(() => {
    dartWheelSoundManager.stopDartWheelSound('bgm');
    dartWheelBgmStartedRef.current = false;
  }, []);

  // 볼륨 제어
  const setDartWheelVolume = useCallback((volume: number) => {
    dartWheelSoundManager.setDartWheelMasterVolume(volume);
  }, []);

  // 음소거 토글
  const toggleDartWheelMute = useCallback(() => {
    dartWheelSoundManager.toggleDartWheelMute();
  }, []);

  // 사운드 설정 가져오기
  const getDartWheelSoundSettings = useCallback(() => {
    return dartWheelSoundManager.getDartWheelSoundSettings();
  }, []);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (dartWheelTickIntervalRef.current) {
        clearInterval(dartWheelTickIntervalRef.current);
      }
      stopDartWheelBGM();
    };
  }, [stopDartWheelBGM]);

  return {
    playDartWheelCountdownSound,
    startDartWheelBGM,
    stopDartWheelBGM,
    setDartWheelVolume,
    toggleDartWheelMute,
    getDartWheelSoundSettings,
  };
}