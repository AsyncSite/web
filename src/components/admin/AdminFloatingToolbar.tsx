import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminFloatingToolbar.css';

interface AdminFloatingToolbarProps {
  backofficeUrl?: string;
}

function AdminFloatingToolbar({ backofficeUrl }: AdminFloatingToolbarProps): React.ReactNode {
  const { user } = useAuth();
  const [adminFloatingIsExpanded, setAdminFloatingIsExpanded] = useState(false);
  const [adminFloatingDebugMode, setAdminFloatingDebugMode] = useState(false);
  const [adminFloatingShowToast, setAdminFloatingShowToast] = useState(false);
  const [adminFloatingToastMessage, setAdminFloatingToastMessage] = useState('');

  // Check if user is admin - check systemRole first, then roles array
  const adminFloatingIsAdmin = user?.systemRole === 'ROLE_ADMIN' || 
                               user?.roles?.includes('ROLE_ADMIN') || 
                               user?.roles?.includes('ADMIN');

  // Debug logging - must be AFTER all hooks are defined
  useEffect(() => {
    console.log('=== AdminFloatingToolbar Debug ===');
    console.log('User:', user);
    console.log('User systemRole:', user?.systemRole);
    console.log('User roles:', user?.roles);
    console.log('Is Admin (systemRole):', user?.systemRole === 'ROLE_ADMIN');
    console.log('===================================');
  }, [user]);

  // Handle cache clear with unique function name
  const handleAdminFloatingCacheClear = () => {
    localStorage.clear();
    sessionStorage.clear();
    setAdminFloatingToastMessage('캐시가 클리어되었습니다');
    setAdminFloatingShowToast(true);
    setTimeout(() => setAdminFloatingShowToast(false), 3000);
  };

  // Handle debug mode toggle with unique function name
  const handleAdminFloatingDebugToggle = () => {
    setAdminFloatingDebugMode(!adminFloatingDebugMode);
    if (!adminFloatingDebugMode) {
      window.localStorage.setItem('admin-floating-debug-mode', 'true');
      setAdminFloatingToastMessage('디버그 모드 활성화');
    } else {
      window.localStorage.removeItem('admin-floating-debug-mode');
      setAdminFloatingToastMessage('디버그 모드 비활성화');
    }
    setAdminFloatingShowToast(true);
    setTimeout(() => setAdminFloatingShowToast(false), 3000);
  };

  // Handle keyboard shortcut with unique effect
  useEffect(() => {
    const handleAdminFloatingKeyPress = (e: KeyboardEvent) => {
      // Alt + Shift + A to toggle toolbar
      if (e.altKey && e.shiftKey && e.key === 'A') {
        setAdminFloatingIsExpanded(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleAdminFloatingKeyPress);
    return () => window.removeEventListener('keydown', handleAdminFloatingKeyPress);
  }, []);

  // Don't render if not admin - MUST be after all hooks
  if (!adminFloatingIsAdmin) {
    return null;
  }

  return (
    <>
      {/* Floating Toolbar with unique class names */}
      <div className={`admin-floating-toolbar ${adminFloatingIsExpanded ? 'admin-floating-expanded' : ''}`}>
        <button 
          className="admin-floating-toggle"
          onClick={() => setAdminFloatingIsExpanded(!adminFloatingIsExpanded)}
          title="Admin Tools (Alt+Shift+A)"
        >
          {adminFloatingIsExpanded ? (
            <span className="admin-floating-close">×</span>
          ) : (
            <span className="admin-floating-gear">⚙️</span>
          )}
        </button>
        
        {adminFloatingIsExpanded && (
          <div className="admin-floating-menu">
            <div className="admin-floating-header">
              <span className="admin-floating-title">관리자 도구</span>
              <span className="admin-floating-badge">ADMIN</span>
            </div>
            
            <div className="admin-floating-actions">
              <a 
                href={(() => {
                  // Dynamic backoffice URL based on environment
                  if (backofficeUrl) return backofficeUrl;
                  if (process.env.REACT_APP_BACKOFFICE_URL) return process.env.REACT_APP_BACKOFFICE_URL;
                  
                  // Check if production
                  if (window.location.hostname.includes('vercel.app') || 
                      window.location.protocol === 'https:') {
                    return 'https://study-platform-backoffice.vercel.app';
                  }
                  
                  // Local development
                  return 'http://localhost:5173';
                })()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="admin-floating-action-btn admin-floating-primary"
              >
                <span className="admin-floating-action-icon">🎛️</span>
                <span className="admin-floating-action-text">백오피스</span>
              </a>
              
              <button 
                onClick={handleAdminFloatingDebugToggle}
                className={`admin-floating-action-btn ${adminFloatingDebugMode ? 'admin-floating-active' : ''}`}
              >
                <span className="admin-floating-action-icon">🐛</span>
                <span className="admin-floating-action-text">디버그 모드</span>
              </button>
              
              <button 
                onClick={handleAdminFloatingCacheClear}
                className="admin-floating-action-btn"
              >
                <span className="admin-floating-action-icon">🗑️</span>
                <span className="admin-floating-action-text">캐시 클리어</span>
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="admin-floating-action-btn"
              >
                <span className="admin-floating-action-icon">🔄</span>
                <span className="admin-floating-action-text">새로고침</span>
              </button>
            </div>
            
            <div className="admin-floating-info">
              <div className="admin-floating-info-item">
                <span className="admin-floating-info-label">사용자:</span>
                <span className="admin-floating-info-value">{user?.name || user?.username}</span>
              </div>
              <div className="admin-floating-info-item">
                <span className="admin-floating-info-label">권한:</span>
                <span className="admin-floating-info-value">{user?.roles?.join(', ')}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast notification with unique class names */}
      {adminFloatingShowToast && (
        <div className="admin-floating-toast">
          {adminFloatingToastMessage}
        </div>
      )}

      {/* Debug overlay with unique class names */}
      {adminFloatingDebugMode && (
        <div className="admin-floating-debug-overlay">
          <div className="admin-floating-debug-info">
            <strong>Debug Mode Active</strong>
            <div>User: {JSON.stringify(user, null, 2)}</div>
            <div>URL: {window.location.href}</div>
            <div>Time: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminFloatingToolbar;