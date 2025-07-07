import React, { useState, useMemo, useEffect } from 'react';
import './styles/TeamShuffle.css';
import {
  Team,
  parseParticipants,
  divideByTeamCount,
  divideByMemberCount,
  formatTeamsAsText,
} from './utils';
import { useTeamHistory } from './hooks';
import { ShuffleButton, TeamCard, TeamNameTemplateSelector } from './components';
import { TeamNameTemplate, TEAM_NAME_TEMPLATES } from './constants';

const TeamShuffle: React.FC = () => {
  const [participants, setParticipants] = useState<string>('');
  const [divisionMethod, setDivisionMethod] = useState<'byTeamCount' | 'byMemberCount'>(
    'byTeamCount',
  );
  const [teamCount, setTeamCount] = useState<number>(2);
  const [memberCount, setMemberCount] = useState<number>(3);
  const [showResults, setShowResults] = useState(false);
  const [isNewShuffle, setIsNewShuffle] = useState(false);
  const [teamNameTemplate, setTeamNameTemplate] = useState<TeamNameTemplate>('default');
  const [customTeamNames, setCustomTeamNames] = useState<Record<string, string>>({});

  const { currentTeams, history, canUndo, canRedo, addToHistory, undo, redo, clearHistory } =
    useTeamHistory();

  // 참가자 수 계산 (빈 줄 제외)
  const participantCount = useMemo(() => {
    if (!participants.trim()) return 0;
    return participants.split('\n').filter((line) => line.trim().length > 0).length;
  }, [participants]);

  // 팀 나누기 실행
  const handleShuffle = () => {
    const participantList = parseParticipants(participants);

    if (participantList.length < 2) return;

    let newTeams: Team[];
    const divisionValue = divisionMethod === 'byTeamCount' ? teamCount : memberCount;

    if (divisionMethod === 'byTeamCount') {
      newTeams = divideByTeamCount(participantList, teamCount, teamNameTemplate);
    } else {
      newTeams = divideByMemberCount(participantList, memberCount, teamNameTemplate);
    }

    // 커스텀 팀 이름 적용
    newTeams = newTeams.map((team) => ({
      ...team,
      name: customTeamNames[team.id] || team.name,
    }));

    addToHistory(newTeams, divisionMethod, divisionValue);
    setShowResults(true);
    setIsNewShuffle(true);

    // 애니메이션 후 플래그 리셋
    setTimeout(() => setIsNewShuffle(false), 700);
  };

  const handleReshuffle = () => {
    handleShuffle();
  };

  // 결과 복사
  const handleCopyResults = () => {
    if (!currentTeams) return;

    const text = formatTeamsAsText(currentTeams);
    navigator.clipboard.writeText(text).then(() => {
      // 복사 성공 피드백을 위해 잘시 버튼 텍스트 변경
      const button = document.querySelector('.copy-button');
      if (button) {
        button.textContent = '✓ 복사 완료!';
        setTimeout(() => {
          button.textContent = '📋 결과 복사';
        }, 2000);
      }
    });
  };

  // 히스토리 업데이트 시 표시 상태 업데이트
  useEffect(() => {
    if (currentTeams && currentTeams.length > 0) {
      setShowResults(true);
    }
  }, [currentTeams]);

  // 전체 초기화
  const handleReset = () => {
    setParticipants('');
    setDivisionMethod('byTeamCount');
    setTeamCount(2);
    setMemberCount(3);
    setShowResults(false);
    setIsNewShuffle(false);
    setTeamNameTemplate('default');
    setCustomTeamNames({});
    clearHistory();
  };

  // 팀 이름 변경 핸들러
  const handleTeamNameChange = (teamId: string, newName: string) => {
    setCustomTeamNames((prev) => ({
      ...prev,
      [teamId]: newName,
    }));

    // 현재 표시된 팀들의 이름 업데이트
    if (currentTeams) {
      const updatedTeams = currentTeams.map((team) =>
        team.id === teamId ? { ...team, name: newName } : team,
      );
      // 히스토리에 반영하지 않고 현재 표시만 업데이트
    }
  };
  return (
    <div className="team-shuffle">
      <div className="team-shuffle-container">
        <div className="team-shuffle-header">
          <h1>팀 셔플</h1>
          <p>클릭 몇 번으로 간편하고 공정하게 팀을 나눠보세요</p>
        </div>

        <div className="team-shuffle-content">
          {/* 왼쪽: 입력 영역 */}
          <div className="input-section">
            <h2>참가자 명단을 입력하세요</h2>
            <textarea
              className="participant-input"
              placeholder="한 줄에 한 명씩, 이름만 입력해주세요"
              value={participants}
              onChange={(e) => setParticipants(e.target.value)}
              rows={15}
            />
            <div className="participant-counter">
              총 <span className="count-number">{participantCount}</span>명
            </div>
          </div>

          {/* 오른쪽: 설정 및 결과 영역 */}
          <div className="settings-results-section">
            <h2>팀 나누기 설정</h2>

            {/* 팀 나누기 방식 선택 */}
            <div className="division-method">
              <div className="method-option">
                <label>
                  <input
                    type="radio"
                    name="divisionMethod"
                    value="byTeamCount"
                    checked={divisionMethod === 'byTeamCount'}
                    onChange={(e) => setDivisionMethod(e.target.value as 'byTeamCount')}
                  />
                  <span>팀 개수로 나누기</span>
                </label>
                <div className="method-input">
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={teamCount}
                    onChange={(e) =>
                      setTeamCount(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))
                    }
                    disabled={divisionMethod !== 'byTeamCount'}
                  />
                  <span>개 팀으로</span>
                </div>
              </div>

              <div className="method-option">
                <label>
                  <input
                    type="radio"
                    name="divisionMethod"
                    value="byMemberCount"
                    checked={divisionMethod === 'byMemberCount'}
                    onChange={(e) => setDivisionMethod(e.target.value as 'byMemberCount')}
                  />
                  <span>한 팀에 N명씩</span>
                </label>
                <div className="method-input">
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={memberCount}
                    onChange={(e) =>
                      setMemberCount(Math.max(2, Math.min(20, parseInt(e.target.value) || 2)))
                    }
                    disabled={divisionMethod !== 'byMemberCount'}
                  />
                  <span>명씩</span>
                </div>
              </div>
            </div>

            {/* 팀 이름 템플릿 선택 */}
            <TeamNameTemplateSelector value={teamNameTemplate} onChange={setTeamNameTemplate} />

            {/* 팀 나누기 버튼 */}
            <ShuffleButton
              onClick={handleShuffle}
              disabled={participantCount < 2}
              participantCount={participantCount}
            />

            {/* 결과 표시 영역 */}
            {showResults && currentTeams && currentTeams.length > 0 && (
              <div className="results-section">
                <div className="results-header">
                  <h3>팀 나누기 결과</h3>
                  <div className="action-buttons">
                    <button
                      className="action-button undo-button"
                      onClick={undo}
                      disabled={!canUndo}
                      title="이전 결과로 돌아가기"
                    >
                      ↩ 실행 취소
                    </button>
                    <button
                      className="action-button redo-button"
                      onClick={redo}
                      disabled={!canRedo}
                      title="다시 실행"
                    >
                      ↪ 다시 실행
                    </button>
                    <button className="action-button reshuffle-button" onClick={handleReshuffle}>
                      🔄 다시 섞기
                    </button>
                    <button className="action-button copy-button" onClick={handleCopyResults}>
                      📋 결과 복사
                    </button>
                    <button
                      className="action-button reset-button"
                      onClick={handleReset}
                      title="모든 내용을 초기화합니다"
                    >
                      🗑️ 초기화
                    </button>
                  </div>
                </div>

                {/* 히스토리 인디케이터 */}
                {history.length > 1 && (
                  <div className="history-indicator">
                    히스토리: {history.findIndex((h) => h.teams === currentTeams) + 1} /{' '}
                    {history.length}
                  </div>
                )}

                <div className="teams-grid">
                  {currentTeams.map((team, index) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      index={index}
                      isNewShuffle={isNewShuffle}
                      onTeamNameChange={handleTeamNameChange}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamShuffle;
