import React from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function EmptyState({ 
  icon = '📭', 
  title, 
  description, 
  actionButton,
  className = ''
}: EmptyStateProps): React.ReactNode {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && (
        <p className="empty-state-description">{description}</p>
      )}
      {actionButton && (
        <button 
          className="empty-state-button"
          onClick={actionButton.onClick}
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;