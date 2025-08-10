import { lazy } from 'react';
import { createBrowserRouter, Navigate, ScrollRestoration } from 'react-router-dom';

import App from '../App';
import subRouter from './subRouter';
import { SubContentsTemplate } from '../components/layout';
import PrivateRoute from '../components/auth/PrivateRoute';

const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const LoginPageA = lazy(() => import('../pages/auth/LoginPageA'));
const LoginPageB = lazy(() => import('../pages/auth/LoginPageB'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const OAuthCallbackPage = lazy(() => import('../pages/auth/OAuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/user/ProfileEditPage'));
const TermsPage = lazy(() => import('../pages/TermsPage')); // 추가
const PrivacyPage = lazy(() => import('../pages/PrivacyPage')); // 추가
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage'));
const PaymentFailPage = lazy(() => import('../pages/PaymentFailPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <ScrollRestoration />
        <App />
      </>
    ),
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'login-a',
        element: <LoginPageA />,
      },
      {
        path: 'login-b',
        element: <LoginPageB />,
      },
      {
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'auth/callback',
        element: <OAuthCallbackPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'users/me',
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: 'users/me/edit',
        element: (
          <PrivateRoute>
            <ProfileEditPage />
          </PrivateRoute>
        ),
      },
      {
        path: 'terms', // 추가
        element: <TermsPage />,
      },
      {
        path: 'privacy', // 추가
        element: <PrivacyPage />,
      },
      {
        path: 'payment/success',
        element: <PaymentSuccessPage />,
      },
      {
        path: 'payment/fail',
        element: <PaymentFailPage />,
      },
      {
        path: '/',
        Component: SubContentsTemplate,
        children: subRouter,
      },
    ],
  },
]);

export default router;
