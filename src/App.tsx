
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
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
import EventDetailScreen from './components/clubs/EventDetailScreen';
import ClubDetailPage from './components/clubs/ClubDetailPage';
import PurchaseSuccess from './pages/PurchaseSuccess';
import PurchaseCancel from './pages/PurchaseCancel';
import CreatorDashboard from './pages/CreatorDashboard';
import WorkoutDetail from './pages/WorkoutDetail';
import ProgramDetail from './pages/ProgramDetail';
import CreatorWorkoutDetail from './pages/CreatorWorkoutDetail';
import CreatorProgramDetail from './pages/CreatorProgramDetail';
import AIWorkoutGenerator from './components/workout/AIWorkoutGenerator';
import EnhancedDashboard from './components/analytics/EnhancedDashboard';
import OptimizedProfileView from './components/profile/OptimizedProfileView';
import WorkoutLogger from './pages/WorkoutLogger';

function App() {
  return (
    <AppProviders>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="/index" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<MainLayout />}>
              <Route path="explore" element={<Explore />} />
              <Route path="search" element={<Search />} />
              <Route path="library" element={<Library />} />
              <Route path="schedule" element={<AuthenticatedRoute><Schedule /></AuthenticatedRoute>} />
              
              <Route path="ai-workout-generator" element={<AuthenticatedRoute><AIWorkoutGenerator /></AuthenticatedRoute>} />
              <Route path="analytics" element={<AuthenticatedRoute><EnhancedDashboard /></AuthenticatedRoute>} />
              <Route path="profile/view" element={<AuthenticatedRoute><OptimizedProfileView /></AuthenticatedRoute>} />
              
              <Route path="workout/:workoutId" element={<WorkoutDetail />} />
              <Route path="program/:programId" element={<ProgramDetail />} />
              
              <Route path=":username/:workoutSlug" element={<CreatorWorkoutDetail />} />
              <Route path=":username/:programSlug" element={<CreatorProgramDetail />} />
              
              {/* Updated clubs routes with better organization */}
              <Route path="clubs" element={<AuthenticatedRoute><ClubsHome /></AuthenticatedRoute>} />
              <Route path="clubs/create" element={<AuthenticatedRoute><CreateEvent type="club" /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId" element={<AuthenticatedRoute><ClubDetailPage /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/events/create" element={<AuthenticatedRoute><CreateEvent type="event" /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/events/:eventId" element={<AuthenticatedRoute><EventDetailScreen /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/channels/create" element={<AuthenticatedRoute><CreateEvent type="channel" /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/channels/:channelId" element={<AuthenticatedRoute><ClubDetailPage initialTab="channels" /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/members" element={<AuthenticatedRoute><ClubDetailPage initialTab="members" /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/settings" element={<AuthenticatedRoute><ClubDetailPage initialTab="settings" /></AuthenticatedRoute>} />
              <Route path="clubs/:clubId/shared" element={<AuthenticatedRoute><ClubDetailPage initialTab="shared" /></AuthenticatedRoute>} />

              <Route path="liked" element={<Liked />} />
              <Route path="sheets" element={<AuthenticatedRoute><Sheets /></AuthenticatedRoute>} />
              <Route path="profile" element={<AuthenticatedRoute><Profile /></AuthenticatedRoute>} />
              <Route path="exercises/create" element={<AuthenticatedRoute><CreateExercise /></AuthenticatedRoute>} />
              <Route path="exercises/edit/:id" element={<AuthenticatedRoute><EditExercise /></AuthenticatedRoute>} />
              <Route path="purchase/success" element={<PurchaseSuccess />} />
              <Route path="purchase/cancel" element={<PurchaseCancel />} />
              <Route path="leaderboards" element={<Leaderboards />} />
              <Route path="creator" element={<AuthenticatedRoute><CreatorDashboard /></AuthenticatedRoute>} />
              <Route path="workout-logger" element={<AuthenticatedRoute><WorkoutLogger /></AuthenticatedRoute>} />
              <Route path="workout-logger/:workoutId" element={<AuthenticatedRoute><WorkoutLogger /></AuthenticatedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
        <Toaster position="top-center" />
      </DndProvider>
    </AppProviders>
  );
}

export default App;
