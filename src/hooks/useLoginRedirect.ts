import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook for redirecting to login page with return URL
 *
 * @example
 * const { redirectToLogin } = useLoginRedirect();
 *
 * // Redirect to login and return to current page after login
 * redirectToLogin();
 *
 * // Redirect to login and go to specific page after login
 * redirectToLogin('/project/new');
 */
export const useLoginRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Redirect to login page with return URL
   * @param returnTo - Optional specific path to return to after login. Defaults to current location.
   */
  const redirectToLogin = (returnTo?: string) => {
    const from = returnTo || location.pathname + location.search;

    navigate('/login', {
      state: { from },
      replace: false
    });
  };

  return { redirectToLogin };
};
