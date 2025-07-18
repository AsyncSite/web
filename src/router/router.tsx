import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import App from '../App';
import subRouter from './subRouter';
import { SubContentsTemplate } from '../components/layout';

const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));

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
        element: <ProfilePage />,
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
