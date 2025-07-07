import React, { lazy } from 'react';

const LabPage = lazy(() => import('../pages/LabPage'));
const LabDetailPage = lazy(() => import('../pages/LabDetailPage'));
const TecoTecoPage = lazy(() => import('../pages/TecoTecoPage/TecoTecoPage'));
const TeamShuffle = lazy(() => import('../components/lab/utilities/TeamShuffle'));
const SpotlightArenaPage = lazy(() => import('../pages/lab/spotlight-arena/SpotlightArenaPage'));

const subRouter = [
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

  {
    path: 'tecoteco',
    element: <TecoTecoPage />,
  },
];
export default subRouter;
