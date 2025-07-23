// Custom event for authentication state changes
export const AUTH_EVENTS = {
  UNAUTHORIZED: 'auth:unauthorized',
  LOGOUT: 'auth:logout',
  LOGIN_SUCCESS: 'auth:login_success'
} as const;

// Helper function to dispatch auth events
export const dispatchAuthEvent = (eventType: string, detail?: any) => {
  window.dispatchEvent(new CustomEvent(eventType, { detail }));
};

// Helper function to listen to auth events
export const addAuthEventListener = (eventType: string, handler: (event: CustomEvent) => void) => {
  window.addEventListener(eventType, handler as EventListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(eventType, handler as EventListener);
  };
};