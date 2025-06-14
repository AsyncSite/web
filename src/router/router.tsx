import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import subRouter from "./subRouter";
import { SubContentsTemplate } from "../components/layout";


const MainPage = lazy(() => import("../pages/MainPage"));



const router = createBrowserRouter([
    {
        index: true,
        path: "web",
        element: <MainPage />,
    },
    {
        path: "web",
        Component: SubContentsTemplate,
        children: subRouter
    },
    {
        path: "",
        element: <Navigate to="/web" replace />,
    },
]);

export default router;