
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import Index from './pages/Index';
import Library from './pages/Library';
import Sheets from './pages/Sheets';
import Clubs from './pages/Clubs';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import PurchaseSuccess from './pages/PurchaseSuccess';
import PurchaseCancel from './pages/PurchaseCancel';
import SalesDashboard from './pages/SalesDashboard';
import MainLayout from './components/layout/MainLayout';

// Create router with existing pages
const router = createBrowserRouter([
  {
    path: "/",
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
    path: "/clubs/*",
    element: <Clubs />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/purchase/success",
    element: <PurchaseSuccess />,
  },
  {
    path: "/purchase/cancel",
    element: <PurchaseCancel />,
  },
  {
    path: "/sales",
    element: <SalesDashboard />
  },
]);

function App() {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Auth State changed:', user);
  }, [user]);

  useEffect(() => {
    console.log('User data loaded:', user);
  }, [user]);

  return <RouterProvider router={router} />;
}

export default App;
