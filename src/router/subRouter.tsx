import React, { lazy } from "react";

const LabPage = lazy(() => import("../pages/LabPage"));
const LabDetailPage = lazy(() => import("../pages/LabDetailPage"));
const TecoTecoPage = lazy(() => import("../pages/TecoTecoPage/TecoTecoPage"));

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
        path: "tecoteco",
        element: <TecoTecoPage />,
    },
]
export default subRouter;