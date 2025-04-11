
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Explore from './pages/Explore';
import Search from './pages/Search';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Sheets from './pages/Sheets';
import ClubsHome from './pages/ClubsHome';
import Schedule from './pages/Schedule';
import Liked from './pages/Liked';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import CreateExercise from './pages/CreateExercise';
import EditExercise from './pages/EditExercise';
import AppProviders from './components/AppProviders';
import { Toaster } from './components/ui/sonner';
import Index from './pages/Index';
import Leaderboards from './pages/Leaderboards';
import CreateEvent from './pages/CreateEvent';

// Add our purchase result pages
import PurchaseSuccess from './pages/PurchaseSuccess';
import PurchaseCancel from './pages/PurchaseCancel';

function App() {
  return (
    <AppProviders>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<MainLayout />}>
            <Route path="explore" element={<Explore />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="schedule" element={<AuthenticatedRoute><Schedule /></AuthenticatedRoute>} />
            <Route path="clubs" element={<AuthenticatedRoute><ClubsHome /></AuthenticatedRoute>} />
            <Route path="clubs/events/create" element={<AuthenticatedRoute><CreateEvent /></AuthenticatedRoute>} />
            <Route path="leaderboards" element={<Leaderboards />} />
            <Route path="liked" element={<Liked />} />
            <Route path="sheets" element={<AuthenticatedRoute><Sheets /></AuthenticatedRoute>} />
            <Route path="profile" element={<AuthenticatedRoute><Profile /></AuthenticatedRoute>} />
            <Route path="exercises/create" element={<AuthenticatedRoute><CreateExercise /></AuthenticatedRoute>} />
            <Route path="exercises/edit/:id" element={<AuthenticatedRoute><EditExercise /></AuthenticatedRoute>} />
            <Route path="purchase/success" element={<PurchaseSuccess />} />
            <Route path="purchase/cancel" element={<PurchaseCancel />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </AppProviders>
  );
}

export default App;
