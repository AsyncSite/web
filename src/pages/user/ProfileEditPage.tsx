import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import StarBackground from '../../components/common/StarBackground';
import RichTextEditor from '../../components/common/RichTextEditor';
import './ProfileEditPage.css';
import notiService from "../../api/notiService";

interface ProfileFormData {
  name: string;
  role: string;
  quote: string;
  bio: string;
  profileImage: string;
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
    studyUpdates: false,
    marketing: false,
    emailEnabled: false,
    discordEnabled: false,
    pushEnabled: false
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      // Set initial form data from user profile
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        role: user.role || '',
        quote: user.quote || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
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
      await updateProfile({
        name: formData.name,
        role: formData.role || undefined,
        quote: formData.quote || undefined,
        bio: formData.bio || undefined,
        profileImage: formData.profileImage || undefined
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
          <h1>프로필 수정</h1>
          <p>나의 정보를 수정해보세요</p>
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
              maxLength={2000}
              disabled={isSubmitting}
            />
            {errors.bio && (
              <span className="error-message auth-error-message">
                {errors.bio}
              </span>
            )}
          </div>

          <div className="form-group auth-form-group">
            <label htmlFor="profileImage" className="auth-label">
              프로필 이미지 URL <span className="optional">(선택)</span>
            </label>
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
            {errors.profileImage && (
              <span className="error-message auth-error-message">
                {errors.profileImage}
              </span>
            )}
          </div>

          <div className="profile-preview">
            <p className="preview-label">프로필 미리보기</p>
            <div className="preview-content">
              <div className="preview-image">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="프로필 미리보기" />
                ) : (
                  <div className="preview-placeholder">
                    {formData.name ? formData.name[0] : user?.name?.[0] || 'U'}
                  </div>
                )}
              </div>
              <div className="preview-info">
                <p className="preview-name">{formData.name || user?.name || '이름'}</p>
                <p className="preview-role">{formData.role || user?.role || ''}</p>
                <p className="preview-email">{user?.email}</p>
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