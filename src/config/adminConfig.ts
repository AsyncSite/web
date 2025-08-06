/**
 * Admin Configuration
 * Centralized configuration for admin-related features
 * Uses unique variable names with 'adminConfig' prefix to avoid conflicts
 */

// Determine backoffice URL based on environment
const getBackofficeUrl = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_BACKOFFICE_URL) {
    return process.env.REACT_APP_BACKOFFICE_URL;
  }
  
  // Check if we're on production (Vercel deployment)
  if (window.location.hostname === 'web-cyan-one-95.vercel.app' || 
      window.location.hostname.includes('vercel.app') ||
      window.location.protocol === 'https:') {
    return 'https://study-platform-backoffice.vercel.app';
  }
  
  // Local development
  return 'http://localhost:5173';
};

export const adminConfigSettings = {
  // Backoffice URL - dynamically determined based on environment
  adminConfigBackofficeUrl: getBackofficeUrl(),
  
  // Show admin features flag - can be controlled via environment variable
  adminConfigShowFeatures: process.env.REACT_APP_SHOW_ADMIN_FEATURES !== 'false',
  
  // Admin role identifier
  adminConfigRoleIdentifier: 'ROLE_ADMIN',
  
  // Floating toolbar settings
  adminConfigFloatingToolbar: {
    enabled: process.env.REACT_APP_ADMIN_TOOLBAR_ENABLED !== 'false',
    position: {
      bottom: '30px',
      right: '30px'
    },
    keyboardShortcut: {
      altKey: true,
      shiftKey: true,
      key: 'A'
    }
  },
  
  // Debug mode settings
  adminConfigDebugMode: {
    defaultEnabled: process.env.REACT_APP_DEBUG_MODE === 'true',
    localStorageKey: 'admin-floating-debug-mode'
  },
  
  // Admin badge settings
  adminConfigBadge: {
    showOnProfile: true,
    pulseAnimation: true
  },
  
  // Admin panel settings
  adminConfigPanel: {
    showQuickStats: true,
    mockStats: {
      activeStudies: 12,
      todaySignups: 5,
      pendingApprovals: 3
    }
  }
};

/**
 * Helper function to check if user is admin
 * @param roles - Array of user roles
 * @returns boolean indicating admin status
 */
export const adminConfigIsAdmin = (roles?: string[]): boolean => {
  return roles?.includes(adminConfigSettings.adminConfigRoleIdentifier) || false;
};

/**
 * Helper function to get backoffice URL
 * @returns Backoffice URL string
 */
export const adminConfigGetBackofficeUrl = (): string => {
  return adminConfigSettings.adminConfigBackofficeUrl;
};

export default adminConfigSettings;