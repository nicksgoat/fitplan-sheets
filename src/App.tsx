import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './App.css';
import Home from './pages/Home';
import Library from './pages/Library';
import Sheets from './pages/Sheets';
import Clubs from './pages/Clubs';
import ClubDetail from './pages/ClubDetail';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import { useAuth } from './hooks/useAuth';
import { useEffect } from 'react';
import { useUser } from './hooks/useUser';
import ProgramDetail from './pages/ProgramDetail';
import WorkoutDetail from './pages/WorkoutDetail';
import PurchaseSuccess from './pages/PurchaseSuccess';
import PurchaseCancel from './pages/PurchaseCancel';

// Import the new SalesDashboard component
import SalesDashboard from './pages/SalesDashboard';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
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
    path: "/clubs/:clubId",
    element: <ClubDetail />,
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
    path: "/programs/:programId",
    element: <ProgramDetail />,
  },
  {
    path: "/workouts/:workoutId",
    element: <WorkoutDetail />,
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
  const { authState } = useAuth();
  const { user, isLoading } = useUser();

  useEffect(() => {
    console.log('Auth State changed:', authState);
  }, [authState]);

  useEffect(() => {
    console.log('User data loaded:', user);
  }, [user]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <RouterProvider router={router} />;
}

export default App;
