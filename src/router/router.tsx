import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";


const MainPage = lazy(() => import("../pages/MainPage"));

const router = createBrowserRouter([
    {
        index: true,
        path: "web",
        element: <MainPage />,
    },
    {
        path: "",
        element: <Navigate to="/web" replace />,
    },
]);

export default router;