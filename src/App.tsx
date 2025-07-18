import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

function App(): React.ReactNode {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export default App;