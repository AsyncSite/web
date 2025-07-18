import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

function PrivateRoute({ children, requiredRoles }: PrivateRouteProps): React.ReactNode {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for required roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = user?.roles.some(role => 
      requiredRoles.includes(role)
    );

    if (!hasRequiredRole) {
      // User is authenticated but doesn't have required role
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default PrivateRoute;