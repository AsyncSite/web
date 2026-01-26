import { lazy } from 'react';
import { createBrowserRouter, Navigate, ScrollRestoration } from 'react-router-dom';

import App from '../App';
import subRouter from './subRouter';
import { SubContentsTemplate } from '../components/layout';
import StudioLayout from '../components/layout/StudioLayout';
import PrivateRoute from '../components/auth/PrivateRoute';
import RouterErrorBoundary from '../components/common/RouterErrorBoundary';
import NotFoundPage from '../pages/NotFoundPage';

const MainPage = lazy(() => import('../pages/MainPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const OAuthCallbackPage = lazy(() => import('../pages/auth/OAuthCallbackPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const KakaoOAuthTestPage = lazy(() => import('../pages/test/KakaoOAuthTestPage'));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage'));
const ProfileEditPage = lazy(() => import('../pages/user/ProfileEditPage'));
const TermsPage = lazy(() => import('../pages/TermsPage')); // 추가
const PrivacyPage = lazy(() => import('../pages/PrivacyPage')); // 추가
const SupportPage = lazy(() => import('../pages/SupportPage')); // 고객지원 페이지
const PaymentSuccessPage = lazy(() => import('../pages/PaymentSuccessPage'));
const PaymentFailPage = lazy(() => import('../pages/PaymentFailPage'));
const PaymentAccountInfoPage = lazy(() => import('../pages/PaymentAccountInfoPage'));
const PaymentPendingPage = lazy(() => import('../pages/PaymentPendingPage'));
const CheckoutTestPage = lazy(() => import('../pages/CheckoutTestPage'));
// MockPaymentPage 제거

// Studio components
const DocuMentor = lazy(() => import('../components/lab/ai-studio/documentor/DocuMentor'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <ScrollRestoration
          getKey={(location, matches) => {
            // 각 페이지마다 고유한 키를 생성하여 스크롤 위치를 독립적으로 관리
            // 중첩 라우트와 직접 라우트 모두에 대해 일관된 키 생성
            const key = location.pathname + location.search;

            // 중첩 라우트의 경우 더 구체적인 키 생성
            if (matches.length > 2) {
              // 가장 구체적인 매치의 경로를 사용
              const specificMatch = matches[matches.length - 1];
              return `${key}-${specificMatch.pathname}`;
            }

            return key;
          }}
        />
        <App />
      </>
    ),
    errorElement: <RouterErrorBoundary />,
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
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: 'test/kakao-oauth',
        element: <KakaoOAuthTestPage />,
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
        path: 'support', // 고객지원 페이지
        element: <SupportPage />,
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
        path: 'payment/account-info',
        element: <PaymentAccountInfoPage />,
      },
      {
        path: 'payment/pending',
        element: <PaymentPendingPage />,
      },
      {
        path: 'checkout/test',
        element: <CheckoutTestPage />,
      },
      // mock-payment 라우트 제거
      {
        path: 'studio',
        element: <StudioLayout />,
        children: [
          {
            path: 'documentor',
            element: <DocuMentor />,
          },
          // Add more studio routes here in the future
        ],
      },
      {
        path: '/',
        Component: SubContentsTemplate,
        children: subRouter,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
