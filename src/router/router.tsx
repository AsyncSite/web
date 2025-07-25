import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import App from '../App';
import subRouter from './subRouter';
import { SubContentsTemplate } from '../components/layout';
import PrivateRoute from '../components/auth/PrivateRoute';

const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/user/ProfileEditPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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
        path: '/',
        Component: SubContentsTemplate,
        children: subRouter,
      },
    ],
  },
]);

export default router;
