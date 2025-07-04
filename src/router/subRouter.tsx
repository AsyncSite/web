import React, { lazy } from "react";

const LabPage = lazy(() => import("../pages/LabPage"));
const LabDetailPage = lazy(() => import("../pages/LabDetailPage"));
const TecoTecoPage = lazy(() => import("../pages/TecoTecoPage/TecoTecoPage"));
const RandomKeywordPicker = lazy(() => import("../components/temp/RandomKeywordPicker"));

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
    {
        path: "temp/random-keyword",
        element: <RandomKeywordPicker />,
    },
]
export default subRouter;