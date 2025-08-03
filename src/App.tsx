import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';
import ScrollToTop from './components/common/ScrollToTop';

function App(): React.ReactNode {
  return (
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
        </Suspense>
      </GameProgressProvider>
    </AuthProvider>
  );
}

export default App;