import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApiError } from '../hooks/useApiError';
import { parseDate } from '../utils/studyScheduleUtils';
import studyService, { Study, ApplicationResponse, MemberResponse, ApplicationStatus, StudyUpdateRequest } from '../api/studyService';
import StudyUpdateModal from '../components/ui/StudyUpdateModal';
import studyDetailPageService, {
  StudyDetailPageData,
  PageSection,
  SectionType,
  AddSectionRequest,
  UpdatePageRequest,
  convertSectionTypeToLabel
} from '../api/studyDetailPageService';
import { systemDesignTemplate, turningPageTemplate } from '../components/studyDetailPage/editor/templateData';
import { SectionRenderer } from '../components/studyDetailPage/sections';
import SectionEditForm from '../components/studyDetailPage/editor/SectionEditForm';
import { normalizeMembersPropsForUI, serializeMembersPropsForAPI } from '../components/studyDetailPage/utils/membersAdapter';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmModal from '../components/common/ConfirmModal';
import InputModal from '../components/common/InputModal';
import { ToastContainer, ToastType } from '../components/common/Toast';
import styles from './StudyManagementPage.module.css';
import '../components/studyDetailPage/StudyDetailPageRenderer.module.css';

interface TabType {
  key: 'applications' | 'members' | 'page-editor';
  label: string;
  icon: string;
}

const tabs: TabType[] = [
  { key: 'applications', label: '참가 신청', icon: '📋' },
  { key: 'members', label: '멤버 관리', icon: '👥' },
  { key: 'page-editor', label: '상세 페이지 편집', icon: '✏️' }
];

const StudyManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { studyId } = useParams<{ studyId: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { handleApiError } = useApiError();
  const [activeTab, setActiveTab] = useState<'applications' | 'members' | 'page-editor'>('applications');
  const [study, setStudy] = useState<Study | null>(null);
  const [applications, setApplications] = useState<ApplicationResponse[]>([]);
  const [members, setMembers] = useState<MemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Page editor states
  const [pageData, setPageData] = useState<StudyDetailPageData | null>(null);
  const [selectedSection, setSelectedSection] = useState<PageSection | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [similarStudies, setSimilarStudies] = useState<Study[]>([]);
  const [isSearchingStudies, setIsSearchingStudies] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Modal and Toast states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmButtonClass?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmButtonClass: 'confirm-button'
  });
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    placeholder?: string;
    onSubmit: (value: string) => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    placeholder: '',
    onSubmit: () => {}
  });
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type?: ToastType;
  }>>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Cmd+S / Ctrl+S 단축키 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+S (Mac) or Ctrl+S (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !saving && activeTab === 'page-editor') {
          handleSaveDraft();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, saving, activeTab]);

  useEffect(() => {
    const fetchData = async () => {
      if (!studyId) {
        navigate('/study');
        return;
      }

      // Skip authentication check during initial loading
      if (authLoading) {
        return;
      }

      // After loading is complete, check for user existence
      if (!user) {
        navigate('/login', { state: { from: `/study/${studyId}/manage` } });
        return;
      }

      try {
        setLoading(true);
        
        // Fetch study details - studyId가 실제로는 slug일 수도 있음
        let studyData = null;

        // UUID 패턴 체크 (UUID v1, v4 등 모든 버전 지원)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studyId);

        if (isUUID) {
          studyData = await studyService.getStudyById(studyId);
        } else {
          // slug로 먼저 시도
          studyData = await studyService.getStudyBySlug(studyId);
        }

        if (!studyData) {
          addToast('존재하지 않는 스터디입니다.', 'error');
          navigate('/study');
          return;
        }
        
        // Study management page loaded successfully

        setStudy(studyData);

        // 권한 체크: proposerId 또는 ADMIN role
        const hasPermission = user && (
          user.email === studyData.proposerId ||
          user.systemRole === 'ROLE_ADMIN'
        );

        if (!hasPermission) {
          addToast('스터디 관리 권한이 없습니다.', 'error');
          navigate('/study');
          return;
        }

        // Fetch applications - 실제 study ID 사용
        try {
          const applicationsData = await studyService.getStudyApplications(studyData.id, 0, 50);
          setApplications(applicationsData.content);
        } catch (error) {
          console.warn('Failed to fetch applications:', error);
          setApplications([]);
        }

        // Fetch members - 실제 study ID 사용
        try {
          const membersData = await studyService.getStudyMembers(studyData.id, 0, 50);
          setMembers(membersData.content);
        } catch (error) {
          console.warn('Failed to fetch members:', error);
          setMembers([]);
        }

        // Fetch page data for editor - 상태와 무관하게 편집 가능한 페이지 가져오기
        const page = await studyDetailPageService.getPageForEditing(studyData.id, studyData.slug);
        
        // Ensure sections array is always initialized
        if (page) {
          if (!page.sections) {
            page.sections = [];
          }
          // Filter out any null or invalid sections
          page.sections = page.sections.filter(s => s && s.id);
          setPageData(page);
          // Page loaded successfully
        } else {
          // No page exists yet for this study
          setPageData(null);
        }

      } catch (error: any) {
        console.error('데이터 로딩 실패:', error);
        
        // 401 에러는 handleApiError가 처리
        if (error.response?.status === 401) {
          handleApiError(error);
          return;
        }
        
        // 기타 에러
        addToast('스터디 관리 정보를 불러올 수 없습니다.', 'error');
        navigate('/study');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studyId, navigate, authLoading, user]);

  const handleAcceptApplication = async (applicationId: string) => {
    if (!study || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setConfirmModal({
      isOpen: true,
      title: '참가 신청 승인',
      message: `${application.applicantId}님의 참가 신청을 승인하시겠습니까?`,
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doAcceptApplication(applicationId);
      },
      confirmButtonClass: styles.confirmButton
    });
  };

  const doAcceptApplication = async (applicationId: string) => {
    if (!study || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setActionLoading(applicationId);
    
    try {
      await studyService.acceptApplication(study.id, applicationId, {
        reviewerId: user.email,
        note: '참가 승인'
      });

      // Update applications state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: ApplicationStatus.ACCEPTED, reviewedBy: user.email, reviewNote: '참가 승인' }
            : app
        )
      );

      addToast('참가 신청이 승인되었습니다.', 'success');
      
      // Refresh members list
      try {
        const membersData = await studyService.getStudyMembers(study.id, 0, 50);
        setMembers(membersData.content);
      } catch (error) {
        console.warn('Failed to refresh members:', error);
      }
    } catch (error: any) {
      console.error('승인 처리 실패:', error);
      
      // 401 에러는 handleApiError가 처리
      if (error.response?.status === 401) {
        handleApiError(error);
        return;
      }
      
      const errorMessage = error.response?.data?.message || '승인 처리 중 오류가 발생했습니다.';
      addToast(errorMessage, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Page editor handlers
  const handleAddSection = async (type: SectionType | string, props: any) => {
    if (!study || !pageData) return;

    // 새 섹션의 order 값 계산 - 기존 최대값 + 100
    const maxOrder = pageData.sections.length > 0
      ? Math.max(...pageData.sections.filter(s => s).map(s => s.order || 0))
      : 0;

    // 임시 ID 생성 (저장 시 서버에서 실제 ID로 변경됨)
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newSection = {
      id: tempId,
      type: type as SectionType,
      props: props || {},
      order: maxOrder + 100
    };

    // 로컬 상태에 섹션 추가
    setPageData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, newSection]
      };
    });
    
    setHasUnsavedChanges(true);
    setShowAddSection(false);
    addToast('섹션이 추가되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'info');
  };

  const handleUpdateSection = async (sectionId: string, sectionType: SectionType | string, props: any, order?: number) => {
    if (!studyId || !pageData) return;

    // 로컬 상태에서만 섹션 업데이트 (서버 호출 없음)
    setPageData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map(s => 
          s.id === sectionId 
            ? { ...s, type: sectionType as SectionType, props, order: order ?? s.order }
            : s
        )
      };
    });
    
    // 저장되지 않은 변경사항 표시
    setHasUnsavedChanges(true);
    setSelectedSection(null);
    addToast('섹션이 수정되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'info');
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!studyId) return;

    setConfirmModal({
      isOpen: true,
      title: '섹션 삭제',
      message: '정말로 이 섹션을 삭제하시겠습니까?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doDeleteSection(sectionId);
      },
      confirmButtonClass: styles.deleteConfirmButton
    });
  };

  const doDeleteSection = async (sectionId: string) => {
    if (!studyId || !pageData) return;

    // 로컬 상태에서만 섹션 제거 (서버 호출 없음)
    setPageData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.filter(s => s.id !== sectionId)
      };
    });

    // 저장되지 않은 변경사항 표시
    setHasUnsavedChanges(true);
    addToast('섹션이 삭제되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'info');
  };

  // 전체 섹션 삭제
  const handleDeleteAllSections = async () => {
    if (!studyId || !pageData) return;

    setConfirmModal({
      isOpen: true,
      title: '전체 섹션 삭제',
      message: '⚠️ 정말로 모든 섹션을 삭제하시겠습니까? 이 작업은 실행 취소할 수 없습니다.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doDeleteAllSections();
      },
      confirmButtonClass: styles.deleteConfirmButton
    });
  };

  const doDeleteAllSections = async () => {
    if (!studyId || !pageData) return;

    const sectionCount = pageData.sections.length;

    // 로컬 상태에서 모든 섹션 제거 (서버 호출 없음)
    setPageData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: []
      };
    });

    // 저장되지 않은 변경사항 표시
    setHasUnsavedChanges(true);
    addToast(`${sectionCount}개의 섹션이 모두 삭제되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.`, 'warning');
  };

  const handleReorderSection = async (sectionId: string, newIndex: number) => {
    if (!studyId || !pageData) return;

    // 로컬 상태에서만 순서 변경 (서버 호출 없음)
    // 섹션을 order 기준으로 정렬한 후 재정렬
    const sortedSections = [...pageData.sections].filter(s => s && s.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const currentIndex = sortedSections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const [removed] = sortedSections.splice(currentIndex, 1);
    sortedSections.splice(newIndex, 0, removed);

    // order 값 재계산 - 100씩 간격을 두어 추후 중간 삽입 가능
    const reorderedSections = sortedSections.map((section, index) => ({
      ...section,
      order: (index + 1) * 100
    }));

    setPageData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: reorderedSections
      };
    });
    
    // 저장되지 않은 변경사항 표시
    setHasUnsavedChanges(true);
    addToast('순서가 변경되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'info');
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    // 드래그 중인 요소 스타일 설정
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  // 키보드 접근성을 위한 핸들러
  const handleKeyDown = (e: React.KeyboardEvent, section: PageSection, index: number) => {
    if (!pageData) return;

    // Alt + 화살표 키로 순서 변경
    if (e.altKey) {
      if (e.key === 'ArrowUp' && index > 0) {
        e.preventDefault();
        handleReorderSection(section.id, index - 1);
      } else if (e.key === 'ArrowDown' && index < pageData.sections.filter(s => s && s.id).length - 1) {
        e.preventDefault();
        handleReorderSection(section.id, index + 1);
      }
    }
    // Enter 키로 편집
    else if (e.key === 'Enter') {
      e.preventDefault();
      setSelectedSection(section);
    }
    // Delete 키로 삭제
    else if (e.key === 'Delete') {
      e.preventDefault();
      handleDeleteSection(section.id);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // 드래그 종료 시 스타일 복원
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedSectionId(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedSectionId || !pageData) return;

    // 정렬된 섹션 배열에서 인덱스 찾기
    const sortedSections = [...pageData.sections].filter(s => s && s.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const draggedIndex = sortedSections.findIndex(s => s.id === draggedSectionId);
    if (draggedIndex === -1 || draggedIndex === dropIndex) return;

    await handleReorderSection(draggedSectionId, dropIndex);
  };

  // 스터디 이름에서 기수 정보 제거하여 기본 이름 추출
  const getBaseStudyName = (title: string): string => {
    return title
      .replace(/\s*\d+기\s*$/, '')
      .replace(/\s*\d+(st|nd|rd|th)\s*$/i, '')
      .trim();
  };

  // 유사한 스터디 찾기
  const searchSimilarStudies = async () => {
    if (!study) return;

    setIsSearchingStudies(true);
    try {
      const allStudies = await studyService.getAllStudies();
      const baseName = getBaseStudyName(study.name).toLowerCase();
      
      const similar = allStudies.filter(s => {
        // 현재 스터디는 제외
        if (s.id === study.id) return false;
        
        const studyBaseName = getBaseStudyName(s.name).toLowerCase();
        return studyBaseName === baseName || 
               studyBaseName.includes(baseName) || 
               baseName.includes(studyBaseName);
      });

      // 기수 역순 정렬 (최신 기수가 먼저)
      similar.sort((a, b) => b.generation - a.generation);
      
      setSimilarStudies(similar);
      
      if (similar.length > 0) {
        setShowImportDialog(true);
      } else {
        addToast('이전 기수 스터디를 찾을 수 없습니다.', 'info');
      }
    } catch (err) {
      console.error('Failed to search similar studies:', err);
      addToast('스터디 검색에 실패했습니다.', 'error');
    } finally {
      setIsSearchingStudies(false);
    }
  };

  // 선택한 스터디에서 페이지 복사
  const importFromStudy = async (selectedStudy: Study) => {
    if (!study) return;

    // Importing from selected study

    try {
      setSaving(true);

      // 선택한 스터디의 상세 페이지 가져오기 (상태와 무관하게)
      const sourcePage = await studyDetailPageService.getPageForEditing(selectedStudy.id, selectedStudy.slug);
      // Source page loaded successfully

      if (!sourcePage || !sourcePage.sections || sourcePage.sections.length === 0) {
        addToast('가져올 페이지 데이터가 없습니다. 해당 스터디의 상세 페이지가 작성되지 않았습니다.', 'warning');
        setShowImportDialog(false);
        return;
      }

      // 현재 페이지가 없으면 먼저 생성
      let currentPage = pageData;
      if (!currentPage) {
        // Creating new page first
        currentPage = await studyDetailPageService.createPage(study.id, { slug: study.slug });
        setPageData(currentPage);
      }

      // 섹션들을 메모리에만 복사 (즉시 저장하지 않음!)
      const sectionsToAdd = sourcePage.sections.filter(section => section.type !== 'REVIEWS');

      if (sectionsToAdd.length === 0) {
        addToast('가져올 수 있는 섹션이 없습니다.', 'warning');
        setShowImportDialog(false);
        return;
      }

      // 현재 페이지 데이터에 섹션들 추가 (메모리상에서만)
      const updatedSections = [...(currentPage.sections || [])];

      // 최대 order 값 찾기
      const maxOrder = updatedSections.length > 0
        ? Math.max(...updatedSections.map(s => s.order || 0))
        : 0;

      // 새 섹션들 추가 (임시 ID 부여)
      sectionsToAdd.forEach((section, index) => {
        updatedSections.push({
          ...section,
          id: `imported_${Date.now()}_${index}`, // 임시 ID
          order: maxOrder + (index + 1) * 100
        });
      });

      // State만 업데이트 (저장하지 않음!)
      setPageData({
        ...currentPage,
        sections: updatedSections
      });

      addToast(`${selectedStudy.name}에서 ${sectionsToAdd.length}개 섹션을 가져왔습니다. 저장 버튼을 눌러 변경사항을 저장하세요.`, 'info');
      setShowImportDialog(false);
      setHasUnsavedChanges(true); // 저장되지 않은 변경사항 표시
    } catch (err) {
      console.error('Failed to import page:', err);
      addToast('페이지 가져오기에 실패했습니다. 콘솔에서 에러를 확인해주세요.', 'error');
      // 모달은 닫지 않음 - 다른 스터디 선택 가능
    } finally {
      setSaving(false);
    }
  };

  // 선택한 템플릿으로 초안 생성
  const handleApplyTemplate = async () => {
    if (!study || !selectedTemplate) {
      addToast('템플릿을 먼저 선택해주세요.', 'warning');
      return;
    }

    try {
      setSaving(true);

      // 현재 페이지가 없으면 먼저 생성
      let currentPage = pageData;
      if (!currentPage) {
        currentPage = await studyDetailPageService.createPage(study.id, { slug: study.slug });
        setPageData(currentPage);
      }

      // 템플릿 타입에 따라 섹션 매핑
      let sectionMapping: Array<{ type: SectionType; props: any }> = [];
      let templateName = '';

      if (selectedTemplate === 'systemDesign') {
        templateName = '시스템 디자인 (테크 다이브)';
        sectionMapping = [
          { type: SectionType.HERO, props: systemDesignTemplate.sections.hero },
          { type: SectionType.LEADER_INTRO, props: systemDesignTemplate.sections.leaderIntro },
          { type: SectionType.RICH_TEXT, props: systemDesignTemplate.sections.richText },
          { type: SectionType.HOW_WE_ROLL, props: systemDesignTemplate.sections.howWeRoll },
          { type: SectionType.JOURNEY, props: systemDesignTemplate.sections.journey },
          { type: SectionType.EXPERIENCE, props: systemDesignTemplate.sections.experience },
          { type: SectionType.MEMBERS, props: systemDesignTemplate.sections.members },
          { type: SectionType.REVIEWS, props: systemDesignTemplate.sections.review },
          { type: SectionType.FAQ, props: systemDesignTemplate.sections.faq },
          { type: SectionType.CTA, props: systemDesignTemplate.sections.cta }
        ];
      } else if (selectedTemplate === 'turningPage') {
        templateName = '터닝페이지 (회고 모임)';
        sectionMapping = [
          { type: SectionType.HERO, props: turningPageTemplate.sections.hero },
          { type: SectionType.LEADER_INTRO, props: turningPageTemplate.sections.leaderIntro },
          { type: SectionType.RICH_TEXT, props: turningPageTemplate.sections.richText },
          { type: SectionType.HOW_WE_ROLL, props: turningPageTemplate.sections.howWeRoll },
          { type: SectionType.JOURNEY, props: turningPageTemplate.sections.journey },
          { type: SectionType.EXPERIENCE, props: turningPageTemplate.sections.experience },
          { type: SectionType.MEMBERS, props: turningPageTemplate.sections.members },
          { type: SectionType.FAQ, props: turningPageTemplate.sections.faq },
          { type: SectionType.CTA, props: turningPageTemplate.sections.cta },
          { type: SectionType.REVIEWS, props: turningPageTemplate.sections.review }
        ];
      }
      // 향후 다른 템플릿 추가 가능:
      // else if (selectedTemplate === 'algorithm') { ... }
      // else if (selectedTemplate === 'mogakup') { ... }

      if (sectionMapping.length === 0) {
        addToast('선택한 템플릿을 찾을 수 없습니다.', 'error');
        return;
      }

      // 현재 페이지 데이터에 섹션들 추가 (메모리상에서만)
      const updatedSections = [...(currentPage.sections || [])];

      // 최대 order 값 찾기
      const maxOrder = updatedSections.length > 0
        ? Math.max(...updatedSections.map(s => s.order || 0))
        : 0;

      // 템플릿의 모든 섹션 추가 (임시 ID 부여)
      sectionMapping.forEach((section, index) => {
        updatedSections.push({
          id: `template_${Date.now()}_${index}`, // 임시 ID
          type: section.type,
          props: section.props,
          order: maxOrder + (index + 1) * 100
        });
      });

      // State만 업데이트 (저장하지 않음!)
      setPageData({
        ...currentPage,
        sections: updatedSections
      });

      addToast(`${templateName} 템플릿에서 ${sectionMapping.length}개 섹션을 생성했습니다. 저장 버튼을 눌러 변경사항을 저장하세요.`, 'success');
      setHasUnsavedChanges(true); // 저장되지 않은 변경사항 표시
      setSelectedTemplate(''); // 선택 초기화
    } catch (err) {
      console.error('Failed to generate template:', err);
      addToast('템플릿 생성에 실패했습니다.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!studyId || !pageData) return;

    try {
      setSaving(true);
      
      // 섹션 배열 확인 - 빈 배열도 명시적으로 전송
      const sectionsToSave = pageData.sections && pageData.sections.length > 0 
        ? pageData.sections.map(section => ({
            id: section.id,
            type: section.type,
            props: section.props || {},
            order: section.order || 0
          }))
        : []; // 빈 배열 명시적 전송

      console.log('Saving sections:', sectionsToSave.length, 'items');
      
      // 전체 페이지 상태를 저장
      const request: UpdatePageRequest = {
        theme: pageData.theme,
        sections: sectionsToSave
      };

      // 전체 페이지 저장 API 호출
      const updatedPage = await studyDetailPageService.saveDraft(study!.id, request);
      
      if (updatedPage) {
        console.log('Saved page sections:', updatedPage.sections?.length || 0, 'items');
        
        // 백엔드에서 정리된 데이터로 상태 업데이트
        // imported_/temp_ ID가 실제 UUID로 변환되어 옴
        setPageData(updatedPage);
        setHasUnsavedChanges(false);
        setLastSavedAt(new Date());
        addToast('모든 변경사항이 저장되었습니다', 'success');
      }
    } catch (err) {
      console.error('Failed to save draft:', err);
      addToast('저장에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPage = async () => {
    if (!studyId) return;

    setConfirmModal({
      isOpen: true,
      title: '페이지 발행',
      message: '현재 초안을 발행하시겠습니까? 발행하면 모든 사용자가 변경사항을 볼 수 있습니다.',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        await doPublishPage();
      },
      confirmButtonClass: styles.confirmButton
    });
  };

  const doPublishPage = async () => {
    if (!studyId) return;

    try {
      setSaving(true);
      
      // 초안을 먼저 저장 (저장되지 않은 변경사항이 있는 경우)
      if (hasUnsavedChanges) {
        await handleSaveDraft();
      }
      
      // 초안 발행
      const publishedPage = await studyDetailPageService.publish(study!.id);
      
      if (publishedPage) {
        setPageData(publishedPage);
        setHasUnsavedChanges(false);
        setSelectedSection(null);
        
        addToast('페이지가 성공적으로 발행되었습니다', 'success');
        
        // 발행 후 공개 페이지 URL 안내
        const publicUrl = `/study/${study!.slug}`;
        addToast(`공개 페이지: ${window.location.origin}${publicUrl}`, 'info');
      }
    } catch (err) {
      console.error('Failed to publish page:', err);
      addToast('페이지 발행에 실패했습니다', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Toast helper function
  const addToast = (message: string, type?: ToastType) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleRejectApplication = async (applicationId: string) => {
    if (!studyId || !user) return;

    const application = applications.find(app => app.id === applicationId);
    if (!application) return;

    setInputModal({
      isOpen: true,
      title: '참가 신청 거절',
      message: `${application.applicantId}님의 참가 신청을 거절하는 이유를 입력해주세요:`,
      placeholder: '거절 사유를 입력하세요...',
      onSubmit: async (reason: string) => {
        setInputModal(prev => ({ ...prev, isOpen: false }));
        if (!reason) return;

        setActionLoading(applicationId);

        try {
          await studyService.rejectApplication(studyId, applicationId, {
            reviewerId: user.email,
            reason: reason.trim()
          });

          // Update applications state
          setApplications(prev =>
            prev.map(app =>
              app.id === applicationId
                ? { ...app, status: ApplicationStatus.REJECTED, reviewedBy: user.email, reviewNote: reason.trim() }
                : app
            )
          );

          addToast('참가 신청이 거절되었습니다.', 'info');
        } catch (error: any) {
          console.error('거절 처리 실패:', error);
          const errorMessage = error.response?.data?.message || '거절 처리 중 오류가 발생했습니다.';
          addToast(errorMessage, 'error');
        } finally {
          setActionLoading(null);
        }
      }
    });
  };

  const handleUpdateStudy = async (updateData: StudyUpdateRequest) => {
    if (!studyId || !user) return;

    try {
      const updatedStudy = await studyService.updateStudy(studyId, updateData);

      // Transform the updated DTO back to Study format and update local state
      const studyData = await studyService.getStudyById(studyId);
      if (studyData) {
        setStudy(studyData);
      }

      alert('스터디 정보가 성공적으로 수정되었습니다.');
    } catch (error: any) {
      console.error('스터디 수정 실패:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.PENDING:
        return <span className={`${styles.statusBadge} ${styles.pending}`}>대기중</span>;
      case ApplicationStatus.ACCEPTED:
        return <span className={`${styles.statusBadge} ${styles.accepted}`}>승인됨</span>;
      case ApplicationStatus.REJECTED:
        return <span className={`${styles.statusBadge} ${styles.rejected}`}>거절됨</span>;
      default:
        return <span className={styles.statusBadge}>{status}</span>;
    }
  };

  const formatDate = (dateValue: string | number[] | undefined) => {
    try {
      const date = parseDate(dateValue);
      if (!date) return 'Invalid Date';

      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className={styles.studyManagementPage}>
        <div className={styles.loadingState}>
          <LoadingSpinner message="스터디 관리 정보를 불러오는 중..." fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!study) {
    return null;
  }

  const pendingApplications = applications.filter(app => app.status === ApplicationStatus.PENDING);
  const processedApplications = applications.filter(app => app.status !== ApplicationStatus.PENDING);

  return (
    <div className={styles.studyManagementPage}>
      <div className={styles.managementContainer}>
        <div className={styles.managementHeader}>
          <button 
            onClick={() => navigate(`/study/${study.slug}`)} 
            className={styles.backButton}
          >
            ← 스터디로 돌아가기
          </button>
          <div className="management-title">
            <h1>스터디 관리</h1>
          </div>
          <div className={styles.studyInfo}>
            <h2>{study.name} {study.generation > 1 && `${study.generation}기`}</h2>
            <p className={styles.studyTagline}>{study.tagline}</p>
            <div className={styles.studyStats}>
              <span>📋 신청자 {applications.length}명</span>
              <span>👥 멤버 {members.length}명</span>
              <span>⏳ 대기 {pendingApplications.length}명</span>
              {pageData && (
                <span>
                  {pageData.status === 'PUBLISHED' ? '✅ 발행됨' : '📝 초안'}
                  {pageData.publishedAt && pageData.status === 'PUBLISHED' && ` (${(() => {
                    try {
                      if (Array.isArray(pageData.publishedAt)) {
                        const [year, month, day] = pageData.publishedAt;
                        const date = new Date(year, month - 1, day);
                        return date.toLocaleDateString('ko-KR');
                      }
                      const date = new Date(pageData.publishedAt);
                      return isNaN(date.getTime()) ? '날짜 없음' : date.toLocaleDateString('ko-KR');
                    } catch {
                      return '날짜 없음';
                    }
                  })()})`}
                </span>
              )}
            </div>
          </div>
          {/* 권한 안내 메시지 */}
          {applications.length === 0 && members.length === 0 && (
            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '16px',
              color: '#ffc107',
              fontSize: '14px'
            }}>
              ⚠️ 스터디 호스트만 이 페이지에 접근할 수 있습니다. 권한이 없는 경우 데이터가 표시되지 않을 수 있습니다.
            </div>
          )}
        </div>

        <div className={styles.tabNavigation}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`${styles.tabButton} ${activeTab === tab.key ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
              {tab.key === 'applications' && pendingApplications.length > 0 && (
                <span className={styles.badge}>{pendingApplications.length}</span>
              )}
            </button>
          ))}
          
          {/* Study Edit Button - using same style as tabs */}
          {user && study && (user.email === study.proposerId || user.systemRole === 'ROLE_ADMIN') && (
            <button
              className={styles.tabButton}
              onClick={() => setShowUpdateModal(true)}
              title="스터디 정보 수정"
            >
              <span className={styles.tabIcon}>✏️</span>
              스터디 정보 수정
            </button>
          )}
        </div>

        {activeTab === 'applications' && (
          <div className={styles.applicationsSection}>
            {pendingApplications.length > 0 && (
              <div className={styles.pendingApplications}>
                <h3>🔔 검토 대기 중인 신청</h3>
                <div className={styles.applicationsGrid}>
                  {pendingApplications.map(application => (
                    <div key={application.id} className={`${styles.applicationCard} ${styles.pending}`}>
                      <div className={styles.applicationHeader}>
                        <h4>{application.applicantId}</h4>
                        {getStatusBadge(application.status)}
                        <span className={styles.applicationDate}>
                          {formatDate(application.createdAt)}
                        </span>
                      </div>

                      <div className={styles.applicationContent}>
                        {Object.entries(application.answers).map(([question, answer]) => (
                          <div key={question} className={styles.answerItem}>
                            <strong className={styles.questionLabel}>
                              {question === 'motivation' && '참여 동기:'}
                              {question === 'experience' && '관련 경험:'}
                              {question === 'availability' && '참여 가능 시간:'}
                              {question === 'expectations' && '기대하는 점:'}
                              {question === 'commitment' && '각오 한마디:'}
                              {!['motivation', 'experience', 'availability', 'expectations', 'commitment'].includes(question) && `${question}:`}
                            </strong>
                            <p className={styles.answerText}>{answer}</p>
                          </div>
                        ))}
                      </div>

                      <div className={styles.applicationActions}>
                        <button 
                          onClick={() => handleRejectApplication(application.id)}
                          className={styles.rejectButton}
                          disabled={actionLoading === application.id}
                        >
                          {actionLoading === application.id ? '처리 중...' : '거절'}
                        </button>
                        <button 
                          onClick={() => handleAcceptApplication(application.id)}
                          className={styles.acceptButton}
                          disabled={actionLoading === application.id}
                        >
                          {actionLoading === application.id ? '처리 중...' : '승인'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processedApplications.length > 0 && (
              <div className={styles.processedApplications}>
                <h3>📄 처리 완료된 신청</h3>
                <div className={styles.applicationsList}>
                  {processedApplications.map(application => (
                    <div key={application.id} className={styles.applicationItem}>
                      <div className={styles.applicationSummary}>
                        <span className={styles.applicantName}>{application.applicantId}</span>
                        {getStatusBadge(application.status)}
                        <span className={styles.applicationDate}>{formatDate(application.createdAt)}</span>
                      </div>
                      {application.reviewNote && (
                        <div className={styles.reviewNote}>
                          <strong>검토 메모:</strong> {application.reviewNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📭</div>
                <h3>아직 참가 신청이 없습니다</h3>
                <p>스터디가 공개되면 참가 신청이 들어올 예정입니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className={styles.membersSection}>
            {members.length > 0 ? (
              <div className={styles.membersGrid}>
                {members.map(member => (
                  <div key={member.id} className={styles.memberCard}>
                    <div className={styles.memberInfo}>
                      <h4>{member.userId}</h4>
                      <span className={styles.memberRole}>{member.role}</span>
                    </div>
                    <div className={styles.memberMeta}>
                      <span>가입: {formatDate(member.joinedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>아직 멤버가 없습니다</h3>
                <p>참가 신청을 승인하면 멤버로 추가됩니다.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'page-editor' && (
          <div className={styles.pageEditorSection}>
            {/* 상단 고정 툴바 */}
            {pageData && (
              <div className={styles.editorToolbar}>
                <div className={styles.toolbarStatus}>
                  {/* 저장 상태 표시 */}
                  {hasUnsavedChanges && (
                    <span className={styles.unsavedIndicator}>
                      저장되지 않은 변경사항
                    </span>
                  )}
                  {!saving && lastSavedAt && !hasUnsavedChanges && (
                    <span className={styles.lastSaved}>
                      마지막 저장: {lastSavedAt.toLocaleTimeString('ko-KR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  )}
                </div>

                <div className={styles.toolbarActions}>
                  {/* 미리보기 토글 */}
                  <button
                    className={styles.btnPreview}
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    {previewMode ? '✏️ 편집 모드' : '👁️ 미리보기'}
                  </button>

                  {/* 저장 버튼 - 항상 보임 */}
                  <button
                    className={`${styles.btnSave} ${!hasUnsavedChanges ? styles.saved : ''}`}
                    onClick={handleSaveDraft}
                    disabled={saving || !hasUnsavedChanges}
                    title={hasUnsavedChanges ? 'Cmd+S로 저장' : '모든 변경사항이 저장됨'}
                  >
                    {saving ? (
                      <>
                        <span className={styles.savingSpinner}>⟳</span>
                        저장 중...
                      </>
                    ) : (
                      <>
                        💾 {hasUnsavedChanges ? '저장' : '저장됨'}
                        {hasUnsavedChanges && <span className={styles.shortcut}>⌘S</span>}
                      </>
                    )}
                  </button>

                  {/* 발행하기 버튼 */}
                  <button
                    className={styles.btnPublish}
                    onClick={handlePublishPage}
                    disabled={saving || hasUnsavedChanges}
                    title={hasUnsavedChanges ? '저장 후 발행 가능' : '페이지 발행'}
                  >
                    📤 발행하기
                  </button>

                  {/* 구분선 */}
                  <div className={styles.divider}></div>

                  {/* 보조 기능들 */}
                  <button
                    className={styles.btnImport}
                    onClick={searchSimilarStudies}
                    disabled={isSearchingStudies || saving}
                    title="이전 기수에서 섹션 복사"
                  >
                    {isSearchingStudies ? '⟳' : '📋'}
                  </button>

                  {study?.slug && (
                    <button
                      className={styles.btnView}
                      onClick={() => window.open(`/study/${study.slug}`, '_blank')}
                      title="공개 페이지 보기"
                    >
                      🔗
                    </button>
                  )}
                </div>
              </div>
            )}

            {!pageData ? (
              <div className={styles.noPageMessage}>
                <div style={{ fontSize: '48px', marginBottom: '20px', opacity: 0.5 }}>📄</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#C3E88D' }}>
                  상세 페이지를 만들어보세요
                </h3>
                <p style={{ marginBottom: '20px', color: 'rgba(255, 255, 255, 0.7)' }}>
                  스터디 소개 페이지를 생성하고 다양한 섹션을 추가할 수 있습니다.
                </p>
                <button
                  onClick={async () => {
                    if (!studyId) return;
                    try {
                      setSaving(true);
                      // 백엔드가 study.slug를 사용해 생성한다는 전제
                      const newPage = await studyDetailPageService.createPage(study!.id, { slug: study!.slug });
                      setPageData(newPage);
                      addToast('페이지가 생성되었습니다! 섹션을 추가해보세요.', 'success');
                    } catch (err) {
                      console.error('Failed to create page:', err);
                      addToast('페이지 생성에 실패했습니다', 'error');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  style={{
                    background: 'linear-gradient(135deg, #C3E88D 0%, #89DDFF 100%)',
                    color: '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!saving) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(195, 232, 141, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {saving ? '생성 중...' : '🚀 페이지 생성하기'}
                </button>
              </div>
            ) : previewMode ? (
              <div className={styles.previewContainer}>
                <h4>미리보기</h4>
                <div className={`${styles.previewContent} study-detail-page-content`}>
                  <div className={styles.sectionsContainer}>
                    {pageData.sections.length === 0 ? (
                      <p style={{ textAlign: 'center', padding: '40px', color: '#999' }}>아직 섹션이 없습니다.</p>
                    ) : (
                      // 퍼블릭 렌더러와 동일한 정렬 적용 - order 값 기준
                      [...pageData.sections].filter(s => s && s.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((section) => (
                        <div key={section.id} className={styles.sectionWrapper}>
                          <SectionRenderer type={section.type} data={section.props} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.editorContent}>
                <div className={styles.sectionsManager}>
                  <div className={styles.sectionsHeader}>
                    <h4>섹션 관리</h4>
                    <div className={styles.sectionsHeaderButtons}>
                      <button
                        className={styles.btnDeleteAllSections}
                        onClick={handleDeleteAllSections}
                        disabled={!pageData?.sections || pageData.sections.length === 0}
                        title="모든 섹션 삭제"
                      >
                        🗑️ 전체 삭제
                      </button>
                      <button
                        className={styles.btnAddSection}
                        onClick={() => setShowAddSection(true)}
                      >
                        + 섹션 추가
                      </button>
                    </div>
                  </div>

                  {/* 템플릿 선택 UI */}
                  <div className={styles.templateSelector}>
                    <label className={styles.templateLabel}>
                      🚀 템플릿으로 빠르게 시작하기
                    </label>
                    <div className={styles.templateControls}>
                      <select
                        className={styles.templateDropdown}
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        disabled={saving}
                      >
                        <option value="">템플릿 선택...</option>
                        <option value="systemDesign">시스템 디자인 (테크 다이브)</option>
                        <option value="turningPage">터닝페이지 (회고 모임)</option>
                        {/* 향후 추가 가능:
                        <option value="algorithm">알고리즘 스터디</option>
                        <option value="mogakup">모각코</option>
                        <option value="bookStudy">독서 스터디</option>
                        */}
                      </select>
                      <button
                        className={styles.btnApplyTemplate}
                        onClick={handleApplyTemplate}
                        disabled={saving || !selectedTemplate}
                        title="선택한 템플릿의 모든 섹션 생성"
                      >
                        적용
                      </button>
                    </div>
                  </div>

                  <div className={styles.keyboardShortcutsHint}>
                    <span className={styles.shortcutIcon}>⌨️</span>
                    <span className={styles.shortcutText}>
                      <span className={styles.key}>Alt + ↑↓</span> 이동 ·
                      <span className={styles.key}>Enter</span> 편집 ·
                      <span className={styles.key}>Delete</span> 삭제
                    </span>
                  </div>

                  {showAddSection && (
                    <div className={styles.addSectionModal}>
                      <div className={styles.modalContent}>
                        <h5>새 섹션 추가</h5>
                        <div className={styles.sectionTypes}>
                          {/* 필요한 섹션 타입만 표시 */}
                          {[
                            SectionType.HERO,
                            SectionType.LEADER_INTRO,
                            SectionType.RICH_TEXT,
                            SectionType.MEMBERS,
                            SectionType.FAQ,
                            SectionType.CTA,
                            SectionType.REVIEWS,
                            SectionType.HOW_WE_ROLL,
                            SectionType.JOURNEY,
                            SectionType.EXPERIENCE
                          ].map((type) => (
                            <button
                              key={type}
                              className={styles.sectionTypeBtn}
                              onClick={() => {
                                // 임시 ID 생성 (저장 전까지 사용)
                                const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                const maxOrder = pageData.sections.length > 0
                                  ? Math.max(...pageData.sections.filter(s => s).map(s => s.order || 0))
                                  : 0;

                                // 새 섹션을 즉시 목록에 추가
                                const newSection = {
                                  id: tempId,
                                  type: type,
                                  props: {},
                                  order: maxOrder + 100,
                                  isTemp: true  // 임시 섹션 표시
                                };

                                // pageData에 즉시 추가
                                setPageData(prev => prev ? {
                                  ...prev,
                                  sections: [...prev.sections, newSection]
                                } : prev);

                                // 저장되지 않은 변경사항 표시
                                setHasUnsavedChanges(true);

                                // 편집 모드로 전환
                                setSelectedSection(newSection);
                                setShowAddSection(false);
                              }}
                            >
                              {convertSectionTypeToLabel(type)}
                            </button>
                          ))}
                        </div>
                        <button
                          className={styles.btnCancel}
                          onClick={() => setShowAddSection(false)}
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  <div className={styles.studyMgmtSectionsList}>
                    {pageData.sections.length === 0 ? (
                      <p className={styles.studyMgmtEmptyMessage}>아직 섹션이 없습니다. 섹션을 추가해주세요.</p>
                    ) : (
                      // 섹션 목록도 order 값 기준으로 정렬
                      [...pageData.sections].filter(s => s && s.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((section, index) => (
                        <div
                          key={section.id}
                          className={`${styles.studyMgmtSectionItem} ${
                            draggedSectionId === section.id ? styles.studyMgmtSectionDragging : ''
                          } ${
                            dragOverIndex === index ? styles.studyMgmtSectionDragOver : ''
                          } ${
                            (section.id && (section.id.startsWith('temp_') || section.id.startsWith('imported_'))) ? styles.tempSection : ''
                          }`}
                          draggable
                          tabIndex={0}
                          role="listitem"
                          aria-label={`${section.type} 섹션, ${index + 1}번째 위치. Alt+화살표로 순서 변경, Enter로 편집, Delete로 삭제`}
                          onDragStart={(e) => handleDragStart(e, section.id)}
                          onDragEnd={handleDragEnd}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, section, index)}
                        >
                          <div className={styles.studyMgmtDragHandle} title="드래그하여 순서 변경">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                              <circle cx="6" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="6" cy="10" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="6" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="14" cy="4" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="14" cy="10" r="1.5" fill="currentColor" opacity="0.6"/>
                              <circle cx="14" cy="16" r="1.5" fill="currentColor" opacity="0.6"/>
                            </svg>
                          </div>
                          <div className={styles.studyMgmtSectionInfo}>
                            <span className={styles.studyMgmtSectionType}>{convertSectionTypeToLabel(section.type)}</span>
                            {section.id && (section.id.startsWith('temp_') || section.id.startsWith('imported_')) && (
                              <span className={styles.tempLabel}>저장 필요</span>
                            )}
                          </div>
                          <div className={styles.studyMgmtSectionActions}>
                            <button
                              className={styles.studyMgmtEditBtn}
                              onClick={() => setSelectedSection(section)}
                              title="섹션 편집"
                            >
                              ✏️
                            </button>
                            <button
                              className={styles.studyMgmtDeleteBtn}
                              onClick={() => handleDeleteSection(section.id)}
                              title="섹션 삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedSection && (
                  <div className={styles.sectionEditor}>
                    <button
                      className={styles.sectionEditorClose}
                      onClick={() => setSelectedSection(null)}
                      aria-label="편집창 닫기"
                    >
                      ✕
                    </button>
                    <SectionEditForm
                      sectionType={selectedSection.type}
                      studyId={study?.id}  // 실제 스터디 ID 전달
                      initialData={selectedSection.type === SectionType.MEMBERS
                        ? normalizeMembersPropsForUI(selectedSection.props || {})
                        : (selectedSection.props || {})}
                      onSave={async (data) => {
                        const outgoing = selectedSection.type === SectionType.MEMBERS
                          ? serializeMembersPropsForAPI(data)
                          : data;

                        // 임시 섹션인 경우도 로컬에서만 처리
                        if (selectedSection.id.startsWith('temp_') || selectedSection.id.startsWith('imported_')) {
                          // 로컬 상태에서만 업데이트
                          setPageData(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              sections: prev.sections.map(s => 
                                s.id === selectedSection.id 
                                  ? { ...s, props: outgoing }
                                  : s
                              )
                            };
                          });
                          
                          // 저장되지 않은 변경사항 표시
                          setHasUnsavedChanges(true);
                          setSelectedSection(null);
                          addToast('섹션이 수정되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.', 'info');
                        } else {
                          // 기존 섹션 업데이트
                          handleUpdateSection(selectedSection.id, selectedSection.type, outgoing, selectedSection.order);
                        }
                      }}
                      onCancel={() => {
                        // 임시 섹션인 경우 목록에서 제거
                        if (selectedSection.id.startsWith('temp_') || selectedSection.id.startsWith('imported_')) {
                          setPageData(prev => prev ? {
                            ...prev,
                            sections: prev.sections.filter(s => s.id !== selectedSection.id)
                          } : prev);
                        }
                        setSelectedSection(null);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {saving && (
              <div className={styles.savingOverlay}>
                <LoadingSpinner />
                <p>저장 중...</p>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmButtonClass={confirmModal.confirmButtonClass}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        message={inputModal.message}
        placeholder={inputModal.placeholder}
        onSubmit={inputModal.onSubmit}
        onCancel={() => setInputModal(prev => ({ ...prev, isOpen: false }))}
        multiline={true}
        maxLength={500}
      />

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {/* Study Update Modal */}
      {study && (
        <StudyUpdateModal
          study={study}
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={handleUpdateStudy}
        />
      )}

      {/* 이전 기수 페이지 가져오기 다이얼로그 */}
      {showImportDialog && similarStudies.length > 0 && (
        <div className={styles.importDialogOverlay} onClick={() => setShowImportDialog(false)}>
          <div className={styles.importDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.importDialogHeader}>
              <h3>이전 기수 페이지를 가져올까요?</h3>
              <button 
                className={styles.importDialogClose}
                onClick={() => setShowImportDialog(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.importDialogContent}>
              <p className={styles.importDialogDescription}>
                유사한 스터디의 상세 페이지를 발견했습니다. 모든 섹션을 복사해서 빠르게 시작할 수 있어요.
              </p>
              
              <div className={styles.similarStudiesList}>
                {similarStudies.map(s => (
                  <div 
                    key={s.id}
                    className={styles.similarStudyItem}
                    onClick={() => importFromStudy(s)}
                  >
                    <div className={styles.similarStudyInfo}>
                      <div className={styles.similarStudyTitle}>
                        {s.name} ({s.generation}기)
                      </div>
                      {s.tagline && (
                        <div className={styles.similarStudyTagline}>
                          {s.tagline}
                        </div>
                      )}
                    </div>
                    <div className={styles.similarStudyAction}>
                      <span className={styles.importArrow}>→</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                className={styles.importDialogSkip}
                onClick={() => setShowImportDialog(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyManagementPage;
