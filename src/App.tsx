import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProgressProvider } from './contexts/GameProgressContext';

function App(): React.ReactNode {
  return (
    <AuthProvider>
      <GameProgressProvider>
        <Outlet />
      </GameProgressProvider>
    </AuthProvider>
  );
}

export default App;