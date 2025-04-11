
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Library />,
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
  {
    path: "/leaderboards",
    element: <Leaderboards />
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
