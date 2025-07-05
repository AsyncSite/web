import { TeamNameTemplate, TEAM_NAME_TEMPLATES } from './constants';

export interface Team {
    id: string;
    name: string;
    members: string[];
}

/**
 * Fisher-Yates 셔플 알고리즘을 사용하여 배열을 무작위로 섞습니다.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * 참가자 명단 문자열을 정제하여 배열로 변환합니다.
 */
export const parseParticipants = (input: string): string[] => {
    return input
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((name, index, array) => {
            // 중복 이름 처리
            const duplicateCount = array.slice(0, index).filter(n => n === name).length;
            return duplicateCount > 0 ? `${name}${duplicateCount + 1}` : name;
        });
};

/**
 * 팀 수로 나누기: 전체 인원을 N개의 팀으로 나눕니다.
 */
export const divideByTeamCount = (
    participants: string[], 
    teamCount: number,
    teamNameTemplate: TeamNameTemplate = 'default'
): Team[] => {
    const shuffled = shuffleArray(participants);
    const teams: Team[] = [];
    const template = TEAM_NAME_TEMPLATES.find(t => t.id === teamNameTemplate) || TEAM_NAME_TEMPLATES[0];
    
    // 팀 초기화
    for (let i = 0; i < teamCount; i++) {
        teams.push({
            id: `team-${i + 1}`,
            name: template.getTeamName(i),
            members: []
        });
    }
    
    // 참가자를 팀에 균등 배분 (나머지는 앞쪽 팀부터 한 명씩 추가)
    shuffled.forEach((participant, index) => {
        const teamIndex = index % teamCount;
        teams[teamIndex].members.push(participant);
    });
    
    return teams;
};

/**
 * 인원 수로 나누기: 한 팀에 N명씩 배치합니다.
 */
export const divideByMemberCount = (
    participants: string[], 
    memberCount: number,
    teamNameTemplate: TeamNameTemplate = 'default'
): Team[] => {
    const shuffled = shuffleArray(participants);
    const teams: Team[] = [];
    const template = TEAM_NAME_TEMPLATES.find(t => t.id === teamNameTemplate) || TEAM_NAME_TEMPLATES[0];
    let teamIndex = 0;
    
    for (let i = 0; i < shuffled.length; i += memberCount) {
        const members = shuffled.slice(i, i + memberCount);
        teams.push({
            id: `team-${teamIndex + 1}`,
            name: template.getTeamName(teamIndex),
            members
        });
        teamIndex++;
    }
    
    return teams;
};

/**
 * 팀 결과를 텍스트 형식으로 변환합니다.
 */
export const formatTeamsAsText = (teams: Team[]): string => {
    return teams
        .map(team => `${team.name}:\n${team.members.map(m => `  - ${m}`).join('\n')}`)
        .join('\n\n');
};