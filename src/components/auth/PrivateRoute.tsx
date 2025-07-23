import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { usePreventCache } from '../../hooks/usePreventCache';
import { useAuthRevalidation } from '../../hooks/useAuthRevalidation';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

function PrivateRoute({ children, requiredRoles }: PrivateRouteProps): React.ReactNode {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  
  // Prevent caching of private routes
  usePreventCache();
  
  // Revalidate auth when page becomes visible
  useAuthRevalidation();
  
  // Re-check authentication on every render
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingSpinner message="인증 확인 중..." />;
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