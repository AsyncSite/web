import { lazy } from "react";

const LabPage = lazy(() => import("../pages/LabPage"));
const LabDetailPage = lazy(() => import("../pages/LabDetailPage"));

const subRouter = [
    {
        path: "lab",
        element: <LabPage />,
    },
    {
        path: "lab/:subject",
        element: <LabDetailPage />,
    },
]
export default subRouter;