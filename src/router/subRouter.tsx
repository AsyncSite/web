import React, { lazy } from "react";

const LabPage = lazy(() => import("../pages/LabPage"));
const LabDetailPage = lazy(() => import("../pages/LabDetailPage"));
const WavePage = lazy(() => import("../pages/WavePage"));
const CalendarPage = lazy(() => import("../pages/CalendarPage"));
const RankingPage = lazy(() => import("../pages/RankingPage"));
const TecoTecoPage = lazy(() => import("../pages/TecoTecoPage/TecoTecoPage"));
const DevlogPage = lazy(() => import("../pages/DevlogPage"));

const subRouter = [
    {
        path: "lab",
        element: <LabPage />,
    },
    {
        path: "lab/:subject",
        element: <LabDetailPage />,
    },
    {
        path: "wave",
        element: <WavePage />,
    },
    {
        path: "calendar",
        element: <CalendarPage />,
    },
    {
        path: "ranking",
        element: <RankingPage />,
    },
    {
        path: "tecoteco",
        element: <TecoTecoPage />,
    },
    {
        path: "devlog",
        element: <DevlogPage />,
    },
]
export default subRouter;