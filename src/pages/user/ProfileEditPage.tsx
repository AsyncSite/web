import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/layout/Header';
import StarBackground from '../../components/common/StarBackground';
import './ProfileEditPage.css';
import notiService from "../../api/notiService";

interface ProfileFormData {
  name: string;
  profileImage: string;
  studyUpdates: boolean;
  marketing: boolean;
  emailEnabled: boolean;
  discordEnabled: boolean;
  pushEnabled: boolean;
}

interface ProfileFormErrors {
  name?: string;
  profileImage?: string;
  general?: string;
}

function ProfileEditPage(): React.ReactNode {
  const { user, updateProfile, isAuthenticated, isLoading } = useAuth();
  const { getNotiSetting, updateNotiSetting } = notiService;
  const navigate = useNavigate();
  
  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
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
      let formdata = {
        name: user.name || '',
        profileImage: user.profileImage || '',
        studyUpdates: false,
        marketing: false,
        emailEnabled: false,
        discordEnabled: false,
        pushEnabled: false
      };
      getNotiSetting(user.id)
          .then(notiSetting => {
            formdata = {
              ...formdata,
              studyUpdates: notiSetting.studyUpdates,
              marketing: notiSetting.marketing,
              emailEnabled: notiSetting.emailEnabled,
              discordEnabled: notiSetting.discordEnabled,
              pushEnabled: notiSetting.pushEnabled
            }
          });
      setFormData(formdata);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await updateProfile({
        name: formData.name,
        profileImage: formData.profileImage || undefined
      });

      // 알림 설정 업데이트
      if (user) {
        await updateNotiSetting(user.id, {
          studyUpdates: formData.studyUpdates,
          marketing: formData.marketing,
          emailEnabled: formData.emailEnabled,
          discordEnabled: formData.discordEnabled,
          pushEnabled: formData.pushEnabled
        });
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