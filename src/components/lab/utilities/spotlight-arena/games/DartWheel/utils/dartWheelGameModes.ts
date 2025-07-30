import { Participant } from '../../../shared/types';
import { 
  DartWheelGameMode, 
  DartWheelSpinResult, 
  DartWheelTeam,
  DartWheelSurvivalState,
  DartWheelTargetResult,
  DartWheelModeState
} from '../types/dartWheel';

/**
 * 팀 생성 (팀전 모드)
 */
export function dartWheelCreateTeams(
  participants: Participant[],
  teamCount: number
): DartWheelTeam[] {
  const teams: DartWheelTeam[] = [];
  const teamColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#DDA0DD', '#F7DC6F'];
  
  // 팀 초기화
  for (let i = 0; i < teamCount; i++) {
    teams.push({
      id: `dart-wheel-team-${i}`,
      name: `팀 ${i + 1}`,
      color: teamColors[i % teamColors.length],
      members: [],
      totalScore: 0,
    });
  }
  
  // 참가자를 팀에 균등 분배
  participants.forEach((participant, index) => {
    const teamIndex = index % teamCount;
    teams[teamIndex].members.push(participant);
  });
  
  return teams;
}

/**
 * 팀 점수 업데이트
 */
export function dartWheelUpdateTeamScores(
  teams: DartWheelTeam[],
  result: DartWheelSpinResult
): DartWheelTeam[] {
  return teams.map(team => {
    const hasMember = team.members.some(member => member.id === result.participant.id);
    if (hasMember) {
      return {
        ...team,
        totalScore: team.totalScore + result.section.value,
      };
    }
    return team;
  });
}

/**
 * 서바이벌 모드 - 탈락자 결정
 */
export function dartWheelDetermineSurvivalElimination(
  results: DartWheelSpinResult[],
  activeParticipants: Participant[]
): Participant | null {
  // 현재 라운드의 결과만 필터링
  const currentRoundResults = results.filter(result =>
    activeParticipants.some(p => p.id === result.participant.id)
  );
  
  if (currentRoundResults.length === 0) return null;
  
  // 각 참가자의 최신 점수 계산
  const participantScores = new Map<string, number>();
  
  currentRoundResults.forEach(result => {
    const currentScore = participantScores.get(result.participant.id) || 0;
    participantScores.set(result.participant.id, Math.max(currentScore, result.section.value));
  });
  
  // 최저 점수 찾기
  let lowestScore = Infinity;
  let eliminatedParticipant: Participant | null = null;
  
  participantScores.forEach((score, participantId) => {
    if (score < lowestScore) {
      lowestScore = score;
      eliminatedParticipant = activeParticipants.find(p => p.id === participantId) || null;
    }
  });
  
  return eliminatedParticipant;
}

/**
 * 서바이벌 상태 업데이트
 */
export function dartWheelUpdateSurvivalState(
  currentState: DartWheelSurvivalState,
  eliminatedParticipant: Participant
): DartWheelSurvivalState {
  return {
    currentRound: currentState.currentRound + 1,
    eliminatedParticipants: [...currentState.eliminatedParticipants, eliminatedParticipant],
    activeParticipants: currentState.activeParticipants.filter(
      p => p.id !== eliminatedParticipant.id
    ),
  };
}

/**
 * 타겟 모드 - 결과 계산
 */
export function dartWheelCalculateTargetResults(
  results: DartWheelSpinResult[],
  targetScore: number
): DartWheelTargetResult[] {
  // 참가자별 총점 계산
  const participantScores = new Map<string, number>();
  
  results.forEach(result => {
    const currentScore = participantScores.get(result.participant.id) || 0;
    participantScores.set(
      result.participant.id, 
      currentScore + result.section.value
    );
  });
  
  // 목표와의 차이 계산
  const targetResults: DartWheelTargetResult[] = [];
  
  results.forEach(result => {
    const totalScore = participantScores.get(result.participant.id) || 0;
    const difference = Math.abs(totalScore - targetScore);
    
    // 중복 방지
    if (!targetResults.some(tr => tr.participant.id === result.participant.id)) {
      targetResults.push({
        participant: result.participant,
        score: totalScore,
        difference: difference,
        isOverTarget: totalScore > targetScore,
      });
    }
  });
  
  // 차이가 작은 순으로 정렬
  return targetResults.sort((a, b) => a.difference - b.difference);
}

/**
 * 역전 모드 - 우승자 결정
 */
export function dartWheelDetermineReverseWinners(
  results: DartWheelSpinResult[],
  winnerCount: number
): Participant[] {
  // 참가자별 총점 계산
  const participantScores = new Map<string, { participant: Participant; score: number }>();
  
  results.forEach(result => {
    const current = participantScores.get(result.participant.id);
    if (current) {
      participantScores.set(result.participant.id, {
        participant: result.participant,
        score: current.score + result.section.value,
      });
    } else {
      participantScores.set(result.participant.id, {
        participant: result.participant,
        score: result.section.value,
      });
    }
  });
  
  // 낮은 점수 순으로 정렬
  const sorted = Array.from(participantScores.values())
    .sort((a, b) => a.score - b.score);
  
  return sorted.slice(0, winnerCount).map(item => item.participant);
}

/**
 * 게임 모드별 우승자 결정
 */
export function dartWheelDetermineWinnersByMode(
  mode: DartWheelGameMode,
  results: DartWheelSpinResult[],
  winnerCount: number,
  modeState?: DartWheelModeState,
  targetScore?: number
): Participant[] {
  switch (mode) {
    case 'classic':
      // 기존 방식: 높은 점수 순
      const classicScores = new Map<string, { participant: Participant; score: number }>();
      results.forEach(result => {
        const current = classicScores.get(result.participant.id);
        if (current) {
          classicScores.set(result.participant.id, {
            participant: result.participant,
            score: current.score + result.section.value,
          });
        } else {
          classicScores.set(result.participant.id, {
            participant: result.participant,
            score: result.section.value,
          });
        }
      });
      
      const classicSorted = Array.from(classicScores.values())
        .sort((a, b) => b.score - a.score);
      
      return classicSorted.slice(0, winnerCount).map(item => item.participant);
    
    case 'survival':
      // 마지막 생존자
      return modeState?.survival?.activeParticipants || [];
    
    case 'team':
      // 최고 점수 팀의 멤버들
      if (!modeState?.teams) return [];
      const winningTeam = modeState.teams
        .sort((a, b) => b.totalScore - a.totalScore)[0];
      return winningTeam?.members || [];
    
    case 'target':
      // 목표에 가장 가까운 참가자
      if (!modeState?.targetResults) return [];
      return modeState.targetResults
        .slice(0, winnerCount)
        .map(result => result.participant);
    
    case 'reverse':
      // 낮은 점수 순
      return dartWheelDetermineReverseWinners(results, winnerCount);
    
    default:
      return [];
  }
}

/**
 * 모드별 게임 종료 조건 확인
 */
export function dartWheelCheckGameEndCondition(
  mode: DartWheelGameMode,
  currentParticipantIndex: number,
  totalParticipants: number,
  modeState?: DartWheelModeState
): boolean {
  switch (mode) {
    case 'survival':
      // 1명 남을 때까지
      return (modeState?.survival?.activeParticipants.length || 0) <= 1;
    
    case 'classic':
    case 'team':
    case 'target':
    case 'reverse':
      // 모든 참가자가 플레이
      return currentParticipantIndex >= totalParticipants - 1;
    
    default:
      return false;
  }
}