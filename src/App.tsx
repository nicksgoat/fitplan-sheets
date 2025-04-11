
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
        path: "/library",
        element: <Library />,
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
    ]
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
