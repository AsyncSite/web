import React, { useState } from 'react';
import './MembersSectionForm.css';
import { 
  MemberProfile, 
  CustomField, 
  Badge,
  MemberCardTheme,
  MemberLayoutType,
  STUDY_TEMPLATES,
  MembersSectionData
} from '../../types/memberTypes';

interface MembersSectionFormProps {
  initialData?: MembersSectionData;
  onSave: (data: MembersSectionData) => void;
  onCancel: () => void;
}

const MembersSectionForm: React.FC<MembersSectionFormProps> = ({
  initialData = {},
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(initialData.title || '함께하는 사람들');
  const [subtitle, setSubtitle] = useState(initialData.subtitle || '');
  // tecoteco 테마로 고정
  const theme: MemberCardTheme = 'tecoteco';
  const [layout, setLayout] = useState<MemberLayoutType>(initialData.layout || 'grid');
  const [studyType, setStudyType] = useState<keyof typeof STUDY_TEMPLATES | 'custom'>(
    initialData.studyType || 'custom'
  );
  const [members, setMembers] = useState<MemberProfile[]>(
    initialData.members?.length ? initialData.members : [
      {
        name: '',
        role: '',
        tagline: '',
        achievement: '',
        customFields: []
      }
    ]
  );
  const [showStats, setShowStats] = useState(initialData.showStats || false);
  const [stats, setStats] = useState(initialData.stats || {
    totalMembers: members.length,
    activeMembers: members.length,
    totalHours: 0,
    customStats: [],
    popularAlgorithms: []
  });
  const [weeklyMvp, setWeeklyMvp] = useState<string | undefined>(initialData.weeklyMvp);

  // 멤버 추가
  const handleAddMember = () => {
    const newMember: MemberProfile = {
      name: '',
      role: '',
      tagline: '',
      achievement: '',
      customFields: studyType !== 'custom' ? 
        STUDY_TEMPLATES[studyType as keyof typeof STUDY_TEMPLATES]?.customFields?.map(f => ({
          label: f.label,
          value: '',
          icon: f.icon
        })) : []
    };
    setMembers([...members, newMember]);
  };

  // 멤버 삭제
  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
    }
  };

  // 멤버 필드 변경
  const handleMemberChange = (index: number, field: keyof MemberProfile, value: any) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  // 커스텀 필드 변경
  const handleCustomFieldChange = (memberIndex: number, fieldIndex: number, field: keyof CustomField, value: string) => {
    const newMembers = [...members];
    const customFields = newMembers[memberIndex].customFields || [];
    customFields[fieldIndex] = { ...customFields[fieldIndex], [field]: value };
    newMembers[memberIndex].customFields = customFields;
    setMembers(newMembers);
  };

  // 커스텀 필드 추가
  const handleAddCustomField = (memberIndex: number) => {
    const newMembers = [...members];
    const customFields = newMembers[memberIndex].customFields || [];
    customFields.push({ label: '', value: '', icon: '' });
    newMembers[memberIndex].customFields = customFields;
    setMembers(newMembers);
  };

  // 커스텀 필드 삭제
  const handleRemoveCustomField = (memberIndex: number, fieldIndex: number) => {
    const newMembers = [...members];
    const customFields = newMembers[memberIndex].customFields || [];
    newMembers[memberIndex].customFields = customFields.filter((_, i) => i !== fieldIndex);
    setMembers(newMembers);
  };

  // 배지 토글
  const handleBadgeToggle = (memberIndex: number, badge: Badge) => {
    const newMembers = [...members];
    const badges = newMembers[memberIndex].badges || [];
    const existingIndex = badges.findIndex(b => b.type === badge.type);
    
    if (existingIndex >= 0) {
      newMembers[memberIndex].badges = badges.filter((_, i) => i !== existingIndex);
    } else {
      badges.push(badge);
      newMembers[memberIndex].badges = badges;
    }
    setMembers(newMembers);
  };

  // 스터디 템플릿 적용
  const applyStudyTemplate = (templateKey: keyof typeof STUDY_TEMPLATES) => {
    const template = STUDY_TEMPLATES[templateKey];
    setStudyType(templateKey);
    
    // 모든 멤버에 템플릿 커스텀 필드 적용
    const updatedMembers = members.map(member => ({
      ...member,
      customFields: template.customFields.map(field => ({
        label: field.label,
        value: '',
        icon: field.icon
      }))
    }));
    setMembers(updatedMembers);
  };

  // TecoTeco 예시 데이터 로드
  const loadTecoTecoExample = () => {
    setTitle('함께하는 사람들');
    setSubtitle('더 멋진 여정이 펼쳐질 거예요, 함께라면.');
    // tecoteco 테마 고정됨
    setLayout('carousel');
    setStudyType('algorithm');
    setShowStats(true);
    
    const exampleMembers: MemberProfile[] = [
      {
        name: 'renechoi',
        role: '스터디 리더',
        imageUrl: '/images/face/rene.png',
        joinDate: '2024-09-01',
        tagline: '모임을 처음 시작한 사람 🏆',
        achievement: 'DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요',
        message: '리더십과 알고리즘 실력 모두 뛰어나요!',
        messageFrom: 'kdelay',
        customFields: [
          { label: '해결한 문제', value: '342', icon: '✅' },
          { label: '연속 참여', value: '15일', icon: '🔥' },
          { label: '주력 분야', value: '고급 DP', icon: '📚' }
        ],
        badges: [
          { type: 'mvp', label: '이주의 MVP', icon: '👑' }
        ],
        isActive: true,
        lastActivity: '1일 전'
      },
      {
        name: 'kdelay',
        role: '코드 리뷰어',
        imageUrl: '/images/face/kdelay.png',
        joinDate: '2024-09-01',
        tagline: '꼼꼼한 코드 리뷰어 📝',
        achievement: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
        message: '꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!',
        messageFrom: 'KrongDev',
        customFields: [
          { label: '해결한 문제', value: '298', icon: '✅' },
          { label: '연속 참여', value: '12일', icon: '🔥' },
          { label: '주력 분야', value: '트리 DP', icon: '📚' }
        ],
        badges: [
          { type: 'streak', label: '개근왕', icon: '🔥' }
        ],
        isActive: true,
        lastActivity: '2일 전'
      },
      {
        name: 'KrongDev',
        role: '문제 해결사',
        imageUrl: 'https://avatars.githubusercontent.com/u/138358867?s=40&v=4',
        joinDate: '2024-09-01',
        tagline: '알고리즘 문제 해결사 💬',
        achievement: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
        message: '어려운 문제도 차근차근 해결하는 능력이 대단해요!',
        messageFrom: 'renechoi',
        customFields: [
          { label: '해결한 문제', value: '156', icon: '✅' },
          { label: '연속 참여', value: '8일', icon: '🔥' },
          { label: '주력 분야', value: '그래프', icon: '📚' }
        ],
        isActive: true,
        lastActivity: '1일 전'
      },
      {
        name: '탁형',
        role: '멘토',
        imageUrl: '/images/face/xxx.png',
        joinDate: '2024-09-01',
        tagline: '복잡한 개념도 쉽게 설명하는 멘토 📚',
        achievement: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
        message: '복잡한 개념도 쉽게 설명해주는 천재예요!',
        messageFrom: 'kdelay',
        customFields: [
          { label: '해결한 문제', value: '89', icon: '✅' },
          { label: '연속 참여', value: '6일', icon: '🔥' },
          { label: '주력 분야', value: '세그먼트 트리', icon: '📚' }
        ],
        badges: [
          { type: 'special', label: '멘토', icon: '🌟' }
        ],
        isActive: false,
        lastActivity: '3일 전'
      }
    ];
    
    setMembers(exampleMembers);
    
    setStats({
      totalMembers: 8,
      activeMembers: 6,
      totalHours: 180,
      customStats: [
        { label: '총 해결한 문제', value: '1247', icon: '💡' },
        { label: '평균 참여율', value: '85%', icon: '📊' }
      ]
    });
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 빈 멤버 필터링
    const validMembers = members.filter(member => member.name && member.role);
    
    if (validMembers.length === 0) {
      alert('최소 한 명의 멤버를 입력해주세요.');
      return;
    }

    onSave({
      title,
      subtitle,
      theme: 'tecoteco',
      layout,
      studyType: studyType === 'custom' ? undefined : studyType as keyof typeof STUDY_TEMPLATES,
      members: validMembers,
      showStats,
      stats: showStats ? stats : undefined,
      weeklyMvp
    });
  };

  return (
    <form onSubmit={handleSubmit} className="study-management-members-form">
      {/* 섹션 헤더 */}
      <div className="study-management-members-form-group">
        <label>섹션 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 함께하는 사람들"
          className="study-management-members-input"
        />
      </div>

      <div className="study-management-members-form-group">
        <label>섹션 부제목 (선택)</label>
        <input
          type="text"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="예: 더 멋진 여정이 펼쳐질 거예요, 함께라면."
          className="study-management-members-input"
        />
      </div>

      {/* 레이아웃 설정 (테마는 tecoteco로 고정) */}
      <div className="study-management-members-form-group">
        <label>레이아웃</label>
        <select
          value={layout}
          onChange={(e) => setLayout(e.target.value as MemberLayoutType)}
          className="study-management-members-select"
        >
          <option value="grid">그리드</option>
          <option value="list">리스트</option>
          <option value="carousel">캐러셀 (자동 스크롤)</option>
        </select>
      </div>

      {/* 스터디 템플릿 */}
      <div className="study-management-members-form-group">
        <div className="study-management-members-group-header">
          <label>스터디 템플릿</label>
          <button
            type="button"
            onClick={loadTecoTecoExample}
            className="study-management-members-example-btn"
          >
            TecoTeco 예시 불러오기
          </button>
        </div>
        <div className="study-management-members-template-buttons">
          <button
            type="button"
            onClick={() => applyStudyTemplate('algorithm')}
            className={`study-management-members-template-btn ${studyType === 'algorithm' ? 'active' : ''}`}
          >
            알고리즘
          </button>
          <button
            type="button"
            onClick={() => applyStudyTemplate('development')}
            className={`study-management-members-template-btn ${studyType === 'development' ? 'active' : ''}`}
          >
            개발
          </button>
          <button
            type="button"
            onClick={() => applyStudyTemplate('design')}
            className={`study-management-members-template-btn ${studyType === 'design' ? 'active' : ''}`}
          >
            디자인
          </button>
          <button
            type="button"
            onClick={() => applyStudyTemplate('language')}
            className={`study-management-members-template-btn ${studyType === 'language' ? 'active' : ''}`}
          >
            언어
          </button>
          <button
            type="button"
            onClick={() => applyStudyTemplate('reading')}
            className={`study-management-members-template-btn ${studyType === 'reading' ? 'active' : ''}`}
          >
            독서
          </button>
          <button
            type="button"
            onClick={() => setStudyType('custom')}
            className={`study-management-members-template-btn ${studyType === 'custom' ? 'active' : ''}`}
          >
            커스텀
          </button>
        </div>
      </div>

      {/* 멤버 리스트 */}
      <div className="study-management-members-list">
        {members.map((member, memberIndex) => (
          <div key={memberIndex} className="study-management-members-item">
            <div className="study-management-members-item-header">
              <h4>멤버 {memberIndex + 1}</h4>
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(memberIndex)}
                  className="study-management-members-remove-btn"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="study-management-members-fields">
              {/* 기본 정보 */}
              <div className="study-management-members-field-row">
                <div className="study-management-members-field">
                  <label>이름 *</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(memberIndex, 'name', e.target.value)}
                    placeholder="예: 홍길동"
                    className="study-management-members-input"
                    required
                  />
                </div>
                <div className="study-management-members-field">
                  <label>역할 *</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => handleMemberChange(memberIndex, 'role', e.target.value)}
                    placeholder="예: 스터디 리더, 멤버, 멘토"
                    className="study-management-members-input"
                    required
                  />
                </div>
              </div>

              <div className="study-management-members-field-row">
                <div className="study-management-members-field">
                  <label>프로필 이미지 URL</label>
                  <input
                    type="text"
                    value={member.imageUrl || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'imageUrl', e.target.value)}
                    placeholder="예: /images/profile.png"
                    className="study-management-members-input"
                  />
                </div>
                <div className="study-management-members-field">
                  <label>가입일</label>
                  <input
                    type="date"
                    value={member.joinDate || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'joinDate', e.target.value)}
                    className="study-management-members-input"
                  />
                </div>
              </div>

              {/* 텍스트 필드 */}
              <div className="study-management-members-field">
                <label>한 줄 소개</label>
                <input
                  type="text"
                  value={member.tagline || ''}
                  onChange={(e) => handleMemberChange(memberIndex, 'tagline', e.target.value)}
                  placeholder="예: 모임을 처음 시작한 사람 🏆"
                  className="study-management-members-input"
                />
              </div>

              <div className="study-management-members-field">
                <label>주요 성과/배운 점</label>
                <textarea
                  value={member.achievement || ''}
                  onChange={(e) => handleMemberChange(memberIndex, 'achievement', e.target.value)}
                  placeholder="예: DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요"
                  className="study-management-members-textarea"
                  rows={2}
                />
              </div>

              <div className="study-management-members-field-row">
                <div className="study-management-members-field">
                  <label>동료의 한마디</label>
                  <input
                    type="text"
                    value={member.message || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'message', e.target.value)}
                    placeholder="예: 리더십과 실력 모두 뛰어나요!"
                    className="study-management-members-input"
                  />
                </div>
                <div className="study-management-members-field">
                  <label>작성자</label>
                  <input
                    type="text"
                    value={member.messageFrom || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'messageFrom', e.target.value)}
                    placeholder="예: kdelay"
                    className="study-management-members-input"
                  />
                </div>
              </div>

              {/* 커스텀 필드 - tecoteco는 항상 표시 */}
              <div className="study-management-members-field">
                <label>커스텀 필드 (최대 3개)</label>
                {member.customFields?.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="study-management-members-custom-field-row">
                    <input
                      type="text"
                      value={field.icon || ''}
                      onChange={(e) => handleCustomFieldChange(memberIndex, fieldIndex, 'icon', e.target.value)}
                      placeholder="아이콘"
                      className="study-management-members-icon-input"
                    />
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => handleCustomFieldChange(memberIndex, fieldIndex, 'label', e.target.value)}
                      placeholder="필드명"
                      className="study-management-members-input study-management-members-custom-label"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(memberIndex, fieldIndex, 'value', e.target.value)}
                      placeholder="값"
                      className="study-management-members-input study-management-members-custom-value"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomField(memberIndex, fieldIndex)}
                      className="study-management-members-custom-remove-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {(!member.customFields || member.customFields.length < 3) && (
                  <button
                    type="button"
                    onClick={() => handleAddCustomField(memberIndex)}
                    className="study-management-members-custom-add-btn"
                  >
                    + 커스텀 필드 추가
                  </button>
                )}
              </div>

              {/* 배지 - tecoteco는 항상 표시 */}
              <div className="study-management-members-field">
                <label>배지</label>
                <div className="study-management-members-badge-selector">
                  {[
                    { type: 'mvp' as const, label: '이주의 MVP', icon: '👑' },
                    { type: 'streak' as const, label: '개근왕', icon: '🔥' },
                    { type: 'achievement' as const, label: '우수 멤버', icon: '🏆' },
                    { type: 'special' as const, label: '멘토', icon: '🌟' }
                  ].map(badge => (
                    <label key={badge.type} className="study-management-members-badge-option">
                      <input
                        type="checkbox"
                        checked={member.badges?.some(b => b.type === badge.type) || false}
                        onChange={() => handleBadgeToggle(memberIndex, badge)}
                      />
                      <span>{badge.icon} {badge.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 상태 */}
              <div className="study-management-members-field-row">
                <div className="study-management-members-field">
                  <label>
                    <input
                      type="checkbox"
                      checked={member.isActive || false}
                      onChange={(e) => handleMemberChange(memberIndex, 'isActive', e.target.checked)}
                    />
                    활동 중 (활동 표시)
                  </label>
                </div>
                <div className="study-management-members-field">
                  <label>최근 활동</label>
                  <input
                    type="text"
                    value={member.lastActivity || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'lastActivity', e.target.value)}
                    placeholder="예: 1일 전"
                    className="study-management-members-input"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddMember} className="study-management-members-add-btn">
          + 멤버 추가
        </button>
      </div>

      {/* 통계 섹션 */}
      <div className="study-management-members-form-group">
        <label>
          <input
            type="checkbox"
            checked={showStats}
            onChange={(e) => setShowStats(e.target.checked)}
          />
          통계 섹션 표시
        </label>
      </div>

      {showStats && (
        <div className="study-management-members-stats-fields">
          <h4>통계 정보</h4>
          <div className="study-management-members-field-row">
            <div className="study-management-members-field">
              <label>전체 멤버</label>
              <input
                type="number"
                value={stats.totalMembers || 0}
                onChange={(e) => setStats({ ...stats, totalMembers: parseInt(e.target.value) || 0 })}
                className="study-management-members-input"
              />
            </div>
            <div className="study-management-members-field">
              <label>활동 멤버</label>
              <input
                type="number"
                value={stats.activeMembers || 0}
                onChange={(e) => setStats({ ...stats, activeMembers: parseInt(e.target.value) || 0 })}
                className="study-management-members-input"
              />
            </div>
            <div className="study-management-members-field">
              <label>함께한 시간</label>
              <input
                type="number"
                value={stats.totalHours || 0}
                onChange={(e) => setStats({ ...stats, totalHours: parseInt(e.target.value) || 0 })}
                className="study-management-members-input"
              />
            </div>
          </div>
          <div className="study-management-members-field">
            <label>인기 알고리즘 태그 (쉼표로 구분)</label>
            <input
              type="text"
              value={(stats.popularAlgorithms || []).join(', ')}
              onChange={(e) => setStats({ ...stats, popularAlgorithms: e.target.value.split(',').map(v => v.trim()).filter(Boolean) })}
              className="study-management-members-input"
              placeholder="예: DP, 그래프, 이분탐색"
            />
          </div>
        </div>
      )}

      {/* 강조 멤버 */}
      <div className="study-management-members-form-group">
        <label>이주의 MVP (이름)</label>
        <input
          type="text"
          value={weeklyMvp || ''}
          onChange={(e) => setWeeklyMvp(e.target.value || undefined)}
          placeholder="예: renechoi"
          className="study-management-members-input"
        />
        <p className="study-management-members-help-text">TecoTeco 테마에서 MVP 배지를 강조 표시합니다.</p>
      </div>

      {/* 폼 액션 */}
      <div className="study-management-members-form-actions">
        <button type="button" onClick={onCancel} className="study-management-members-cancel-btn">
          취소
        </button>
        <button type="submit" className="study-management-members-save-btn">
          저장
        </button>
      </div>
    </form>
  );
};

export default MembersSectionForm;