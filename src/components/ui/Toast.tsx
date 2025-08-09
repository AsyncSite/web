import React, { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(message.id);
    }, message.duration || 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${message.type}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{message.message}</span>
      <button className="toast-close" onClick={() => onClose(message.id)}>
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onClose }) => {
  return (
    <div className="toast-container">
      {messages.map((message) => (
        <Toast key={message.id} message={message} onClose={onClose} />
      ))}
    </div>
  );
};

// Toast hook
export const useToast = () => {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], message: string, duration?: number) => {
    const id = Date.now().toString();
    const newMessage: ToastMessage = { id, type, message, duration };
    setMessages((prev) => [...prev, newMessage]);
  };

  const removeToast = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return {
    messages,
    showToast,
    removeToast,
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
  };
};