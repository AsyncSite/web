import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import studyService, { StudyProposalRequest, StudyType, RecurrenceType } from '../api/studyService';
import { ScheduleFrequency, DurationUnit } from '../types/schedule';
import { ToastContainer, useToast } from '../components/ui/Toast';
import TimePickerCustom from '../components/study/TimePickerCustom';
import DatePickerCustom from '../components/study/DatePickerCustom';
import DurationSelector from '../components/study/DurationSelector';
import './StudyProposalPageV2.css';

const StudyProposalPageV2: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { messages, success, error, warning, removeToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    type: 'PARTICIPATORY' as StudyType,
    recurrenceType: 'WEEKLY' as RecurrenceType,
    tagline: '',
    description: '',
    generation: 1,
    slug: '',
    selectedDate: '',
    daysOfWeek: [] as number[],
    startTime: '',
    endTime: '',
    duration: 8,
    durationUnit: 'WEEKS' as 'WEEKS' | 'MONTHS',
    capacity: 20,
    recruitDeadline: '',
    recruitDeadlineTime: '23:59',
    startDate: '',
    endDate: '',
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate slug
      if (field === 'title' && (!prev.slug || prev.slug === generateSlug(prev.title))) {
        newData.slug = generateSlug(value);
      }
      
      // Auto-calculate end date when start date or duration changes
      if (prev.recurrenceType !== 'ONE_TIME') {
        if (field === 'startDate' && value) {
          // Calculate end date based on duration
          const endDate = calculateEndDate(value, prev.duration, prev.durationUnit);
          if (endDate) {
            newData.endDate = endDate;
          }
        } else if ((field === 'duration' || field === 'durationUnit') && prev.startDate) {
          // Recalculate end date when duration changes
          const endDate = calculateEndDate(
            prev.startDate, 
            field === 'duration' ? value : prev.duration,
            field === 'durationUnit' ? value : prev.durationUnit
          );
          if (endDate) {
            newData.endDate = endDate;
          }
        }
      }
      
      return newData;
    });
  };

  const calculateEndDate = (startDate: string, duration: number, unit: 'WEEKS' | 'MONTHS'): string => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(start);
    
    if (unit === 'WEEKS') {
      end.setDate(end.getDate() + (duration * 7));
    } else {
      end.setMonth(end.getMonth() + duration);
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleQuickDuration = (hours: number) => {
    if (formData.startTime) {
      const [h, m] = formData.startTime.split(':').map(Number);
      let endHour = h + Math.floor(hours);
      let endMinute = m + Math.round((hours % 1) * 60);
      
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }
      
      if (endHour >= 24) {
        endHour = endHour % 24;
      }
      
      const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
      handleInputChange('endTime', endTime);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 1:
        if (formData.recurrenceType === 'ONE_TIME') {
          return formData.selectedDate !== '' && formData.startTime !== '' && formData.endTime !== '';
        }
        return formData.daysOfWeek.length > 0 && formData.startTime !== '' && formData.endTime !== '';
      case 2:
        return true; // Optional fields
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      error('스터디 제안을 위해서는 로그인이 필요합니다.');
      setTimeout(() => navigate('/login', { state: { from: '/study/propose' } }), 1500);
      return;
    }

    setIsSubmitting(true);

    try {
      let scheduleString: string | undefined;
      let finalStartDate = formData.startDate;
      let finalEndDate = formData.endDate;

      if (formData.recurrenceType === 'ONE_TIME') {
        if (formData.selectedDate) {
          finalStartDate = formData.selectedDate;
          finalEndDate = formData.selectedDate;
          
          const dateObj = new Date(formData.selectedDate + 'T00:00:00');
          scheduleString = `${dateObj.toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })} ${formData.startTime}-${formData.endTime}`;
        }
      } else {
        if (formData.daysOfWeek.length > 0 && formData.startTime && formData.endTime) {
          const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
          const selectedDays = formData.daysOfWeek.map(day => dayNames[day]).join(', ');
          scheduleString = `매주 ${selectedDays} ${formData.startTime}-${formData.endTime}`;
        }
      }

      const recruitDeadlineDateTime = formData.recruitDeadline 
        ? `${formData.recruitDeadline}T${formData.recruitDeadlineTime}:00`
        : undefined;

      const proposalRequest: StudyProposalRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        proposerId: user.id || user.username || user.email,
        type: formData.type as StudyType,
        generation: formData.generation,
        slug: formData.slug || generateSlug(formData.title),
        tagline: formData.tagline || undefined,
        schedule: scheduleString,
        duration: formData.recurrenceType !== 'ONE_TIME' && formData.duration > 0 
          ? `${formData.duration}${formData.durationUnit === 'WEEKS' ? '주' : '개월'}` 
          : undefined,
        capacity: formData.capacity || undefined,
        recruitDeadline: recruitDeadlineDateTime,
        startDate: finalStartDate || undefined,
        endDate: finalEndDate || undefined,
        recurrenceType: formData.recurrenceType,
      };

      await studyService.proposeStudy(proposalRequest);
      
      success('스터디 제안이 성공적으로 제출되었습니다! 관리자 검토 후 연락드리겠습니다.');
      setTimeout(() => navigate('/study'), 2000);
    } catch (err: any) {
      console.error('스터디 제안 실패:', err);
      const errorMessage = err.response?.data?.message || '스터디 제안 제출 중 오류가 발생했습니다.';
      error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: '기본 정보', icon: '📝' },
    { title: '일정 설정', icon: '📅' },
    { title: '모집 정보', icon: '👥' },
  ];

  const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="study-proposal-v2">
      <ToastContainer messages={messages} onClose={removeToast} />
      <div className="proposal-container-v2">
        <button 
          onClick={() => navigate('/study')} 
          className="back-button-v2"
        >
          ← 돌아가기
        </button>
        
        <div className="proposal-header-v2">
          <h1>스터디 제안하기</h1>
          <p>원하는 스터디가 없나요? 직접 제안해보세요!</p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step-item ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'completed' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>

        <div className="form-container-v2">
          {currentStep === 0 && (
            <div className="form-step">
              <div className="form-group-v2">
                <label>스터디 이름 *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="예: React 심화 스터디"
                  className="modern-input"
                />
              </div>

              <div className="form-row-v2">
                <div className="form-group-v2">
                  <label>스터디 유형 *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="modern-select"
                  >
                    <option value="PARTICIPATORY">참여형 (함께 학습하고 성장)</option>
                    <option value="EDUCATIONAL">교육형 (강의 중심 학습)</option>
                  </select>
                </div>

                <div className="form-group-v2">
                  <label>반복 유형 *</label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => handleInputChange('recurrenceType', e.target.value)}
                    className="modern-select"
                  >
                    <option value="ONE_TIME">1회성 (한 번만 진행)</option>
                    <option value="DAILY">매일</option>
                    <option value="WEEKLY">매주</option>
                    <option value="BIWEEKLY">격주</option>
                    <option value="MONTHLY">매월</option>
                  </select>
                </div>
              </div>

              <div className="form-group-v2">
                <label>한 줄 소개</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  placeholder="스터디를 한 문장으로 표현해주세요"
                  className="modern-input"
                />
              </div>

              <div className="form-group-v2">
                <label>상세 설명 *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="스터디의 목표, 진행 방식, 기대 효과 등을 자세히 설명해주세요"
                  className="modern-textarea"
                  rows={6}
                />
                <div className="char-count">{formData.description.length}/1000</div>
              </div>

              <div className="form-row-v2">
                <div className="form-group-v2">
                  <label>기수</label>
                  <input
                    type="number"
                    value={formData.generation}
                    onChange={(e) => handleInputChange('generation', parseInt(e.target.value) || 1)}
                    className="modern-input"
                    min="1"
                    max="100"
                  />
                </div>

                <div className="form-group-v2">
                  <label>URL 식별자</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="자동 생성됨"
                    className="modern-input"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="form-step">
              {formData.recurrenceType === 'ONE_TIME' ? (
                <>
                  <div className="form-group-v2">
                    <label>스터디 날짜 *</label>
                    <DatePickerCustom
                      value={formData.selectedDate}
                      onChange={(value) => handleInputChange('selectedDate', value)}
                      placeholder="날짜를 선택해주세요"
                    />
                  </div>

                  <div className="form-row-v2">
                    <div className="form-group-v2">
                      <label>시작 시간 *</label>
                      <TimePickerCustom
                        value={formData.startTime}
                        onChange={(value) => handleInputChange('startTime', value)}
                        placeholder="시작 시간 선택"
                      />
                    </div>

                    <div className="form-group-v2">
                      <label>종료 시간 *</label>
                      <TimePickerCustom
                        value={formData.endTime}
                        onChange={(value) => handleInputChange('endTime', value)}
                        placeholder="종료 시간 선택"
                      />
                    </div>
                  </div>
                  
                  {formData.startTime && (
                    <div className="quick-duration-section">
                      <label>빠른 시간 설정</label>
                      <div className="quick-duration-buttons">
                        {[1, 1.5, 2, 2.5, 3].map(hours => (
                          <button
                            key={hours}
                            type="button"
                            className="quick-duration-btn"
                            onClick={() => handleQuickDuration(hours)}
                          >
                            {hours % 1 === 0 ? `${hours}시간` : `${Math.floor(hours)}시간 30분`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="form-group-v2">
                    <label>요일 선택 *</label>
                    <div className="days-selector">
                      {dayNames.map((day, index) => (
                        <button
                          key={index}
                          type="button"
                          className={`day-button-v2 ${formData.daysOfWeek.includes(index) ? 'selected' : ''}`}
                          onClick={() => {
                            const newDays = formData.daysOfWeek.includes(index)
                              ? formData.daysOfWeek.filter(d => d !== index)
                              : [...formData.daysOfWeek, index];
                            handleInputChange('daysOfWeek', newDays);
                          }}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-row-v2">
                    <div className="form-group-v2">
                      <label>시작 시간 *</label>
                      <TimePickerCustom
                        value={formData.startTime}
                        onChange={(value) => handleInputChange('startTime', value)}
                        placeholder="시작 시간 선택"
                      />
                    </div>

                    <div className="form-group-v2">
                      <label>종료 시간 *</label>
                      <TimePickerCustom
                        value={formData.endTime}
                        onChange={(value) => handleInputChange('endTime', value)}
                        placeholder="종료 시간 선택"
                      />
                    </div>
                  </div>
                  
                  {formData.startTime && (
                    <div className="quick-duration-section">
                      <label>빠른 시간 설정</label>
                      <div className="quick-duration-buttons">
                        {[1, 1.5, 2, 2.5, 3].map(hours => (
                          <button
                            key={hours}
                            type="button"
                            className="quick-duration-btn"
                            onClick={() => handleQuickDuration(hours)}
                          >
                            {hours % 1 === 0 ? `${hours}시간` : `${Math.floor(hours)}시간 30분`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group-v2">
                    <label>진행 기간</label>
                    <DurationSelector
                      value={formData.duration}
                      unit={formData.durationUnit}
                      onValueChange={(value) => handleInputChange('duration', value)}
                      onUnitChange={(unit) => handleInputChange('durationUnit', unit)}
                      startDate={formData.startDate}
                      endDate={formData.endDate}
                    />
                  </div>

                  <div className="form-row-v2">
                    <div className="form-group-v2">
                      <label>시작일</label>
                      <DatePickerCustom
                        value={formData.startDate}
                        onChange={(value) => handleInputChange('startDate', value)}
                        placeholder="시작일 선택"
                      />
                    </div>

                    <div className="form-group-v2">
                      <label>종료일</label>
                      <DatePickerCustom
                        value={formData.endDate}
                        onChange={(value) => handleInputChange('endDate', value)}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        placeholder="종료일 선택"
                      />
                      {formData.endDate && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: '#89DDFF' 
                        }}>
                          💡 진행 기간에 따라 자동 계산됨 (수정 가능)
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <div className="form-group-v2">
                <label>모집 인원</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 1)}
                  className="modern-input"
                  min="1"
                  max="100"
                />
              </div>

              <div className="form-row-v2">
                <div className="form-group-v2">
                  <label>모집 마감일</label>
                  <DatePickerCustom
                    value={formData.recruitDeadline}
                    onChange={(value) => handleInputChange('recruitDeadline', value)}
                    placeholder="모집 마감일 선택"
                  />
                </div>

                <div className="form-group-v2">
                  <label>마감 시간</label>
                  <TimePickerCustom
                    value={formData.recruitDeadlineTime}
                    onChange={(value) => handleInputChange('recruitDeadlineTime', value)}
                    placeholder="23:59"
                  />
                </div>
              </div>

              <div className="info-box">
                <h4>💡 제안 프로세스</h4>
                <ol>
                  <li>제안서를 작성하여 제출합니다.</li>
                  <li>관리자가 제안을 검토합니다. (1-3일 소요)</li>
                  <li>승인되면 이메일로 안내드립니다.</li>
                  <li>스터디 페이지에 공개되어 모집이 시작됩니다.</li>
                </ol>
              </div>
            </div>
          )}

          <div className="form-actions-v2">
            {currentStep > 0 && (
              <button 
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="btn-secondary"
              >
                이전
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button 
                type="button"
                onClick={() => {
                  if (validateStep(currentStep)) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    warning('필수 항목을 모두 입력해주세요.');
                  }
                }}
                className="btn-primary"
              >
                다음
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? '제출 중...' : '제안하기'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyProposalPageV2;