import React, { useState, useEffect } from 'react';
import { LeaderIntroData, defaultLeaderIntroData } from '../../types/leaderIntroTypes';
import { RichTextData } from '../../../common/richtext/RichTextTypes';
import { RichTextConverter } from '../../../common/richtext/RichTextConverter';
import StudyDetailRichTextEditor from '../../../common/richtext/StudyDetailRichTextEditor';
import studyService from '../../../../api/studyService';
import { algorithmTemplate, mogakupTemplate, bookStudyTemplate, systemDesignTemplate } from '../templateData';
import TemplateSelector from './TemplateSelector';
import './LeaderIntroSectionForm.css';

interface LeaderIntroSectionFormProps {
  initialData?: LeaderIntroData;
  studyId?: string;
  currentUser?: any;  // 로그인한 사용자 정보
  onSave: (data: LeaderIntroData) => void;
  onCancel: () => void;
}

const LeaderIntroSectionForm: React.FC<LeaderIntroSectionFormProps> = ({
  initialData,
  studyId,
  currentUser,
  onSave,
  onCancel
}) => {
  // 기본 정보 - currentUser가 있으면 자동으로 설정
  const [name, setName] = useState(
    initialData?.name || currentUser?.name || currentUser?.username || ''
  );
  const [profileImage, setProfileImage] = useState(
    initialData?.profileImage || currentUser?.profileImage || ''
  );
  const [role, setRole] = useState(initialData?.role || '');
  
  // 소개 콘텐츠
  const [introduction, setIntroduction] = useState<RichTextData>(
    initialData?.introduction || RichTextConverter.fromHTML('')
  );
  const [motivation, setMotivation] = useState<RichTextData>(
    initialData?.motivation || RichTextConverter.fromHTML('')
  );
  const [philosophy, setPhilosophy] = useState<RichTextData>(
    initialData?.philosophy || RichTextConverter.fromHTML('')
  );
  const [welcomeMessage, setWelcomeMessage] = useState<RichTextData>(
    initialData?.welcomeMessage || RichTextConverter.fromHTML('')
  );
  
  // 신뢰 지표
  const [since, setSince] = useState(initialData?.experience?.since || '');
  const [totalStudies, setTotalStudies] = useState(initialData?.experience?.totalStudies || 0);
  const [totalMembers, setTotalMembers] = useState(initialData?.experience?.totalMembers || 0);
  const [achievements, setAchievements] = useState<string[]>(
    initialData?.experience?.achievements || []
  );
  
  // 전문성/배경
  const [career, setCareer] = useState<string[]>(initialData?.background?.career || []);
  const [education, setEducation] = useState<string[]>(initialData?.background?.education || []);
  const [expertise, setExpertise] = useState<Array<{ id: string; value: string }>>(
    initialData?.background?.expertise?.slice(0, 3).map((e: string, i: number) => ({
      id: `expertise-${Date.now()}-${i}`,
      value: e
    })) || []
  );
  
  // 연락처/링크
  const [email, setEmail] = useState(initialData?.links?.email || '');
  const [github, setGithub] = useState(initialData?.links?.github || '');
  const [linkedin, setLinkedin] = useState(initialData?.links?.linkedin || '');
  const [blog, setBlog] = useState(initialData?.links?.blog || '');
  
  // UI 상태
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showContactButton, setShowContactButton] = useState(
    initialData?.showContactButton ?? true
  );
  const [contactButtonText, setContactButtonText] = useState(
    initialData?.contactButtonText || '리더와 커피챗 ☕'
  );
  
  // 섹션 헤더
  const [tagHeader, setTagHeader] = useState(
    initialData?.tagHeader || '스터디를 이끄는 사람'
  );
  const [title, setTitle] = useState<RichTextData>(
    initialData?.title || RichTextConverter.fromHTML('')
  );
  const [subtitle, setSubtitle] = useState<RichTextData>(
    initialData?.subtitle || RichTextConverter.fromHTML('')
  );
  
  // 스터디 정보에서 리더 정보 가져오기
  useEffect(() => {
    const fetchStudyLeaderInfo = async () => {
      if (!studyId || initialData?.name) return;
      
      try {
        const study = await studyService.getStudyById(studyId);
        if (study?.leader) {
          setName(study.leader.name);
          setProfileImage(study.leader.profileImage || '');
        }
      } catch (error) {
        console.error('Failed to fetch study leader info:', error);
      }
    };
    
    fetchStudyLeaderInfo();
  }, [studyId, initialData]);
  
  // 예시 데이터 로드 - templateData에서 가져오기
  const loadExampleData = (templateType: string) => {
    if (!templateType) return;

    let leaderData;
    if (templateType === 'algorithm') {
      leaderData = algorithmTemplate.sections.leaderIntro;
    } else if (templateType === 'mogakup') {
      leaderData = mogakupTemplate.sections.leaderIntro;
    } else if (templateType === 'bookStudy') {
      leaderData = bookStudyTemplate.sections.leaderIntro;
    } else if (templateType === 'systemDesign') {
      leaderData = systemDesignTemplate.sections.leaderIntro;
    } else {
      return;
    }

    if (!leaderData) return;

    // currentUser가 있으면 name과 profileImage는 유지 (자동 연동된 값)
    if (!currentUser) {
      setName(leaderData.name);
      setProfileImage(leaderData.profileImage);
    }
    setRole(leaderData.role);

    setMotivation(RichTextConverter.fromHTML(leaderData.motivation));
    setPhilosophy(RichTextConverter.fromHTML(leaderData.philosophy));
    setWelcomeMessage(RichTextConverter.fromHTML(leaderData.welcomeMessage));

    setExpertise(leaderData.expertise.map((e: string, i: number) => ({
      id: `expertise-${Date.now()}-${i}`,
      value: e
    })));

    setSince(leaderData.since);
    setTotalStudies(leaderData.totalStudies);
    setTotalMembers(leaderData.totalMembers);

    setEmail(leaderData.email);
    setGithub(leaderData.github);
    setBlog(leaderData.blog);
  };

  // Clear form and reset to initial state
  const handleClearTemplate = () => {
    // Reset all form fields to initial state
    // currentUser가 있으면 name과 profileImage는 currentUser 정보로 유지
    setName(initialData?.name || currentUser?.name || currentUser?.username || '');
    setProfileImage(initialData?.profileImage || currentUser?.profileImage || '');
    setRole(initialData?.role || '');
    setIntroduction(initialData?.introduction || RichTextConverter.fromHTML(''));
    setMotivation(initialData?.motivation || RichTextConverter.fromHTML(''));
    setPhilosophy(initialData?.philosophy || RichTextConverter.fromHTML(''));
    setWelcomeMessage(initialData?.welcomeMessage || RichTextConverter.fromHTML(''));
    setSince(initialData?.experience?.since || '');
    setTotalStudies(initialData?.experience?.totalStudies || 0);
    setTotalMembers(initialData?.experience?.totalMembers || 0);
    setAchievements(initialData?.experience?.achievements || []);
    setCareer(initialData?.background?.career || []);
    setEducation(initialData?.background?.education || []);
    setExpertise(initialData?.background?.expertise?.map((e: string, i: number) => ({
      id: `expertise-${Date.now()}-${i}`,
      value: e
    })) || []);
    setEmail(initialData?.links?.email || '');
    setGithub(initialData?.links?.github || '');
    setLinkedin(initialData?.links?.linkedin || '');
    setBlog(initialData?.links?.blog || '');
  };
  
  // 키워드 관리
  const updateKeyword = (index: number, value: string) => {
    const updated = [...expertise];
    updated[index] = { ...updated[index], value };
    setExpertise(updated);
  };

  const addKeyword = () => {
    if (expertise.length < 3) {
      setExpertise([...expertise, { id: `expertise-${Date.now()}`, value: '' }]);
    }
  };

  const removeKeyword = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index));
  };
  
  // 배열 항목 관리
  const addArrayItem = (
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArray([...array, '']);
  };
  
  const removeArrayItem = (
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number
  ) => {
    setArray(array.filter((_, i) => i !== index));
  };
  
  const updateArrayItem = (
    array: string[], 
    setArray: React.Dispatch<React.SetStateAction<string[]>>, 
    index: number, 
    value: string
  ) => {
    const updated = [...array];
    updated[index] = value;
    setArray(updated);
  };
  
  // 폼 제출
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: LeaderIntroData = {
      name,
      profileImage: profileImage || undefined,
      role: role || undefined,
      introduction: introduction.content.length > 0 ? introduction : undefined,
      motivation: motivation.content.length > 0 ? motivation : undefined,
      philosophy: philosophy.content.length > 0 ? philosophy : undefined,
      welcomeMessage: welcomeMessage.content.length > 0 ? welcomeMessage : undefined,
      experience: (since || totalStudies || totalMembers || achievements.length > 0) ? {
        since: since || undefined,
        totalStudies: totalStudies || undefined,
        totalMembers: totalMembers || undefined,
        achievements: achievements.filter(a => a.trim()).length > 0 ? achievements.filter(a => a.trim()) : undefined
      } : undefined,
      background: (career.length > 0 || education.length > 0 || expertise.length > 0) ? {
        career: career.filter(c => c.trim()).length > 0 ? career.filter(c => c.trim()) : undefined,
        education: education.filter(e => e.trim()).length > 0 ? education.filter(e => e.trim()) : undefined,
        expertise: expertise.filter(e => e.value.trim()).length > 0 ? expertise.map(e => e.value).filter(v => v.trim()) : undefined
      } : undefined,
      links: (email || github || linkedin || blog) ? {
        email: email || undefined,
        github: github || undefined,
        linkedin: linkedin || undefined,
        blog: blog || undefined
      } : undefined,
      layout: 'split', // 항상 기본 레이아웃 사용
      showContactButton,
      contactButtonText: contactButtonText || undefined,
      tagHeader: tagHeader || undefined,
      title: title.content.length > 0 ? title : undefined,
      subtitle: subtitle.content.length > 0 ? subtitle : undefined
    };
    
    onSave(data);
  };
  
  return (
    <form onSubmit={handleSubmit} className="leader-intro-form">
      {/* 헤더 */}
      <div className="leader-intro-form-header">
        <h3>🌟 리더 소개 - 미니멀 감성 프로필</h3>
      </div>

      <TemplateSelector
        onTemplateSelect={loadExampleData}
        onClear={handleClearTemplate}
      />
      
      {/* 안내 메시지 */}
      <div className="leader-intro-form-notice">
        💡 이력서가 아닌, <strong>사람</strong>을 소개해주세요. 따뜻하고 친근한 톤으로 작성하면 좋아요.
      </div>
      
      {/* 핵심 정보 섹션 */}
      <div className="leader-intro-form-section leader-intro-core-section">
        <h4>🎯 핵심 정보</h4>
        
        <div className="leader-intro-form-row">
          <div className="leader-intro-form-group">
            <label>이름 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="리더 이름"
              className="leader-intro-input"
              required
              disabled={!!currentUser}
              style={currentUser ? {
                backgroundColor: '#f5f5f5',
                cursor: 'not-allowed',
                opacity: 0.7
              } : {}}
            />
            {currentUser && (
              <span className="leader-intro-help" style={{ color: '#89DDFF' }}>
                💡 로그인한 사용자의 이름이 자동으로 설정됩니다
              </span>
            )}
          </div>
        </div>

        {currentUser && (
          <div className="leader-intro-form-group">
            <div style={{
              padding: '12px',
              backgroundColor: 'rgba(137, 221, 255, 0.1)',
              borderLeft: '3px solid #89DDFF',
              borderRadius: '4px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, color: '#89DDFF', fontSize: '14px' }}>
                📸 프로필 이미지는 마이 페이지에서만 변경할 수 있습니다
              </p>
            </div>
          </div>
        )}
        
        <div className="leader-intro-form-group">
          <label>💬 한 줄 철학</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="예: 실패를 두려워하지 않는 10년차 개발자"
            className="leader-intro-input leader-intro-tagline"
          />
          <span className="leader-intro-help">리더님을 한 문장으로 표현해주세요</span>
        </div>
        
        <div className="leader-intro-form-group">
          <label>🏷️ 키워드 (최대 3개)</label>
          <div className="leader-intro-keywords">
            {expertise.map((item, index) => (
              <div key={item.id} className="leader-intro-keyword-item">
                <span className="leader-intro-keyword-prefix">#</span>
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => updateKeyword(index, e.target.value)}
                  placeholder="키워드"
                  className="leader-intro-keyword-input"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={() => removeKeyword(index)}
                  className="leader-intro-keyword-remove"
                >
                  ×
                </button>
              </div>
            ))}
            {expertise.length < 3 && (
              <button
                type="button"
                onClick={addKeyword}
                className="leader-intro-add-keyword-btn"
              >
                + 키워드 추가
              </button>
            )}
          </div>
          <span className="leader-intro-help">리더님을 대표하는 키워드 3개</span>
        </div>
      </div>
      
      {/* 미니 스토리 섹션 */}
      <div className="leader-intro-form-section">
        <h4>📖 미니 스토리 (Q&A로 표시됩니다)</h4>
        
        <div className="leader-intro-form-group">
          <label>Q. 왜 이 스터디를 시작했나요?</label>
          <StudyDetailRichTextEditor
            value={motivation}
            onChange={setMotivation}
            placeholder="스터디를 시작하게 된 개인적인 이야기를 들려주세요"
            toolbar={['bold', 'italic', 'break']}
            maxLength={300}
          />
        </div>
        
        <div className="leader-intro-form-group">
          <label>Q. 어떤 스터디를 만들고 싶나요?</label>
          <StudyDetailRichTextEditor
            value={philosophy}
            onChange={setPhilosophy}
            placeholder="스터디 운영 철학이나 지향점을 공유해주세요"
            toolbar={['bold', 'italic', 'break']}
            maxLength={300}
          />
        </div>
        
        <div className="leader-intro-form-group">
          <label>Q. 리더님은 어떤 개발자인가요?</label>
          <StudyDetailRichTextEditor
            value={introduction}
            onChange={setIntroduction}
            placeholder="본인에 대한 짧은 소개 (선택사항)"
            toolbar={['bold', 'italic', 'break']}
            maxLength={300}
          />
        </div>
      </div>
      
      {/* 환영 메시지 */}
      <div className="leader-intro-form-section">
        <h4>💝 따뜻한 환영 메시지</h4>
        <div className="leader-intro-form-group">
          <StudyDetailRichTextEditor
            value={welcomeMessage}
            onChange={setWelcomeMessage}
            placeholder="새로운 멤버들에게 전하는 따뜻한 한 마디"
            toolbar={['bold', 'italic', 'break', 'emoji']}
            maxLength={200}
          />
          <span className="leader-intro-help">편안하고 친근한 톤으로 작성해주세요</span>
        </div>
      </div>
      
      {/* 연락 설정 */}
      <div className="leader-intro-form-section">
        <h4>☕ 연락 설정</h4>
        <div className="leader-intro-form-group">
          <label>
            <input
              type="checkbox"
              checked={showContactButton}
              onChange={(e) => setShowContactButton(e.target.checked)}
              className="leader-intro-checkbox"
            />
            연락 버튼 표시
          </label>
        </div>
        {showContactButton && (
          <>
            <div className="leader-intro-form-row">
              <div className="leader-intro-form-group">
                <label>버튼 텍스트</label>
                <input
                  type="text"
                  value={contactButtonText}
                  onChange={(e) => setContactButtonText(e.target.value)}
                  placeholder="리더와 커피챗 ☕"
                  className="leader-intro-input"
                />
              </div>
              <div className="leader-intro-form-group">
                <label>이메일 (선택)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leader@example.com"
                  className="leader-intro-input"
                />
              </div>
            </div>
            <div className="leader-intro-form-row">
              <div className="leader-intro-form-group">
                <label>GitHub (선택)</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="leader-intro-input"
                />
              </div>
              <div className="leader-intro-form-group">
                <label>블로그 (선택)</label>
                <input
                  type="text"
                  value={blog}
                  onChange={(e) => setBlog(e.target.value)}
                  placeholder="https://blog.example.com"
                  className="leader-intro-input"
                />
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 추가 옵션 (접기/펼치기) */}
      <div className="leader-intro-form-section">
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="leader-intro-toggle-btn"
        >
          {showAdvancedOptions ? '➖' : '➕'} 추가 옵션 (선택사항)
        </button>
        
        {showAdvancedOptions && (
          <>
            {/* 섹션 헤더 설정 */}
            <div className="leader-intro-subsection">
              <h5>섹션 헤더</h5>
              <div className="leader-intro-form-group">
                <label>태그 헤더</label>
                <input
                  type="text"
                  value={tagHeader}
                  onChange={(e) => setTagHeader(e.target.value)}
                  placeholder="예: 스터디를 이끄는 사람"
                  className="leader-intro-input"
                />
              </div>
            </div>
            
            {/* 운영 경험 */}
            <div className="leader-intro-subsection">
              <h5>운영 경험</h5>
              <div className="leader-intro-form-row">
                <div className="leader-intro-form-group">
                  <label>활동 시작</label>
                  <input
                    type="text"
                    value={since}
                    onChange={(e) => setSince(e.target.value)}
                    placeholder="예: 2022년 1월부터"
                    className="leader-intro-input"
                  />
                </div>
                <div className="leader-intro-form-group">
                  <label>운영 스터디 수</label>
                  <input
                    type="number"
                    value={totalStudies || ''}
                    onChange={(e) => setTotalStudies(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="leader-intro-input"
                    min="0"
                  />
                </div>
                <div className="leader-intro-form-group">
                  <label>함께한 멤버 수</label>
                  <input
                    type="number"
                    value={totalMembers || ''}
                    onChange={(e) => setTotalMembers(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="leader-intro-input"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            {/* 경력/학력 (매우 선택적) */}
            <div className="leader-intro-subsection">
              <h5>경력/학력 (이력서 스타일 - 권장하지 않음)</h5>
              <p className="leader-intro-warning">
                ⚠️ 경력과 학력은 신뢰를 주지만, 너무 형식적일 수 있어요. 꼭 필요한 경우만 추가해주세요.
              </p>
              
              <div className="leader-intro-form-group">
                <label>경력 사항</label>
                {career.map((item, index) => (
                  <div key={`career-${index}-${item.substring(0, 10) || 'empty'}`} className="leader-intro-array-item">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem(career, setCareer, index, e.target.value)}
                      placeholder="예: 현) 테크기업 시니어 개발자"
                      className="leader-intro-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(career, setCareer, index)}
                      className="leader-intro-remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(career, setCareer)}
                  className="leader-intro-add-btn"
                >
                  + 경력 추가
                </button>
              </div>
              
              <div className="leader-intro-form-group">
                <label>학력/자격증</label>
                {education.map((item, index) => (
                  <div key={`education-${index}-${item.substring(0, 10) || 'empty'}`} className="leader-intro-array-item">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem(education, setEducation, index, e.target.value)}
                      placeholder="예: 컴퓨터공학 학사"
                      className="leader-intro-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(education, setEducation, index)}
                      className="leader-intro-remove-btn"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem(education, setEducation)}
                  className="leader-intro-add-btn"
                >
                  + 학력/자격증 추가
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* 액션 버튼 */}
      <div className="leader-intro-form-actions">
        <button type="button" onClick={onCancel} className="leader-intro-cancel-btn">
          취소
        </button>
        <button type="submit" className="leader-intro-save-btn">
          저장하기
        </button>
      </div>
    </form>
  );
};

export default LeaderIntroSectionForm;