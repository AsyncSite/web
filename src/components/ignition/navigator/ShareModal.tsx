import React, { useState } from 'react';
import { JobItemResponse } from '../../../api/jobNavigatorService';
import './ShareModal.css';

interface ShareModalProps {
  job: JobItemResponse;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ job, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/ignition/navigator?jobId=${job.id}`;
  const shareText = `${job.company}에서 ${job.title} 포지션을 채용중입니다!`;
  const shareHashtags = ['채용', '개발자채용', job.company.replace(/\s+/g, '')];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleKakaoShare = () => {
    if (window.Kakao) {
      // Kakao SDK가 초기화되지 않았다면 먼저 초기화
      if (!window.Kakao.isInitialized()) {
        // 개발 환경에서는 콘솔 경고만 표시
        console.warn('Kakao SDK is not initialized. Please add your Kakao App Key in index.tsx');
        alert('카카오톡 공유 기능이 아직 설정되지 않았습니다.\n개발팀에 문의해주세요.');
        return;
      }
      
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title: `${job.company} - ${job.title}`,
            description: job.description?.substring(0, 100) + '...' || shareText,
            imageUrl: 'https://asyncsite.com/og-image.png', // 실제 OG 이미지 URL로 변경 필요
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
          buttons: [
            {
              title: '채용공고 보기',
              link: {
                mobileWebUrl: shareUrl,
                webUrl: shareUrl,
              },
            },
          ],
        });
      } catch (error) {
        console.error('Kakao share error:', error);
        alert('카카오톡 공유 중 오류가 발생했습니다.');
      }
    } else {
      // Kakao SDK가 로드되지 않은 경우
      alert('카카오톡 공유 기능을 사용할 수 없습니다.\n페이지를 새로고침 후 다시 시도해주세요.');
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${shareHashtags.join(',')}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleEmailShare = () => {
    const subject = `[채용정보] ${job.company} - ${job.title}`;
    const body = `안녕하세요,\n\n${job.company}에서 ${job.title} 포지션을 채용중입니다.\n\n자세한 내용은 아래 링크에서 확인하세요:\n${shareUrl}\n\n감사합니다.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const shareOptions = [
    {
      id: 'copy',
      name: 'URL 복사',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      ),
      action: handleCopyLink,
      color: '#666666'
    },
    {
      id: 'kakao',
      name: '카카오톡',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C6.477 3 2 6.584 2 10.938c0 2.797 1.844 5.25 4.621 6.65l-.895 3.27a.347.347 0 00.525.409l3.684-2.435c.343.047.696.073 1.065.073 5.523 0 10-3.584 10-7.969S17.523 3 12 3z"/>
        </svg>
      ),
      action: handleKakaoShare,
      color: '#FEE500'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      action: handleTwitterShare,
      color: '#000000'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      action: handleLinkedInShare,
      color: '#0A66C2'
    },
    {
      id: 'email',
      name: '이메일',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
      action: handleEmailShare,
      color: '#EA4335'
    }
  ];

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h2>채용공고 공유하기</h2>
          <button className="share-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="share-modal-body">
          <div className="share-preview">
            <div className="share-preview-company">{job.company}</div>
            <div className="share-preview-title">{job.title}</div>
            <div className="share-preview-meta">
              {job.experience} · {job.location}
            </div>
          </div>

          <div className="share-options">
            {shareOptions.map(option => (
              <button
                key={option.id}
                className={`share-option ${option.id === 'copy' && copied ? 'copied' : ''}`}
                onClick={option.action}
                style={{ '--share-color': option.color } as React.CSSProperties}
              >
                <div className="share-option-icon">{option.icon}</div>
                <div className="share-option-name">
                  {option.id === 'copy' && copied ? '복사됨!' : option.name}
                </div>
              </button>
            ))}
          </div>

          <div className="share-url-section">
            <label className="share-url-label">공유 링크</label>
            <div className="share-url-input-group">
              <input
                type="text"
                className="share-url-input"
                value={shareUrl}
                readOnly
                onClick={(e) => e.currentTarget.select()}
              />
              <button 
                className="share-url-copy-btn"
                onClick={handleCopyLink}
                title="링크 복사"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;