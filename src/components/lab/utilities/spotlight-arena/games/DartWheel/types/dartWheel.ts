import { Participant } from '../../../shared/types';

// 다트휠 섹션 타입
export interface DartWheelSection {
  id: string;
  label: string;
  value: number;
  color: string;
  angle: number;
  angleSize: number;
  weight?: number; // 가중치 (기본값: 1)
  isBonus?: boolean; // 보너스 섹션 여부
  bonusType?: 'double' | 'triple' | 'respin' | 'jackpot'; // 보너스 타입
}

// 다트휠 스핀 결과
export interface DartWheelSpinResult {
  participant: Participant;
  section: DartWheelSection;
  spinDuration: number;
  totalRotation: number;
  timestamp: number;
}

// 다트휠 게임 상태
export interface DartWheelGameState {
  dartWheelStatus: 'idle' | 'spinning' | 'stopping' | 'stopped';
  dartWheelCurrentRotation: number;
  dartWheelTargetRotation: number;
  dartWheelSpinStartTime: number | null;
  dartWheelSpinDuration: number;
  dartWheelCurrentParticipantIndex: number;
  dartWheelResults: DartWheelSpinResult[];
  dartWheelSections: DartWheelSection[];
}

// 게임 모드 타입
export type DartWheelGameMode = 'classic' | 'survival' | 'team' | 'target' | 'reverse';

// 다트휠 게임 설정
export interface DartWheelGameSettings {
  dartWheelMinSpinDuration: number;
  dartWheelMaxSpinDuration: number;
  dartWheelDecelerationRate: number;
  dartWheelSectionCount: number;
  dartWheelAutoSpin: boolean;
  dartWheelSpinDelay: number;
  dartWheelEnableWeights: boolean; // 가중치 시스템 활성화
  dartWheelEnableBonus: boolean; // 보너스 섹션 활성화
  dartWheelBonusSectionCount: number; // 보너스 섹션 개수
  dartWheelGameMode: DartWheelGameMode; // 게임 모드
  dartWheelTargetScore?: number; // 타겟 모드 목표 점수
  dartWheelTeamCount?: number; // 팀전 모드 팀 수
}

// 다트휠 애니메이션 설정
export interface DartWheelAnimationConfig {
  dartWheelEasingFunction: 'linear' | 'easeOut' | 'easeInOut';
  dartWheelFrameRate: number;
  dartWheelRotationSpeed: number;
}

// 다트휠 캔버스 설정
export interface DartWheelCanvasConfig {
  dartWheelCanvasWidth: number;
  dartWheelCanvasHeight: number;
  dartWheelRadius: number;
  dartWheelCenterX: number;
  dartWheelCenterY: number;
  dartWheelPointerSize: number;
}

// 다트휠 이벤트 타입
export type DartWheelEventType = 
  | 'dartWheel:spinStart'
  | 'dartWheel:spinning' 
  | 'dartWheel:spinComplete'
  | 'dartWheel:resultDetermined'
  | 'dartWheel:allSpinsComplete';

// 다트휠 이벤트 인터페이스
export interface DartWheelEvent {
  type: DartWheelEventType;
  participant?: Participant;
  result?: DartWheelSpinResult;
  timestamp: number;
}

// 팀 정보
export interface DartWheelTeam {
  id: string;
  name: string;
  color: string;
  members: Participant[];
  totalScore: number;
}

// 서바이벌 모드 상태
export interface DartWheelSurvivalState {
  currentRound: number;
  eliminatedParticipants: Participant[];
  activeParticipants: Participant[];
}

// 타겟 모드 결과
export interface DartWheelTargetResult {
  participant: Participant;
  score: number;
  difference: number; // 목표와의 차이
  isOverTarget: boolean;
}

// 게임 모드별 상태
export interface DartWheelModeState {
  survival?: DartWheelSurvivalState;
  teams?: DartWheelTeam[];
  targetResults?: DartWheelTargetResult[];
}