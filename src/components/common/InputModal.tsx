import React, { useState, useEffect, useRef } from 'react';
import './InputModal.css';

interface InputModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  submitButtonText?: string;
  cancelButtonText?: string;
  submitButtonClass?: string;
  maxLength?: number;
  required?: boolean;
  multiline?: boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

function InputModal({
  isOpen,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  submitButtonText = '확인',
  cancelButtonText = '취소',
  submitButtonClass = 'study-management-input-modal-submit-button-primary',
  maxLength,
  required = true,
  multiline = false,
  onSubmit,
  onCancel
}: InputModalProps): React.ReactNode {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      setError('');
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedValue = inputValue.trim();
    
    if (required && !trimmedValue) {
      setError('입력값을 입력해주세요.');
      return;
    }
    
    if (maxLength && trimmedValue.length > maxLength) {
      setError(`최대 ${maxLength}자까지 입력 가능합니다.`);
      return;
    }
    
    onSubmit(trimmedValue);
    setInputValue('');
    setError('');
  };

  const handleCancel = () => {
    setInputValue('');
    setError('');
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="study-management-input-modal-overlay" onClick={handleCancel}>
      <div 
        className="study-management-input-modal-container" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="study-management-input-modal-header">
          <h3 className="study-management-input-modal-title">{title}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="study-management-input-modal-form">
          <p className="study-management-input-modal-message">{message}</p>
          
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className="study-management-input-modal-textarea"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              rows={4}
              autoFocus
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              className="study-management-input-modal-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              maxLength={maxLength}
              autoFocus
            />
          )}
          
          {maxLength && (
            <div className="study-management-input-modal-char-count">
              {inputValue.length} / {maxLength}
            </div>
          )}
          
          {error && (
            <div className="study-management-input-modal-error">
              {error}
            </div>
          )}
          
          <div className="study-management-input-modal-actions">
            <button
              type="button"
              className="study-management-input-modal-cancel-button"
              onClick={handleCancel}
            >
              {cancelButtonText}
            </button>
            <button
              type="submit"
              className={`study-management-input-modal-submit-button ${submitButtonClass}`}
            >
              {submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InputModal;