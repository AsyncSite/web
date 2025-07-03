import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import subRouter from "./subRouter";
import { SubContentsTemplate } from "../components/layout";
import ScrollToTop from "../components/common/ScrollToTop";


const MainPage = lazy(() => import("../pages/MainPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));



const router = createBrowserRouter([
    {
        path: "/",
        element: (
            <>
                <ScrollToTop />
                <SubContentsTemplate />
            </>
        ),
        children: [
            {
                index: true,
                element: <MainPage />,
            },
            ...subRouter
        ]
    },
    {
        path: "*",
        element: (
            <>
                <ScrollToTop />
                <NotFoundPage />
            </>
        ),
    },
], {
    basename: "/web"
});

export default router;