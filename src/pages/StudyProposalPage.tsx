import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { StudyProposalRequest, StudyType, RecurrenceType } from '../api/studyService';
import ModernScheduleInput from '../components/study/ModernScheduleInput';
import DurationInput from '../components/study/DurationInput';
import { ToastContainer, useToast } from '../components/ui/Toast';
import { 
  ScheduleFrequency, 
  DurationUnit,
  formatScheduleToKorean,
  formatDurationToKorean
} from '../types/schedule';
import type { ScheduleData, DurationData } from '../types/schedule';
import './StudyProposalPage.css';

const StudyProposalPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { messages, success, error, warning, removeToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 기본 정보
  const [title, setTitle] = useState('');
  const [type, setType] = useState<StudyType>('PARTICIPATORY');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [generation, setGeneration] = useState('1');
  const [slug, setSlug] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('WEEKLY');
  
  // 일정 및 기간
  const [schedule, setSchedule] = useState<ScheduleData>({
    daysOfWeek: [],
    startTime: '',
    endTime: '',
    frequency: ScheduleFrequency.WEEKLY,
    additionalInfo: ''
  });
  const [duration, setDuration] = useState<DurationData>({
    value: 8,
    unit: DurationUnit.WEEKS
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // 모집 정보
  const [capacity, setCapacity] = useState('20');
  const [recruitDeadline, setRecruitDeadline] = useState('');
  const [recruitDeadlineTime, setRecruitDeadlineTime] = useState('23:59');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // 자동으로 slug 생성 (사용자가 slug를 직접 입력하지 않은 경우)
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      error('스터디 제안을 위해서는 로그인이 필요합니다.');
      setTimeout(() => navigate('/login', { state: { from: '/study/propose' } }), 1500);
      return;
    }
    
    // 사용자 식별자 확인
    if (!user.id && !user.username && !user.email) {
      console.error('User object:', user);
      error('사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.');
      setTimeout(() => navigate('/login', { state: { from: '/study/propose' } }), 1500);
      return;
    }

    // 필수 필드 검증
    if (!title.trim() || !description.trim()) {
      warning('제목과 설명은 필수입니다.');
      return;
    }

    // ONE_TIME 스터디의 경우 날짜 검증 조정
    if (recurrenceType === 'ONE_TIME') {
      if (!selectedDate) {
        warning('1회성 스터디는 날짜를 선택해주세요.');
        return;
      }
      if (!schedule.startTime || !schedule.endTime) {
        warning('시작 시간과 종료 시간을 입력해주세요.');
        return;
      }
    } else {
      // 반복 스터디 날짜 검증
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        warning('시작일은 종료일보다 빠를 수 없습니다.');
        return;
      }
      
      if (recruitDeadline && startDate && new Date(recruitDeadline) > new Date(startDate)) {
        warning('모집 마감일은 시작일보다 빠를 수 없습니다.');
        return;
      }
      
      if (schedule.daysOfWeek.length === 0) {
        warning('반복 스터디는 요일을 선택해주세요.');
        return;
      }
      
      if (!schedule.startTime || !schedule.endTime) {
        warning('시작 시간과 종료 시간을 입력해주세요.');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      // ONE_TIME인 경우 특별 처리
      let finalStartDate = startDate;
      let finalEndDate = endDate;
      let scheduleString: string | undefined;
      
      if (recurrenceType === 'ONE_TIME') {
        // ONE_TIME은 selectedDate를 사용
        if (selectedDate) {
          finalStartDate = selectedDate;
          finalEndDate = selectedDate;
        }
        // ONE_TIME 스케줄 표시
        if (selectedDate && schedule.startTime && schedule.endTime) {
          const dateObj = new Date(selectedDate + 'T00:00:00');
          scheduleString = `${dateObj.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })} ${schedule.startTime}-${schedule.endTime}`;
        }
      } else {
        // 반복 스터디는 기존 로직 사용
        scheduleString = (schedule.daysOfWeek.length > 0 && schedule.startTime && schedule.endTime) 
          ? formatScheduleToKorean(schedule) 
          : undefined;
      }
      
      // 모집 마감일시 생성 (날짜 + 시간)
      const recruitDeadlineDateTime = recruitDeadline 
        ? `${recruitDeadline}T${recruitDeadlineTime}:00`
        : undefined;
      
      // API 요청을 위한 데이터 준비
      const proposalRequest: StudyProposalRequest = {
        title: title.trim(),
        description: description.trim(),
        proposerId: user.id || user.username || user.email, // 사용 가능한 식별자 사용
        type: type as StudyType,
        generation: parseInt(generation) || 1,
        slug: slug || generateSlug(title),
        tagline: tagline || undefined,
        schedule: scheduleString,
        // ONE_TIME은 duration 없음
        duration: recurrenceType !== 'ONE_TIME' && duration.value > 0 
          ? formatDurationToKorean(duration) 
          : undefined,
        capacity: parseInt(capacity) || undefined,
        recruitDeadline: recruitDeadlineDateTime,
        startDate: finalStartDate || undefined,
        endDate: finalEndDate || undefined,
        recurrenceType: recurrenceType,
      };
      
      // API 호출
      await studyService.proposeStudy(proposalRequest);
      
      success('스터디 제안이 성공적으로 제출되었습니다! 관리자 검토 후 연락드리겠습니다.');
      setTimeout(() => navigate('/study'), 2000);
    } catch (err: any) {
      console.error('스터디 제안 실패:', err);
      const errorMessage = err.response?.data?.message || '스터디 제안 제출 중 오류가 발생했습니다. 다시 시도해주세요.';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="study-proposal-page">
      <ToastContainer messages={messages} onClose={removeToast} />
      <div className="proposal-container">
        <div className="proposal-header">
          <button 
            onClick={() => navigate('/study')} 
            className="back-button"
          >
            ← 돌아가기
          </button>
          <h1>스터디 제안하기</h1>
          <p className="header-description">
            원하는 스터디가 없나요? 직접 제안해보세요!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="proposal-form">
          <div className="form-section">
            <h2>기본 정보</h2>
            
            <div className="form-group">
              <label htmlFor="title">스터디 이름 *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                onChange={handleTitleChange}
                placeholder="예: React 심화 스터디"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">스터디 유형 *</label>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as StudyType)}
                required
              >
                <option value="PARTICIPATORY">참여형 (함께 학습하고 성장)</option>
                <option value="EDUCATIONAL">교육형 (강의 중심 학습)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="recurrenceType">반복 유형 *</label>
              <select
                id="recurrenceType"
                name="recurrenceType"
                value={recurrenceType}
                onChange={(e) => {
                  const newRecurrence = e.target.value as RecurrenceType;
                  setRecurrenceType(newRecurrence);
                  
                  // ONE_TIME 선택 시 초기화
                  if (newRecurrence === 'ONE_TIME') {
                    // 요일 선택 초기화
                    setSchedule(prev => ({ ...prev, daysOfWeek: [] }));
                    // 시작일/종료일 초기화
                    setStartDate('');
                    setEndDate('');
                  } else {
                    // 반복 스터디 선택 시 selectedDate 초기화
                    setSelectedDate('');
                  }
                }}
                required
              >
                <option value="ONE_TIME">1회성 (한 번만 진행)</option>
                <option value="DAILY">매일 - 매일 반복</option>
                <option value="WEEKLY">매주 - 주 단위 반복</option>
                <option value="BIWEEKLY">격주 - 2주 단위 반복</option>
                <option value="MONTHLY">매월 - 월 단위 반복</option>
              </select>
              {recurrenceType === 'ONE_TIME' && (
                <small style={{ fontSize: '12px', color: '#89DDFF', marginTop: '4px', display: 'block' }}>
                  💡 1회성 스터디는 시작일과 종료일이 같습니다
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="tagline">한 줄 소개</label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="스터디를 한 문장으로 표현해주세요"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">상세 설명 *</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="스터디의 목표, 진행 방식, 기대 효과 등을 자세히 설명해주세요"
                required
                rows={6}
                maxLength={1000}
              />
              <span className="char-count">{description.length}/1000</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="generation">기수</label>
                <input
                  type="number"
                  id="generation"
                  name="generation"
                  value={generation}
                  onChange={(e) => setGeneration(e.target.value)}
                  placeholder="1"
                  min="1"
                  max="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="slug">URL 식별자</label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="자동 생성됨"
                  pattern="[a-z0-9-]+"
                />
                <small style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  /study/{slug || 'url-식별자'}
                </small>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>운영 계획</h2>
            
            <div className="form-group">
              <label>일정 설정</label>
              <ModernScheduleInput
                value={schedule}
                onChange={setSchedule}
                recurrenceType={recurrenceType}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* 진행 기간 - ONE_TIME이 아닐 때만 표시 */}
            {recurrenceType !== 'ONE_TIME' && (
              <div className="form-group">
                <label>진행 기간</label>
                <DurationInput
                  value={duration}
                  onChange={setDuration}
                  startDate={startDate}
                  endDate={endDate}
                />
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="capacity">모집 인원</label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                  max="100"
                  placeholder="20"
                />
              </div>

              <div className="form-group">
                <label htmlFor="recruitDeadline">모집 마감일시</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="date"
                    id="recruitDeadline"
                    name="recruitDeadline"
                    value={recruitDeadline}
                    onChange={(e) => setRecruitDeadline(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="time"
                    id="recruitDeadlineTime"
                    name="recruitDeadlineTime"
                    value={recruitDeadlineTime}
                    onChange={(e) => setRecruitDeadlineTime(e.target.value)}
                    style={{ width: '120px' }}
                  />
                </div>
                <small style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'block' }}>
                  모집 마감 시간을 설정합니다 (기본: 23:59)
                </small>
              </div>
            </div>

            {/* 시작일/종료일 - ONE_TIME이 아닐 때만 표시 */}
            {recurrenceType !== 'ONE_TIME' && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">시작일</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">종료일</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            )}
          </div>


          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/study')}
              className="cancel-button"
            >
              취소
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? '제출 중...' : '제안하기'}
            </button>
          </div>
        </form>

        <div className="proposal-info">
          <h3>💡 제안 프로세스</h3>
          <ol>
            <li>제안서를 작성하여 제출합니다.</li>
            <li>관리자가 제안을 검토합니다. (1-3일 소요)</li>
            <li>승인되면 이메일로 안내드립니다.</li>
            <li>스터디 페이지에 공개되어 모집이 시작됩니다.</li>
          </ol>
          <p className="info-note">
            * 제안하신 분께는 스터디 리더 권한이 부여됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudyProposalPage;
