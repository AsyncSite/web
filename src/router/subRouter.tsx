import React, { lazy } from 'react';

// 기존 페이지들
const LabPage = lazy(() => import('../pages/LabPage'));
const LabDetailPage = lazy(() => import('../pages/LabDetailPage'));
const TeamShuffle = lazy(() => import('../components/lab/utilities/TeamShuffle'));
const SpotlightArenaPage = lazy(() => import('../pages/lab/spotlight-arena/SpotlightArenaPage'));

// 새로운 탭 페이지들
const StudyPage = lazy(() => import('../pages/StudyPage'));
const CalendarPage = lazy(() => import('../pages/CalendarPage'));
const StudyPlanPage = lazy(() => import('../pages/StudyPlanPage'));

const subRouter = [
  // 새로운 탭 페이지들
  {
    path: 'study',
    element: <StudyPage />,
  },
  {
    path: 'calendar',
    element: <CalendarPage />,
  },
  {
    path: 'study-plan',
    element: <StudyPlanPage />,
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
];
export default subRouter;
