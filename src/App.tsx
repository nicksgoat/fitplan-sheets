
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import './App.css';
import Library from './pages/Library';
import Sheets from './pages/Sheets';
import Clubs from './pages/Clubs';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import PurchaseSuccess from './pages/PurchaseSuccess';
import PurchaseCancel from './pages/PurchaseCancel';
import SalesDashboard from './pages/SalesDashboard';
import Leaderboards from './pages/Leaderboards';
import MainLayout from './components/layout/MainLayout';
import Index from './pages/Index';
import Explore from './pages/Explore';
import NotFound from './pages/NotFound';
import Search from './pages/Search';
import Schedule from './pages/Schedule';
import Liked from './pages/Liked';

const router = createBrowserRouter([
  // Auth route without MainLayout
  {
    path: "/auth",
    element: <Auth />,
  },
  // Purchase routes without MainLayout
  {
    path: "/purchase/success",
    element: <PurchaseSuccess />,
  },
  {
    path: "/purchase/cancel",
    element: <PurchaseCancel />,
  },
  // Routes with MainLayout
  {
    path: "/",
    element: <MainLayout><Outlet /></MainLayout>,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/home",
        element: <Index />,
      },
      {
        path: "/explore",
        element: <Explore />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/library",
        element: <Library />,
      },
      {
        path: "/schedule",
        element: <Schedule />,
      },
      {
        path: "/sheets",
        element: <Sheets />,
      },
      {
        path: "/clubs",
        element: <Clubs />,
      },
      {
        path: "/liked",
        element: <Liked />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/sales",
        element: <SalesDashboard />
      },
      {
        path: "/leaderboards",
        element: <Leaderboards />
      },
      {
        path: "*",
        element: <NotFound />
      },
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
