import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import StarBackground from '../../components/common/StarBackground';
import RichTextEditor from '../../components/common/RichTextEditor';
import ProfileImageUpload from '../../components/common/ProfileImageUpload';
import './ProfileEditPage.css';
import notiService from "../../api/notiService";
import { uploadProfileImage } from '../../api/assetService';

interface ProfileFormData {
  name: string;
  role: string;
  quote: string;
  bio: string;
  profileImage: string;
  githubUrl: string;
  blogUrl: string;
  linkedinUrl: string;
  studyUpdates: boolean;
  marketing: boolean;
  emailEnabled: boolean;
  discordEnabled: boolean;
  pushEnabled: boolean;
}

interface ProfileFormErrors {
  name?: string;
  role?: string;
  quote?: string;
  bio?: string;
  profileImage?: string;
  general?: string;
}

function ProfileEditPage(): React.ReactNode {
  const { user, updateProfile, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    role: '',
    quote: '',
    bio: '',
    profileImage: '',
    githubUrl: '',
    blogUrl: '',
    linkedinUrl: '',
    studyUpdates: false,
    marketing: false,
    emailEnabled: false,
    discordEnabled: false,
    pushEnabled: false
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fromOnboarding, setFromOnboarding] = useState(false);
  const [imageUploadMode, setImageUploadMode] = useState<'upload' | 'url'>('upload');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  

  // Check if coming from onboarding
  useEffect(() => {
    if (location.state?.fromOnboarding) {
      setFromOnboarding(true);
    }
  }, [location]);

  useEffect(() => {
    if (user) {
      // Set initial form data from user profile
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        role: user.role || '',
        quote: user.quote || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
        githubUrl: user.githubUrl || '',
        blogUrl: user.blogUrl || '',
        linkedinUrl: user.linkedinUrl || ''
      }));
      
      // Load notification settings separately
      notiService.getNotiSetting(user.id)
          .then(notiSetting => {
            setFormData(prev => ({
              ...prev,
              studyUpdates: notiSetting.studyUpdates,
              marketing: notiSetting.marketing,
              emailEnabled: notiSetting.emailEnabled,
              discordEnabled: notiSetting.discordEnabled,
              pushEnabled: notiSetting.pushEnabled
            }));
          })
          .catch(error => {
            // Notification settings not available or error - continue without them
            // Silently handle error to prevent UI issues
          });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (formData.name.length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다';
    } else if (formData.name.length > 50) {
      newErrors.name = '이름은 50자 이하여야 합니다';
    }

    // Role validation (optional field)
    if (formData.role && formData.role.length > 100) {
      newErrors.role = '역할/직책은 100자 이하여야 합니다';
    }

    // Quote validation (optional field)
    if (formData.quote && formData.quote.length > 255) {
      newErrors.quote = '인용구는 255자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error when user starts typing
    if (errors[name as keyof ProfileFormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBioChange = (html: string) => {
    setFormData(prev => ({ ...prev, bio: html }));
    // Clear bio error when user starts typing
    if (errors.bio) {
      setErrors(prev => ({ ...prev, bio: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      let finalProfileImageUrl = formData.profileImage;
      
      // Upload profile image if a new file was selected
      if (selectedImageFile && user?.email) {
        try {
          const uploadResult = await uploadProfileImage(selectedImageFile, user.email);
          finalProfileImageUrl = uploadResult.publicUrl;
        } catch (uploadError) {
          setErrors({
            profileImage: uploadError instanceof Error ? uploadError.message : '이미지 업로드 실패'
          });
          setIsSubmitting(false);
          return;
        }
      }

      await updateProfile({
        name: formData.name,
        role: formData.role,
        quote: formData.quote,
        bio: formData.bio,
        profileImage: finalProfileImageUrl, // Use the uploaded URL or existing URL
        githubUrl: formData.githubUrl,
        blogUrl: formData.blogUrl,
        linkedinUrl: formData.linkedinUrl
      });

      // 알림 설정 업데이트
      if (user) {
        try {
          await notiService.updateNotiSetting(user.id, {
            studyUpdates: formData.studyUpdates,
            marketing: formData.marketing,
            emailEnabled: formData.emailEnabled,
            discordEnabled: formData.discordEnabled,
            pushEnabled: formData.pushEnabled
          });
        } catch (notiError) {
          // Continue with success even if notification settings fail
          // Silently handle error to prevent blocking profile update
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        navigate('/users/me');
      }, 1500);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : '프로필 수정에 실패했습니다'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  

  const handleCancel = () => {
    navigate('/users/me');
  };

  return (
    <div className="profile-edit-page auth-page">
      {/* 투명 헤더 */}
      <Header transparent />
      
      {/* 별 배경 효과 */}
      <StarBackground />
      
      <div className="profile-edit-container auth-container auth-fade-in">
        <div className="profile-edit-header">
          <h1>{fromOnboarding ? '프로필 완성하기' : '프로필 수정'}</h1>
          <p>{fromOnboarding ? '프로필을 완성하고 AsyncSite 커뮤니티에 참여해보세요!' : '나의 정보를 수정해보세요'}</p>
        </div>

        {errors.general && (
          <div className="error-message general-error auth-error-shake">
            {errors.general}
          </div>
        )}

        {isSuccess && (
          <div className="success-message general-success">
            프로필이 성공적으로 수정되었습니다!
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="form-group auth-form-group">
            <label htmlFor="name" className="auth-label">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`auth-input ${errors.name ? 'error' : ''}`}
              placeholder="이름을 입력하세요"
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="error-message auth-error-message">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="role" className="auth-label">
              역할/직책 <span className="optional">(선택)</span>
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`auth-input ${errors.role ? 'error' : ''}`}
              placeholder="예: Product Architect, System Engineer, Growth Hacker"
              maxLength={100}
              disabled={isSubmitting}
            />
            {errors.role && (
              <span className="error-message auth-error-message">
                {errors.role}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="quote" className="auth-label">
              인용구/좌우명 <span className="optional">(선택)</span>
            </label>
            <input
              type="text"
              id="quote"
              name="quote"
              value={formData.quote}
              onChange={handleChange}
              className={`auth-input ${errors.quote ? 'error' : ''}`}
              placeholder="예: 함께 성장하는 커뮤니티를 만들어갑니다"
              maxLength={255}
              disabled={isSubmitting}
            />
            {errors.quote && (
              <span className="error-message auth-error-message">
                {errors.quote}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="bio" className="auth-label">
              스토리 <span className="optional">(선택)</span>
            </label>
            <RichTextEditor
              value={formData.bio}
              onChange={handleBioChange}
              placeholder="당신의 이야기를 들려주세요... 어떤 여정을 걸어왔고, 무엇을 꿈꾸며, 어떤 가치를 추구하시나요?"
              maxLength={300}
              disabled={isSubmitting}
            />
            {errors.bio && (
              <span className="error-message auth-error-message">
                {errors.bio}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label className="auth-label">
              프로필 이미지 <span className="optional">(선택)</span>
            </label>
            
            {/* Image Upload Mode Selector */}
            <div className="image-mode-selector">
              <button
                type="button"
                className={`mode-tab ${imageUploadMode === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  setImageUploadMode('upload');
                  // Clear file when switching modes
                  if (imageUploadMode !== 'upload') {
                    setSelectedImageFile(null);
                  }
                }}
                disabled={isSubmitting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                파일 업로드
              </button>
              <button
                type="button"
                className={`mode-tab ${imageUploadMode === 'url' ? 'active' : ''}`}
                onClick={() => {
                  setImageUploadMode('url');
                  // Clear file when switching modes
                  setSelectedImageFile(null);
                }}
                disabled={isSubmitting}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                URL 입력
              </button>
            </div>
            
            {/* Image Upload/URL Input */}
            {imageUploadMode === 'upload' ? (
              <ProfileImageUpload
                currentImageUrl={formData.profileImage}
                onImageUploaded={(url) => {
                  setFormData(prev => ({ ...prev, profileImage: url }));
                  if (errors.profileImage) {
                    setErrors(prev => ({ ...prev, profileImage: undefined }));
                  }
                }}
                onFileSelected={(file) => {
                  setSelectedImageFile(file);
                }}
                disabled={isSubmitting}
              />
            ) : (
              <div className="url-input-container">
                <input
                  type="url"
                  id="profileImage"
                  name="profileImage"
                  value={formData.profileImage}
                  onChange={handleChange}
                  className={`auth-input ${errors.profileImage ? 'error' : ''}`}
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                />
                {formData.profileImage && (
                  <div className="url-preview">
                    <img 
                      src={formData.profileImage} 
                      alt="프로필 미리보기" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        setErrors(prev => ({ ...prev, profileImage: 'Invalid image URL' }));
                      }}
                      onLoad={(e) => {
                        (e.target as HTMLImageElement).style.display = 'block';
                        if (errors.profileImage === 'Invalid image URL') {
                          setErrors(prev => ({ ...prev, profileImage: undefined }));
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            
            {errors.profileImage && (
              <span className="error-message auth-error-message">
                {errors.profileImage}
              </span>
            )}
          </div>

          {/* SNS 링크 섹션 - 프로토타입 */}
          <div className="social-links-section">
            <h3 className="section-title">
              소셜 링크 <span className="optional">(선택)</span>
            </h3>
            <p className="section-description">
              WhoWeAre 페이지에서 표시될 링크입니다
            </p>
            
            <div className="social-links-grid">
              <div className="social-input-group">
                <label htmlFor="githubUrl" className="social-label">
                  <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  className="social-input"
                  placeholder="https://github.com/username"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="social-input-group">
                <label htmlFor="blogUrl" className="social-label">
                  <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  Blog
                </label>
                <input
                  type="url"
                  id="blogUrl"
                  name="blogUrl"
                  value={formData.blogUrl}
                  onChange={handleChange}
                  className="social-input"
                  placeholder="https://your-blog.com"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="social-input-group">
                <label htmlFor="linkedinUrl" className="social-label">
                  <svg className="social-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedinUrl"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  className="social-input"
                  placeholder="https://linkedin.com/in/username"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className="profile-preview">
            <p className="preview-label">프로필 정보 미리보기</p>
            <div className="preview-content">
              <div className="preview-info-full">
                <p className="preview-name">{formData.name || user?.name || '이름'}</p>
                <p className="preview-role">{formData.role || '역할/직책'}</p>
                <p className="preview-email">{user?.email}</p>
                {formData.quote && (
                  <p className="preview-quote">"{formData.quote}"</p>
                )}
              </div>
            </div>
          </div>

          {/* 알림 설정 섹션 */}
          <div className="notification-settings">
            <h3 className="settings-title">알림 설정</h3>
            
            <div className="notification-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="studyUpdates"
                  checked={formData.studyUpdates}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">학습 업데이트 알림</span>
              </label>
              <p className="option-description">새로운 학습 자료나 업데이트에 대한 알림을 받습니다</p>
            </div>

            <div className="notification-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="marketing"
                  checked={formData.marketing}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">마케팅 알림</span>
              </label>
              <p className="option-description">새로운 기능이나 이벤트에 대한 알림을 받습니다</p>
            </div>

            <div className="notification-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="emailEnabled"
                  checked={formData.emailEnabled}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">이메일 알림</span>
              </label>
              <p className="option-description">이메일을 통한 알림을 받습니다</p>
            </div>

            <div className="notification-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="discordEnabled"
                  checked={formData.discordEnabled}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Discord 알림</span>
              </label>
              <p className="option-description">Discord를 통한 알림을 받습니다</p>
            </div>

            <div className="notification-option">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="pushEnabled"
                  checked={formData.pushEnabled}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">푸시 알림</span>
              </label>
              <p className="option-description">브라우저 푸시 알림을 받습니다</p>
            </div>
          </div>

          <div className="button-group">
            <button
              type="button"
              onClick={handleCancel}
              className="cancel-button auth-button"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className={`save-button auth-button auth-button-primary ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting || isSuccess}
            >
              {isSubmitting ? '' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileEditPage;