import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import subRouter from "./subRouter";
import { SubContentsTemplate } from "../components/layout";


const MainPage = lazy(() => import("../pages/MainPage"));



const router = createBrowserRouter([
    {
        index: true,
        path: "/",
        element: <MainPage />,
    },
    {
        path: "/",
        Component: SubContentsTemplate,
        children: subRouter
    },
]);

export default router;