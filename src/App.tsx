import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import RootLayout from '@/RootLayout';
import Home from '@/pages/Home';
import Sheets from '@/pages/Sheets';
import Library from '@/pages/Library';
import CreateExercise from '@/pages/CreateExercise';
import ExerciseDetails from '@/pages/ExerciseDetails';
import Club from '@/pages/Club';
import Pricing from '@/pages/Pricing';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Auth from '@/pages/Auth';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Add our new purchase result pages
import PurchaseSuccess from '@/pages/PurchaseSuccess';
import PurchaseCancel from '@/pages/PurchaseCancel';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sheets" element={<Sheets />} />
          <Route path="/library" element={<Library />} />
          <Route path="/create-exercise" element={<CreateExercise />} />
          <Route path="/exercise/:id" element={<ExerciseDetails />} />
          <Route path="/club/:id" element={<Club />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/purchase/success" element={<PurchaseSuccess />} />
          <Route path="/purchase/cancel" element={<PurchaseCancel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
