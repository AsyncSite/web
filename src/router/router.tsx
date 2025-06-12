import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import subRouter from "./subRouter";
import { SubContentsTemplate } from "../components/layout";


const MainPage = lazy(() => import("../pages/MainPage"));
const TecoTecoPage = lazy(() => import("../pages/TecoTecoPage")); // 새로 추가된 TecoTecoPage import


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
        path: "web/tecoteco", // 새로운 테코테코 페이지 경로 추가
        element: <TecoTecoPage />,
    },
    {
        path: "",
        element: <Navigate to="/web" replace />,
    },
]);

export default router;