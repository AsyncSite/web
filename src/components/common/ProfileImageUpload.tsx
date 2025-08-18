import React, { useState, useRef } from 'react';
import { validateImageFile } from '../../api/assetService';
import './ProfileImageUpload.css';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onFileSelected?: (file: File | null) => void;  // New: Pass File object to parent
  disabled?: boolean;
}

function ProfileImageUpload({
  currentImageUrl,
  onImageUploaded,
  onFileSelected,
  disabled = false
}: ProfileImageUploadProps): React.ReactNode {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '파일 검증 실패');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      // Pass the File object to parent component
      if (onFileSelected) {
        onFileSelected(file);
      }
    };
    reader.readAsDataURL(file);

    // Remove automatic upload - now handled by parent on save
    // uploadFile(file);
  };

  // uploadFile function removed - upload is now handled by parent component on save

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (onFileSelected) {
      onFileSelected(null);  // Clear the File object in parent
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="profile-image-upload">
      <div
        className={`upload-container ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={handleFileInputChange}
          disabled={disabled || isUploading}
          style={{ display: 'none' }}
        />

        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="프로필 이미지 미리보기" className="preview-image" />
            {isUploading && (
              <div className="upload-overlay">
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              </div>
            )}
            {!isUploading && !disabled && (
              <div className="image-actions">
                <button
                  type="button"
                  className="change-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                  }}
                >
                  변경
                </button>
                <button
                  type="button"
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  제거
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="upload-text">
              {isUploading ? (
                <>
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="progress-text">업로드 중... {uploadProgress}%</span>
                  </div>
                </>
              ) : (
                <>
                  <p className="upload-main-text">
                    클릭하거나 이미지를 드래그하여 업로드
                  </p>
                  <p className="upload-sub-text">
                    JPEG, PNG, GIF, WebP (최대 10MB)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="upload-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ProfileImageUpload;