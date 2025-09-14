import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import ScrollToTop from './components/common/ScrollToTop';
import AdminFloatingToolbar from './components/admin/AdminFloatingToolbar';
import ChunkErrorBoundary from './components/common/ChunkErrorBoundary';

function App(): React.ReactNode {
  return (
    <ChunkErrorBoundary>
      <AuthProvider>
        <GameProgressProvider>
          <Suspense fallback={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              backgroundColor: '#05060A',
              color: '#C3E88D',
              fontSize: '1.5rem'
            }}>
              Loading...
            </div>
          }>
            <ScrollToTop />
            <Outlet />
            {/* Admin Floating Toolbar - only visible for admins */}
            <AdminFloatingToolbar />
            {/* Toast Notifications */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  padding: '16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                },
                success: {
                  style: {
                    background: '#10B981',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                  },
                },
              }}
            />
          </Suspense>
        </GameProgressProvider>
      </AuthProvider>
    </ChunkErrorBoundary>
  );
}

export default App;