import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
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
          </Suspense>
        </GameProgressProvider>
      </AuthProvider>
    </ChunkErrorBoundary>
  );
}

export default App;