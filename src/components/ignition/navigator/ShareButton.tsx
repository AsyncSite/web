import React, { useState } from 'react';
import { JobItemResponse } from '../../../api/jobNavigatorService';
import ShareModal from './ShareModal';
import './ShareButton.css';

interface ShareButtonProps {
  job: JobItemResponse;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ job, className = '' }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <button 
        className={`share-button ${className}`}
        onClick={() => setIsShareModalOpen(true)}
        title="공유하기"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        <span className="share-button-text">공유</span>
      </button>

      <ShareModal 
        job={job}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
};

export default ShareButton;