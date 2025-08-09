import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// 기존 페이지들
const LabPage = lazy(() => import('../pages/LabPage'));
const LabDetailPage = lazy(() => import('../pages/LabDetailPage'));
const TeamShuffle = lazy(() => import('../components/lab/utilities/TeamShuffle'));
const SpotlightArenaPage = lazy(() => import('../pages/lab/spotlight-arena/SpotlightArenaPage'));

// 스터디 관련 페이지들
const StudyPage = lazy(() => import('../pages/StudyPage'));
const TecoTecoPage = lazy(() => import('../pages/TecoTecoPage/TecoTecoPage'));
const StudyDetailPage = lazy(() => import('../pages/StudyDetailPage'));
const StudyProposalPage = lazy(() => import('../pages/StudyProposalPage'));
const StudyProposalPageV2 = lazy(() => import('../pages/StudyProposalPageV2'));
const StudyApplicationPage = lazy(() => import('../pages/StudyApplicationPage'));
const StudyManagementPage = lazy(() => import('../pages/StudyManagementPage'));

// Ignition 관련 페이지들
const IgnitionPage = lazy(() => import('../pages/ignition/IgnitionPage'));
const NavigatorPage = lazy(() => import('../pages/ignition/navigator/NavigatorPage'));

// 기타 페이지들
const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const StudyPlanPage = lazy(() => import('../pages/StudyPlanPage'));
const WhoWeArePage = lazy(() => import('../pages/WhoWeArePage'));
const WhoWeAreOriginalPage = lazy(() => import('../pages/WhoWeAreOriginalPage'));
const WhoWeAreHybridArchivePage = lazy(() => import('../pages/WhoWeAreHybridArchivePage'));

const subRouter = [
  // 스터디 관련 라우트
  {
    path: 'study',
    children: [
      {
        index: true,
        element: <StudyPage />,
      },
      {
        path: 'calendar',
        element: <StudyPage />,
      },
      {
        path: 'propose',
        element: <StudyProposalPageV2 />,
      },
      {
        path: 'propose-old',
        element: <StudyProposalPage />,
      },
      {
        path: ':studyId/apply',
        element: <StudyApplicationPage />,
      },
      {
        path: ':studyId/manage',
        element: <StudyManagementPage />,
      },
      // 레거시 URL 리다이렉트 (/study/1 -> /study/1-tecoteco)
      {
        path: '1',
        element: <Navigate to="/study/1-tecoteco" replace />,
      },
      {
        path: '2',
        element: <Navigate to="/study/2-11routine" replace />,
      },
      {
        path: '3',
        element: <Navigate to="/study/3-devlog" replace />,
      },
      // 기존 URL 호환성
      {
        path: '3-devlog-14',
        element: <Navigate to="/study/3-devlog" replace />,
      },
      {
        path: 'devlog-14',
        element: <Navigate to="/study/3-devlog" replace />,
      },
      // 테코테코 전용 페이지
      {
        path: '1-tecoteco',
        element: <TecoTecoPage />,
      },
      {
        path: 'tecoteco',
        element: <Navigate to="/study/1-tecoteco" replace />,
      },
      // 다른 스터디들을 위한 동적 라우트 (향후 확장)
      {
        path: ':studyIdentifier',
        element: <StudyDetailPage />,
      },
    ],
  },
  
  // 기타 페이지들
  {
    path: 'calendar',
    element: <CalendarPage />,
  },
  {
    path: 'study-plan',
    element: <StudyPlanPage />,
  },

  // Ignition 관련 라우트
  {
    path: 'ignition',
    children: [
      {
        index: true,
        element: <IgnitionPage />,
      },
      {
        path: 'navigator',
        element: <NavigatorPage />,
      },
    ],
  },

  // 기존 페이지들
  {
    path: 'lab',
    element: <LabPage />,
  },
  {
    path: 'lab/team-shuffle',
    element: <TeamShuffle />,
  },
  {
    path: 'lab/spotlight-arena',
    element: <SpotlightArenaPage />,
  },
  {
    path: 'lab/:subject',
    element: <LabDetailPage />,
  },
  
  // Who We Are 페이지 (AI Guide 버전이 메인)
  {
    path: 'whoweare',
    element: <WhoWeArePage />,
  },
  // Who We Are 아카이브: Original 버전
  {
    path: 'whoweare-original',
    element: <WhoWeAreOriginalPage />,
  },
  // Who We Are 아카이브: Hybrid 프로토타입
  {
    path: 'whoweare-hybrid-archive',
    element: <WhoWeAreHybridArchivePage />,
  },
  // Legacy URL redirects
  {
    path: 'whoweare-profile-cards-floating',
    element: <Navigate to="/whoweare" replace />,
  },
  {
    path: 'whoweare-ai-guide',
    element: <Navigate to="/whoweare" replace />,
  },
  {
    path: 'whoweare-hybrid',
    element: <Navigate to="/whoweare-hybrid-archive" replace />,
  },
];
export default subRouter;
