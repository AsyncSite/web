import { lazy } from 'react';
import { createBrowserRouter, Navigate, ScrollRestoration } from 'react-router-dom';

import App from '../App';
import subRouter from './subRouter';
import { SubContentsTemplate } from '../components/layout';
import PrivateRoute from '../components/auth/PrivateRoute';

const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const OAuthCallbackPage = lazy(() => import('../pages/auth/OAuthCallbackPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/user/ProfileEditPage'));
const TermsPage = lazy(() => import('../pages/TermsPage')); // 추가
const PrivacyPage = lazy(() => import('../pages/PrivacyPage')); // 추가

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
        path: 'signup',
        element: <SignupPage />,
      },
      {
        path: 'auth/callback',
        element: <OAuthCallbackPage />,
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
        path: '/',
        Component: SubContentsTemplate,
        children: subRouter,
      },
    ],
  },
]);

export default router;
