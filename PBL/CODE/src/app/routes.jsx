import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import AccountPage from "./pages/AccountPage";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Services from "./pages/Services";
import Design from "./pages/Design";
import OurStory from "./pages/OurStory";
import OurFood from "./pages/OurFood";
import Branches from "./pages/Branches";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Admin from "./pages/Admin";
import AdminProducts from "./pages/AdminProducts";
import AdminOrders from "./pages/AdminOrders";
import AdminCustomers from "./pages/AdminCustomers";
import AdminSales from "./pages/AdminSales";
import AdminInventory from "./pages/AdminInventory";
import AdminManageStaff from "./pages/AdminManageStaff";
import AdminDesignRequests from "./pages/AdminDesignRequests";
import ProfilePage from "./pages/ProfilePage";
export const router = createBrowserRouter([
    { path: "/account", Component: AccountPage },
    {
        path: "/",
        Component: Layout,
        children: [
            { index: true, Component: Home },
            { path: "products", Component: Menu },
            { path: "about/our-story", Component: OurStory },
            { path: "about/our-food", Component: OurFood },
            { path: "about/branches", Component: Branches },
            { path: "inquiries", Component: Services },
            { path: "design", Component: Design },
            { path: "login", Component: Login },
            { path: "signup", Component: Signup },
            { path: "checkout", Component: Checkout },
            { path: "my-orders", Component: MyOrders },
            { path: "privacy-policy", Component: PrivacyPolicy },
            { path: "profile", Component: ProfilePage },
        ],
    },
    {
        path: "/admin",
        Component: AdminLayout,
        children: [
            { index: true, Component: Admin },
            { path: "products", Component: AdminProducts },
            { path: "orders", Component: AdminOrders },
            { path: "customers", Component: AdminCustomers },
            { path: "sales", Component: AdminSales },
            { path: "inventory", Component: AdminInventory },
            { path: "staff", Component: AdminManageStaff },
            { path: "designs", Component: AdminDesignRequests },
            { path: "profile", Component: ProfilePage },
        ],
    },
    {
        path: "/staff",
        lazy: () => import("./components/StaffLayout").then((m) => ({ Component: m.default })),
        children: [
            {
                index: true,
                lazy: () => import("./pages/StaffDashboard").then((m) => ({ Component: m.default })),
            },
            {
                path: "orders",
                lazy: () => import("./pages/StaffOrders").then((m) => ({ Component: m.default })),
            },
            {
                path: "inquiries",
                lazy: () => import("./pages/StaffInquiries").then((m) => ({ Component: m.default })),
            },
            {
                path: "inventory",
                lazy: () => import("./pages/StaffInventory").then((m) => ({ Component: m.default })),
            },
            {
                path: "products",
                lazy: () => import("./pages/StaffProducts").then((m) => ({ Component: m.default })),
            },
            {
                path: "designs",
                lazy: () => import("./pages/AdminDesignRequests").then((m) => ({ Component: m.default })),
            },
            {
                path: "profile",
                lazy: () => import("./pages/ProfilePage").then((m) => ({ Component: m.default })),
            },
        ],
    },
]);
