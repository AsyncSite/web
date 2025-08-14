import React, { useState } from 'react';
import './MembersSectionForm.css';
import { 
  MemberProfile, 
  CustomField, 
  Badge,
  MemberLayoutType,
  STUDY_TEMPLATES,
  MembersSectionData
} from '../../types/memberTypes';
import studyService, { MemberResponse } from '../../../../api/studyService';
import { ToastContainer, ToastType } from '../../../common/Toast';
import ConfirmModal from '../../../common/ConfirmModal';
import StudyDetailRichTextEditor from '../../../common/richtext/StudyDetailRichTextEditor';
import { RichTextData } from '../../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../../common/richtext/RichTextConverter';

interface MembersSectionFormProps {
  studyId?: string;  // 실제 멤버 데이터를 불러올 스터디 ID
  initialData?: MembersSectionData;
  onSave: (data: MembersSectionData) => void;
  onCancel: () => void;
}

const MembersSectionForm: React.FC<MembersSectionFormProps> = ({
  studyId,
  initialData = {},
  onSave,
  onCancel
}) => {
  // TagHeader 상태 추가
  const [tagHeader, setTagHeader] = useState<string>(initialData.tagHeader || '함께하는 멤버들이에요');
  
  // Title과 Subtitle을 RichText로 관리 (초기값이 HTML이면 변환)
  const [title, setTitle] = useState<RichTextData | string>(
    initialData.title ? 
      (typeof initialData.title === 'string' ? RichTextConverter.fromHTML(initialData.title) : initialData.title)
      : ''
  );
  const [subtitle, setSubtitle] = useState<RichTextData | string>(
    initialData.subtitle ?
      (typeof initialData.subtitle === 'string' ? RichTextConverter.fromHTML(initialData.subtitle) : initialData.subtitle)
      : ''
  );
  const [layout, setLayout] = useState<MemberLayoutType>(initialData.layout || 'carousel');
  const [studyType, setStudyType] = useState<keyof typeof STUDY_TEMPLATES | 'custom'>(
    initialData.studyType || 'custom'
  );
  const [members, setMembers] = useState<MemberProfile[]>(
    initialData.members?.length ? initialData.members : []  // 빈 배열로 시작 (자동 생성 제거)
  );
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [hasLoadedFromAPI, setHasLoadedFromAPI] = useState(false);
  const [showStats, setShowStats] = useState(initialData.showStats || false);
  const [stats, setStats] = useState(initialData.stats || {
    totalMembers: members.length,
    activeMembers: members.length,
    totalHours: 0,
    customStats: [],
    popularAlgorithms: []
  });
  const [weeklyMvp, setWeeklyMvp] = useState<string | undefined>(initialData.weeklyMvp);
  
  // 커스텀 라벨 모달 상태
  const [showCustomLabelModal, setShowCustomLabelModal] = useState(false);
  const [customLabelInput, setCustomLabelInput] = useState('');
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  
  // Toast 상태
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: ToastType;
  }>>([]);
  
  // Confirm Modal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ 
    isOpen: false, 
    title: '', 
    message: '', 
    onConfirm: () => {}
  });
  
  // Toast 헬퍼 함수
  const addToast = (message: string, type?: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // 함께한 시간 계산 (가장 오래된 멤버 가입일 기준)
  const calculateTotalHours = (membersList: MemberProfile[]) => {
    if (!membersList || membersList.length === 0) return 0;
    
    const dates = membersList
      .filter(m => m.joinDate)
      .map(m => new Date(m.joinDate || ''));
    
    if (dates.length === 0) return 0;
    
    const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const now = new Date();
    const diffInMs = now.getTime() - oldestDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    return Math.max(0, diffInHours);
  };

  // 통계 업데이트 함수
  const updateStats = (updatedMembers: MemberProfile[]) => {
    setStats(prev => ({
      ...prev,
      totalMembers: updatedMembers.length,
      activeMembers: updatedMembers.filter(m => m.isActive).length,
      totalHours: calculateTotalHours(updatedMembers)
    }));
  };

  // Role 매핑 헬퍼 함수
  const mapRole = (apiRole: string): string => {
    const roleMap: { [key: string]: string } = {
      'OWNER': '스터디 리더',
      'MANAGER': '매니저',
      'MEMBER': '멤버',
      'ADMIN': '관리자'
    };
    return roleMap[apiRole] || apiRole;
  };

  // 실제 스터디 멤버 불러오기
  const loadStudyMembers = async () => {
    if (!studyId) {
      addToast('스터디 정보를 찾을 수 없습니다.', 'error');
      return;
    }
    
    setIsLoadingMembers(true);
    try {
      const response = await studyService.getStudyMembers(studyId, 0, 50);
      const loadedMembers: MemberProfile[] = response.content.map((member: MemberResponse, index: number) => ({
        // API에서 자동으로 가져온 데이터 (수정 불가)
        userId: member.userId,  // 원본 userId 저장
        name: member.userId,
        role: mapRole(member.role),
        joinDate: member.joinedAt ? String(member.joinedAt).split('T')[0] : '',  // ISO 날짜를 YYYY-MM-DD 형식으로 안전하게 변환
        isActive: member.status === 'ACTIVE',
        imageUrl: member.profileImage || `https://i.pravatar.cc/150?u=${member.userId}`,  // 프로필 이미지 자동 반영
        // 수동 입력 필드
        tagline: '',
        achievement: '',
        customFields: studyType !== 'custom' ? 
          STUDY_TEMPLATES[studyType as keyof typeof STUDY_TEMPLATES]?.customFields?.map(f => ({
            label: f.label,
            value: '',
            icon: f.icon
          })) : [],
        badges: member.role === 'OWNER' ? [{ type: 'mvp' as const, label: '리더', icon: '👑' }] : []
      }));
      
      // 기존 멤버가 있으면 병합, 없으면 새로 설정
      if (members.length > 0) {
        // 병합 로직: 기존 멤버 정보를 유지하면서 새 멤버 추가
        const existingNames = members.map(m => m.name);
        const newMembers = loadedMembers.filter(m => !existingNames.includes(m.name));
        setMembers([...members, ...newMembers]);
        addToast(`${newMembers.length}명의 새로운 멤버를 추가했습니다.`, 'success');
      } else {
        setMembers(loadedMembers);
        addToast(`${loadedMembers.length}명의 멤버를 불러왔습니다.`, 'success');
      }
      
      setHasLoadedFromAPI(true);
      
      // 통계 자동 업데이트
      updateStats(loadedMembers);
    } catch (error) {
      console.error('Failed to load members:', error);
      addToast('멤버 정보를 불러오는데 실패했습니다.', 'error');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // 모든 멤버 삭제
  const handleClearAllMembers = () => {
    if (members.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: '멤버 전체 삭제',
      message: `정말로 ${members.length}명의 멤버를 모두 삭제하시겠습니까?`,
      onConfirm: () => {
        setMembers([]);
        setHasLoadedFromAPI(false);
        updateStats([]);  // 통계 초기화
        addToast('모든 멤버가 삭제되었습니다.', 'info');
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
    const newMembers = [...members, newMember];
    setMembers(newMembers);
    updateStats(newMembers);  // 통계 업데이트
  };

  // 멤버 삭제
  const handleRemoveMember = (index: number) => {
    if (members.length > 1) {
      const newMembers = members.filter((_, i) => i !== index);
      setMembers(newMembers);
      updateStats(newMembers);  // 통계 업데이트
    }
  };

  // 멤버 필드 변경
  const handleMemberChange = (index: number, field: keyof MemberProfile, value: any) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
    
    // isActive 변경 시 통계 업데이트
    if (field === 'isActive') {
      updateStats(newMembers);
    }
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

  // 표준 예시 데이터 로드
  const loadStandardExample = () => {
    setTagHeader('함께하는 멤버들이에요');
    setTitle(RichTextConverter.fromHTML('더 멋진 여정이 펼쳐질 거예요,<br/>함께라면.'));
    setSubtitle(RichTextConverter.fromHTML(''));
    setLayout('carousel');
    setStudyType('algorithm');
    setShowStats(true);
    setWeeklyMvp('renechoi');
    
    const exampleMembers: MemberProfile[] = [
      {
        userId: 'renechoi@example.com',  // 테스트용 userId 추가
        name: 'renechoi',
        role: '스터디 리더',
        imageUrl: '/images/face/rene.png',
        joinDate: '2024-10-01',  // 가장 오래된 멤버 (약 3개월 전)
        tagline: '모임을 처음 시작한 사람 🏆',
        streak: 15,
        solvedProblems: 342,
        memorableProblem: '백준 11053 - 가장 긴 증가하는 부분 수열',
        currentFocus: '고급 DP 문제와 팀 빌딩 스킬',
        whatIGained: 'DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요',
        testimonial: '리더십과 알고리즘 실력 모두 뛰어나요!',
        from: 'kdelay',
        recentActivity: '1일 전 활동',
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
        joinDate: '2024-11-01',
        tagline: '꼼꼼한 코드 리뷰어 📝',
        streak: 12,
        solvedProblems: 298,
        memorableProblem: '백준 1932 - 정수 삼각형',
        currentFocus: '트리 DP와 멘토링 스킬 마스터하기',
        whatIGained: 'DP의 진정한 의미를 깨달았고, 코드 리뷰 스킬을 키웠어요',
        testimonial: '꼼꼼한 리뷰로 모두의 실력 향상에 기여해요!',
        from: 'KrongDev',
        recentActivity: '2일 전 활동',
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
        joinDate: '2024-11-01',
        tagline: '알고리즘 문제 해결사 💬',
        streak: 8,
        solvedProblems: 156,
        memorableProblem: '프로그래머스 - 네트워크',
        currentFocus: '최단경로 알고리즘과 문제 분석 능력',
        whatIGained: 'DFS/BFS를 완전히 이해하게 됐고, 문제 해결 패턴을 익혔어요',
        testimonial: '어려운 문제도 차근차근 해결하는 능력이 대단해요!',
        from: 'renechoi',
        recentActivity: '1일 전 활동',
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
        joinDate: '2024-11-01',
        tagline: '복잡한 개념도 쉽게 설명하는 멘토 📚',
        streak: 6,
        solvedProblems: 89,
        memorableProblem: '백준 9019 - DSLR',
        currentFocus: '세그먼트 트리와 설명 스킬 도전',
        whatIGained: 'BFS 최적화 방법을 터득했고, 설명하는 능력을 키웠어요',
        testimonial: '복잡한 개념도 쉽게 설명해주는 천재예요!',
        from: 'kdelay',
        recentActivity: '3일 전 활동',
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
      },
      {
        name: '민수',
        role: '트렌드 탐험가',
        imageUrl: '/images/face/xxx.png',
        joinDate: '2024-10-15',
        tagline: '새로운 알고리즘 트렌드를 가져오는 탐험가 🔍',
        streak: 9,
        solvedProblems: 124,
        memorableProblem: '백준 2206 - 벽 부수고 이동하기',
        currentFocus: '고급 그래프 알고리즘 탐구',
        whatIGained: 'BFS와 상태 관리의 핵심을 이해했어요',
        testimonial: '새로운 접근법으로 모두를 놀라게 해요!',
        from: 'renechoi',
        recentActivity: '2일 전 활동',
        customFields: [
          { label: '해결한 문제', value: '124', icon: '✅' },
          { label: '연속 참여', value: '9일', icon: '🔥' },
          { label: '주력 분야', value: '고급 그래프', icon: '📚' }
        ],
        isActive: true,
        lastActivity: '2일 전'
      },
      {
        name: '지영',
        role: '분위기 메이커',
        imageUrl: '/images/face/xxx.png',
        joinDate: '2024-11-20',
        tagline: '분위기 메이커이자 팀워크의 핵심 🎉',
        streak: 11,
        solvedProblems: 187,
        memorableProblem: '프로그래머스 - 카카오톡 채팅방',
        currentFocus: '문자열 알고리즘과 소통 스킬',
        whatIGained: '문자열 처리와 팀워크의 중요성을 배웠어요',
        testimonial: '힘든 순간에도 웃음을 잃지 않는 에너지!',
        from: '탁형',
        recentActivity: '1일 전 활동',
        customFields: [
          { label: '해결한 문제', value: '187', icon: '✅' },
          { label: '연속 참여', value: '11일', icon: '🔥' },
          { label: '주력 분야', value: '문자열', icon: '📚' }
        ],
        isActive: true,
        lastActivity: '1일 전'
      },
      {
        name: '현우',
        role: '최적화 마법사',
        imageUrl: '/images/face/xxx.png',
        joinDate: '2025-01-20',
        tagline: '최적화 마법사, 효율성의 달인 ⚡',
        streak: 7,
        solvedProblems: 98,
        memorableProblem: '백준 1759 - 암호 만들기',
        currentFocus: '고급 최적화와 성능 분석',
        whatIGained: '백트래킹과 최적화 기법을 체득했어요',
        testimonial: '복잡한 문제도 효율적으로 해결하는 마법사!',
        from: 'kdelay',
        recentActivity: '1일 전 활동',
        customFields: [
          { label: '해결한 문제', value: '98', icon: '✅' },
          { label: '연속 참여', value: '7일', icon: '🔥' },
          { label: '주력 분야', value: '최적화', icon: '📚' }
        ],
        isActive: true,
        lastActivity: '1일 전'
      },
      {
        name: "who's next?",
        role: '미래의 멤버',
        imageUrl: '/images/face/another.png',
        tagline: '당신의 합류를 기다려요 👋',
        streak: 0,
        solvedProblems: 0,
        memorableProblem: '',
        currentFocus: '',
        whatIGained: '',
        testimonial: '',
        from: '',
        recentActivity: '',
        customFields: [],
        isActive: false
      }
    ];
    
    setMembers(exampleMembers);
    updateStats(exampleMembers);  // 통계 자동 계산
    
    setStats({
      totalMembers: 8,
      activeMembers: 6,
      totalHours: 180,
      totalProblems: 1247,
      participationRate: 85,
      popularAlgorithms: ['DP', '그래프', '이분탐색', '그리디'],
      customStats: [
        { label: '총 해결한 문제', value: '1247', icon: '💡' },
        { label: '평균 참여율', value: '85%', icon: '📊' },
        { label: '인기 알고리즘', value: 'DP, 그래프, 이분탐색, 그리디', icon: '🏆' }
      ]
    });
  };

  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 빈 멤버 필터링
    const validMembers = members.filter(member => member.name && member.role);
    
    if (validMembers.length === 0) {
      addToast('최소 한 명의 멤버를 입력해주세요.', 'error');
      return;
    }

    onSave({
      tagHeader,
      title: typeof title === 'string' ? title : RichTextConverter.toHTML(title),
      subtitle: typeof subtitle === 'string' ? subtitle : RichTextConverter.toHTML(subtitle),
      layout,
      studyType: studyType === 'custom' ? undefined : studyType as keyof typeof STUDY_TEMPLATES,
      members: validMembers,
      showStats,
      stats: showStats ? stats : undefined,
      weeklyMvp
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="study-management-members-form">
      {/* 예시 데이터 버튼 - 우측 정렬 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={loadStandardExample}
          className="study-management-members-example-btn"
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))',
            border: '1px solid rgba(195, 232, 141, 0.3)',
            borderRadius: '6px',
            color: '#C3E88D',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(195, 232, 141, 0.2), rgba(130, 170, 255, 0.2))';
            e.currentTarget.style.borderColor = 'rgba(195, 232, 141, 0.5)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(195, 232, 141, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(195, 232, 141, 0.1), rgba(130, 170, 255, 0.1))';
            e.currentTarget.style.borderColor = 'rgba(195, 232, 141, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          예시 데이터 불러오기
        </button>
      </div>

      {/* 섹션 헤더 */}
      <div className="study-management-members-form-group">
        <label>태그 헤더</label>
        <input
          type="text"
          value={tagHeader}
          onChange={(e) => setTagHeader(e.target.value)}
          placeholder="함께하는 멤버들이에요"
          className="study-management-members-input"
        />
      </div>

      <div className="study-management-members-form-group">
        <label>제목</label>
        <StudyDetailRichTextEditor
          value={title}
          onChange={setTitle}
          placeholder="예: 더 멋진 여정이 펼쳐질 거예요, 함께라면."
          toolbar={['bold', 'italic', 'highlight', 'subtle-highlight', 'color', 'break']}
          maxLength={200}
        />
      </div>

      <div className="study-management-members-form-group">
        <label>부제목</label>
        <StudyDetailRichTextEditor
          value={subtitle}
          onChange={setSubtitle}
          placeholder="부제목을 입력하세요 (선택)"
          toolbar={['bold', 'italic', 'highlight', 'subtle-highlight', 'color', 'break']}
          maxLength={200}
        />
      </div>

      {/* 레이아웃 설정 */}
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
        <label>스터디 템플릿</label>
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
        {members.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px dashed rgba(255, 255, 255, 0.2)'
          }}>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px' }}>
              아직 추가된 멤버가 없습니다.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
              {studyId && (
                <>
                  <button
                    type="button"
                    onClick={loadStudyMembers}
                    disabled={isLoadingMembers}
                    style={{
                      background: 'linear-gradient(135deg, #89DDFF 0%, #C3E88D 100%)',
                      border: 'none',
                      color: '#1a1a1a',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: isLoadingMembers ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: isLoadingMembers ? 0.6 : 1
                    }}
                  >
                    {isLoadingMembers ? '불러오는 중...' : '📥 실제 멤버 정보 가져오기'}
                  </button>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>또는</span>
                </>
              )}
              <button
                type="button"
                onClick={handleAddMember}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✏️ 수동으로 추가
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: 'rgba(137, 221, 255, 0.05)',
              borderRadius: '6px',
              border: '1px solid rgba(137, 221, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                {studyId && hasLoadedFromAPI ? '✅ API에서 멤버 정보를 불러왔습니다.' : 
                 studyId ? '💡 참여중인 멤버를 불러올 수 있습니다.' : 
                 `현재 ${members.length}명의 멤버가 있습니다.`}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {studyId && (
                  <button
                    type="button"
                    onClick={loadStudyMembers}
                    disabled={isLoadingMembers}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(137, 221, 255, 0.3)',
                      color: '#89DDFF',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: isLoadingMembers ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      opacity: isLoadingMembers ? 0.6 : 1
                    }}
                  >
                    {isLoadingMembers ? '동기화 중...' : '🔄 멤버 정보 새로고침'}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClearAllMembers}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 99, 71, 0.3)',
                    color: '#ff6347',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 99, 71, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 99, 71, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255, 99, 71, 0.3)';
                  }}
                >
                  🗑️ 모두 삭제
                </button>
              </div>
            </div>
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
                  <label>이름 * <span style={{ color: '#C3E88D', fontSize: '12px', marginLeft: '4px' }}>(닉네임 가능!)</span></label>
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
                  <label>역할 * {member.userId && <span style={{ color: '#82AAFF', fontSize: '12px', marginLeft: '4px' }}>(자동)</span>}</label>
                  <input
                    type="text"
                    value={member.role}
                    onChange={(e) => handleMemberChange(memberIndex, 'role', e.target.value)}
                    placeholder="예: 스터디 리더, 멤버, 멘토"
                    className="study-management-members-input"
                    required
                    disabled={!!member.userId}  // API에서 가져온 데이터는 수정 불가
                    style={member.userId ? { 
                      background: 'rgba(130, 170, 255, 0.05)', 
                      cursor: 'not-allowed',
                      opacity: 0.7,
                      filter: 'blur(1px)'
                    } : {}}
                  />
                </div>
              </div>

              <div className="study-management-members-field-row">
                <div className="study-management-members-field">
                  <label>프로필 이미지 URL {member.userId && <span style={{ color: '#82AAFF', fontSize: '12px', marginLeft: '4px' }}>(자동)</span>}</label>
                  <input
                    type="text"
                    value={member.imageUrl || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'imageUrl', e.target.value)}
                    placeholder="예: /images/profile.png"
                    className="study-management-members-input"
                    disabled={!!member.userId}  // API에서 가져온 데이터는 수정 불가
                    style={member.userId ? { 
                      background: 'rgba(130, 170, 255, 0.05)', 
                      cursor: 'not-allowed',
                      opacity: 0.7,
                      filter: 'blur(1px)'
                    } : {}}
                  />
                </div>
                <div className="study-management-members-field">
                  <label>가입일 {member.userId && <span style={{ color: '#82AAFF', fontSize: '12px', marginLeft: '4px' }}>(자동)</span>}</label>
                  <input
                    type="date"
                    value={member.joinDate || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'joinDate', e.target.value)}
                    className="study-management-members-input"
                    disabled={!!member.userId}  // API에서 가져온 데이터는 수정 불가
                    style={member.userId ? { 
                      background: 'rgba(130, 170, 255, 0.05)', 
                      cursor: 'not-allowed',
                      opacity: 0.7,
                      filter: 'blur(1px)'
                    } : {}}
                  />
                </div>
              </div>

              {/* 한 줄 소개 */}
              <div className="study-management-members-field">
                <label>한 줄 소개 / 기여</label>
                <input
                  type="text"
                  value={member.tagline || ''}
                  onChange={(e) => handleMemberChange(memberIndex, 'tagline', e.target.value)}
                  placeholder="예: 모임을 처음 시작한 사람 🏆"
                  className="study-management-members-input"
                />
              </div>

              {/* 활동 통계 필드들 */}
              <div className="study-management-members-stats-fields-group">
                <h5 style={{ color: '#89DDFF', marginBottom: '12px', fontSize: '14px' }}>📊 활동 통계</h5>
                <div className="study-management-members-field-row">
                  <div className="study-management-members-field-streak-days">
                    <label>
                      연속 참여일 (🔥)
                      <span 
                        style={{ 
                          marginLeft: '6px',
                          fontSize: '11px',
                          cursor: 'help'
                        }}
                        title="첫 출석일부터 현재까지 연속으로 참여한 일수입니다. 추후 출석 기록과 연동하여 자동 계산됩니다."
                      >ℹ️</span>
                    </label>
                    <input
                      type="number"
                      value={member.streak || 0}
                      onChange={(e) => handleMemberChange(memberIndex, 'streak', parseInt(e.target.value) || 0)}
                      placeholder="예: 15"
                      className="study-management-members-input-streak"
                      disabled
                      style={{ 
                        background: 'rgba(130, 170, 255, 0.05)', 
                        cursor: 'not-allowed',
                        opacity: 0.7,
                        filter: 'blur(1px)'
                      }}
                      min="0"
                    />
                  </div>
                  <div className="study-management-members-field-solved-problems">
                    <label>
                      {member.customMetricLabel || (() => {
                        switch(studyType) {
                          case 'algorithm':
                            return '해결한 문제 수';
                          case 'design':
                            return '완성한 작품 수';
                          case 'reading':
                            return '읽은 책 수';
                          case 'language':
                            return '학습 시간 (시간)';
                          default:
                            return '완료한 과제';
                        }
                      })()}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMemberIndex(memberIndex);
                          setCustomLabelInput(member.customMetricLabel || '');
                          setShowCustomLabelModal(true);
                        }}
                        style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          fontSize: '11px',
                          background: 'rgba(195, 232, 141, 0.1)',
                          border: '1px solid rgba(195, 232, 141, 0.2)',
                          borderRadius: '4px',
                          color: '#C3E88D',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️
                      </button>
                    </label>
                    <input
                      type="number"
                      value={member.solvedProblems || 0}
                      onChange={(e) => handleMemberChange(memberIndex, 'solvedProblems', parseInt(e.target.value) || 0)}
                      placeholder={(() => {
                        switch(studyType) {
                          case 'algorithm':
                            return '예: 342';
                          case 'design':
                            return '예: 12';
                          case 'reading':
                            return '예: 25';
                          case 'language':
                            return '예: 120';
                          default:
                            return '예: 30';
                        }
                      })()}
                      className="study-management-members-input-solved-count"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* 학습 정보 필드들 */}
              <div className="study-management-members-learning-fields-group">
                <h5 style={{ color: '#C3E88D', marginBottom: '12px', fontSize: '14px' }}>📚 학습 정보</h5>
                <div className="study-management-members-field-memorable-problem">
                  <label>기억에 남는 문제</label>
                  <input
                    type="text"
                    value={member.memorableProblem || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'memorableProblem', e.target.value)}
                    placeholder="예: 백준 11053 - 가장 긴 증가하는 부분 수열"
                    className="study-management-members-input-memorable-problem"
                  />
                </div>
                <div className="study-management-members-field-current-focus">
                  <label>현재 집중 분야</label>
                  <input
                    type="text"
                    value={member.currentFocus || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'currentFocus', e.target.value)}
                    placeholder="예: 고급 DP 문제와 팀 빌딩 스킬"
                    className="study-management-members-input-current-focus"
                  />
                </div>
                <div className="study-management-members-field-what-gained">
                  <label>스터디에서 얻은 것</label>
                  <textarea
                    value={member.whatIGained || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'whatIGained', e.target.value)}
                    placeholder="예: DP의 최적화 방법과 스터디 운영의 노하우를 얻었어요"
                    className="study-management-members-textarea-what-gained"
                    rows={2}
                  />
                </div>
              </div>


              {/* 동료 평가 섹션 */}
              <div className="study-management-members-testimonial-section">
                <h5 style={{ color: '#FFCB6B', marginBottom: '12px', fontSize: '14px' }}>💬 동료 평가</h5>
                <div className="study-management-members-field-testimonial">
                  <label>상세 평가 (testimonial)</label>
                  <textarea
                    value={member.testimonial || ''}
                    onChange={(e) => handleMemberChange(memberIndex, 'testimonial', e.target.value)}
                    placeholder="예: 리더십과 알고리즘 실력 모두 뛰어나요! 복잡한 문제도 차근차근 풀어나가는 모습이 인상적입니다."
                    className="study-management-members-textarea-testimonial"
                    rows={2}
                  />
                </div>
                <div className="study-management-members-field-row">
                  <div className="study-management-members-field-testimonial-from">
                    <label>평가 작성자 (from)</label>
                    <input
                      type="text"
                      value={member.from || ''}
                      onChange={(e) => handleMemberChange(memberIndex, 'from', e.target.value)}
                      placeholder="예: kdelay"
                      className="study-management-members-input-testimonial-from"
                    />
                  </div>
                </div>
              </div>

              {/* 커스텀 필드 - 표준 형식 */}
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

              {/* 배지 - 표준 형식 */}
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

              {/* 상태 및 활동 정보 */}
              <div className="study-management-members-activity-status-section">
                <h5 style={{ color: '#82AAFF', marginBottom: '12px', fontSize: '14px' }}>🎯 활동 상태</h5>
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
                  <div className="study-management-members-field-last-activity">
                    <label>최근 활동 (lastActivity)</label>
                    <input
                      type="text"
                      value={member.lastActivity || ''}
                      onChange={(e) => handleMemberChange(memberIndex, 'lastActivity', e.target.value)}
                      placeholder="예: 1일 전"
                      className="study-management-members-input-last-activity"
                    />
                  </div>
                  <div className="study-management-members-field-recent-activity">
                    <label>최근 활동 상세 (recentActivity)</label>
                    <input
                      type="text"
                      value={member.recentActivity || ''}
                      onChange={(e) => handleMemberChange(memberIndex, 'recentActivity', e.target.value)}
                      placeholder="예: 1일 전 활동"
                      className="study-management-members-input-recent-activity"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
            ))}

            <button type="button" onClick={handleAddMember} className="study-management-members-add-btn">
              + 멤버 추가
            </button>
          </>
        )}
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
              <label>전체 멤버 <span style={{ color: '#82AAFF', fontSize: '12px', marginLeft: '4px' }}>(자동)</span></label>
              <input
                type="number"
                value={members.length}
                className="study-management-members-input"
                disabled
                style={{ 
                  background: 'rgba(130, 170, 255, 0.05)', 
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  MozAppearance: 'textfield',  // Firefox
                  WebkitAppearance: 'none'     // Chrome, Safari
                }}
              />
            </div>
            <div className="study-management-members-field">
              <label>활동 멤버 <span style={{ color: '#82AAFF', fontSize: '12px', marginLeft: '4px' }}>(자동)</span></label>
              <input
                type="number"
                value={members.filter(m => m.isActive).length}
                className="study-management-members-input"
                disabled
                style={{ 
                  background: 'rgba(130, 170, 255, 0.05)', 
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  MozAppearance: 'textfield',  // Firefox
                  WebkitAppearance: 'none'     // Chrome, Safari
                }}
              />
            </div>
            <div className="study-management-members-field" style={{ position: 'relative' }}>
              <label>
                함께한 시간
                <span style={{ color: '#82AAFF', fontSize: '12px', marginLeft: '4px' }}>(자동)</span>
                <span 
                  style={{ 
                    marginLeft: '6px',
                    fontSize: '11px',
                    cursor: 'help'
                  }}
                  title="가장 오래된 멤버의 가입일부터 현재까지의 시간을 계산합니다."
                >ℹ️
                </span>
              </label>
              <input
                type="number"
                value={calculateTotalHours(members)}
                className="study-management-members-input"
                disabled
                style={{ 
                  background: 'rgba(130, 170, 255, 0.05)', 
                  cursor: 'not-allowed',
                  opacity: 0.7,
                  MozAppearance: 'textfield',  // Firefox
                  WebkitAppearance: 'none'     // Chrome, Safari
                }}
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
        <p className="study-management-members-help-text">MVP 배지를 강조 표시합니다.</p>
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
    
    {/* \ucee4\uc2a4\ud140 \ub77c\ubca8 \uc785\ub825 \ubaa8\ub2ec */}
    {showCustomLabelModal && (
      <div className="study-management-members-custom-label-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCustomLabelModal(false);
          }
        }}
      >
        <div className="study-management-members-custom-label-modal">
          <div className="study-management-members-custom-label-modal-header">
            <h3>커스텀 메트릭 라벨 설정</h3>
            <button 
              type="button"
              className="study-management-members-custom-label-modal-close"
              onClick={() => setShowCustomLabelModal(false)}
            >
              ×
            </button>
          </div>
          <div className="study-management-members-custom-label-modal-body">
            <p className="study-management-members-custom-label-modal-description">
              스터디에 맞는 커스텀 라벨을 입력하세요.
            </p>
            <input
              type="text"
              value={customLabelInput}
              onChange={(e) => setCustomLabelInput(e.target.value)}
              placeholder="예: 완성한 프로젝트 수, 학습한 주제 수"
              className="study-management-members-custom-label-modal-input"
              autoFocus
            />
            <div className="study-management-members-custom-label-modal-examples">
              <span className="study-management-members-custom-label-modal-examples-title">예시:</span>
              <button 
                type="button"
                className="study-management-members-custom-label-modal-example-chip"
                onClick={() => setCustomLabelInput('완성한 프로젝트 수')}
              >
                완성한 프로젝트 수
              </button>
              <button 
                type="button"
                className="study-management-members-custom-label-modal-example-chip"
                onClick={() => setCustomLabelInput('학습한 주제 수')}
              >
                학습한 주제 수
              </button>
              <button 
                type="button"
                className="study-management-members-custom-label-modal-example-chip"
                onClick={() => setCustomLabelInput('참여한 세션 수')}
              >
                참여한 세션 수
              </button>
            </div>
          </div>
          <div className="study-management-members-custom-label-modal-footer">
            <button
              type="button"
              className="study-management-members-custom-label-modal-cancel-btn"
              onClick={() => setShowCustomLabelModal(false)}
            >
              취소
            </button>
            <button
              type="button"
              className="study-management-members-custom-label-modal-save-btn"
              onClick={() => {
                if (editingMemberIndex !== null) {
                  handleMemberChange(editingMemberIndex, 'customMetricLabel', customLabelInput);
                }
                setShowCustomLabelModal(false);
                setEditingMemberIndex(null);
              }}
            >
              적용
            </button>
          </div>
        </div>
      </div>
    )}
    
    <ConfirmModal
      isOpen={confirmModal.isOpen}
      title={confirmModal.title}
      message={confirmModal.message}
      onConfirm={confirmModal.onConfirm}
      onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
    />
    
    <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
};

export default MembersSectionForm;