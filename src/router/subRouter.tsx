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

// Ignition 관련 페이지들
const IgnitionPage = lazy(() => import('../pages/ignition/IgnitionPage'));
const NavigatorPage = lazy(() => import('../pages/ignition/navigator/NavigatorPage'));

// 기타 페이지들
const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const StudyPlanPage = lazy(() => import('../pages/StudyPlanPage'));
const WhoWeArePage = lazy(() => import('../pages/WhoWeArePage'));
const WhoWeAreV2Page = lazy(() => import('../pages/WhoWeAreV2Page'));
const WhoWeAreV4Page = lazy(() => import('../pages/WhoWeAreV4Page'));
const WhoWeAreV5Page = lazy(() => import('../pages/WhoWeAreV5Page'));
const WhoWeAreEnhancedPage = lazy(() => import('../pages/WhoWeAreEnhancedPage'));
const WhoWeAreProfilePage = lazy(() => import('../pages/WhoWeAreProfilePage'));
const WhoWeAreSubtlePage = lazy(() => import('../pages/WhoWeAreSubtlePage'));
const WhoWeArePlanetPage = lazy(() => import('../pages/WhoWeArePlanetPage'));
const WhoWeAreGlassPage = lazy(() => import('../pages/WhoWeAreGlassPage'));
const WhoWeAreScreenPage = lazy(() => import('../pages/WhoWeAreScreenPage'));
const WhoWeAreTeamNodesPage = lazy(() => import('../pages/WhoWeAreTeamNodesPage'));
const WhoWeAreProfilePlanetsPage = lazy(() => import('../pages/WhoWeAreProfilePlanetsPage'));
const WhoWeArePlanetsRandomPage = lazy(() => import('../pages/WhoWeArePlanetsRandomPage'));
const WhoWeArePlanetsIntuitivePage = lazy(() => import('../pages/WhoWeArePlanetsIntuitivePage'));
const WhoWeAreGlassOrbsPage = lazy(() => import('../pages/WhoWeAreGlassOrbsPage'));
const WhoWeAreCrystalOrbsPage = lazy(() => import('../pages/WhoWeAreCrystalOrbsPage'));
const WhoWeAreProfileCardsPage = lazy(() => import('../pages/WhoWeAreProfileCardsPage'));
const WhoWeAreProfileCardsFloatingPage = lazy(() => import('../pages/WhoWeAreProfileCardsFloatingPage'));
const WhoWeAreProfileCardsCorePage = lazy(() => import('../pages/WhoWeAreProfileCardsCorePage'));
const WhoWeAreProfileCardsSequencePage = lazy(() => import('../pages/WhoWeAreProfileCardsSequencePage'));
const WhoWeAreProfileCardsJourneyPage = lazy(() => import('../pages/WhoWeAreProfileCardsJourneyPage'));
const WhoWeAreStoryPlanetsPage = lazy(() => import('../pages/WhoWeAreStoryPlanetsPage'));

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
  
  // Who We Are 페이지 (프로토타입들)
  {
    path: 'whoweare',
    element: <WhoWeArePage />,
  },
  {
    path: 'whoweare-v2',
    element: <WhoWeAreV2Page />,
  },
  {
    path: 'whoweare-v4',
    element: <WhoWeAreV4Page />,
  },
  {
    path: 'whoweare-v5',
    element: <WhoWeAreV5Page />,
  },
  {
    path: 'whoweare-enhanced',
    element: <WhoWeAreEnhancedPage />,
  },
  {
    path: 'whoweare-profile',
    element: <WhoWeAreProfilePage />,
  },
  {
    path: 'whoweare-subtle',
    element: <WhoWeAreSubtlePage />,
  },
  {
    path: 'whoweare-planet',
    element: <WhoWeArePlanetPage />,
  },
  {
    path: 'whoweare-glass',
    element: <WhoWeAreGlassPage />,
  },
  {
    path: 'whoweare-screen',
    element: <WhoWeAreScreenPage />,
  },
  {
    path: 'whoweare-team-nodes',
    element: <WhoWeAreTeamNodesPage />,
  },
  {
    path: 'whoweare-profile-planets',
    element: <WhoWeAreProfilePlanetsPage />,
  },
  {
    path: 'whoweare-planets-random',
    element: <WhoWeArePlanetsRandomPage />,
  },
  {
    path: 'whoweare-planets-intuitive',
    element: <WhoWeArePlanetsIntuitivePage />,
  },
  {
    path: 'whoweare-glass-orbs',
    element: <WhoWeAreGlassOrbsPage />,
  },
  {
    path: 'whoweare-crystal-orbs',
    element: <WhoWeAreCrystalOrbsPage />,
  },
  {
    path: 'whoweare-profile-cards',
    element: <WhoWeAreProfileCardsPage />,
  },
  {
    path: 'whoweare-profile-cards-floating',
    element: <WhoWeAreProfileCardsFloatingPage />,
  },
  {
    path: 'whoweare-profile-cards-core',
    element: <WhoWeAreProfileCardsCorePage />,
  },
  {
    path: 'whoweare-profile-cards-sequence',
    element: <WhoWeAreProfileCardsSequencePage />,
  },
  {
    path: 'whoweare-profile-cards-journey',
    element: <WhoWeAreProfileCardsJourneyPage />,
  },
  {
    path: 'whoweare-story-planets',
    element: <WhoWeAreStoryPlanetsPage />,
  },
];
export default subRouter;
