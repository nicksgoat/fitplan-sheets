
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import Library from "./pages/Library";
import Explore from "./pages/Explore";
import Sheets from "./pages/Sheets";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Liked from "./pages/Liked";
import Search from "./pages/Search";
import Schedule from "./pages/Schedule";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import CreateExercise from "./pages/CreateExercise";
import EditExercise from "./pages/EditExercise";
import { LibraryProvider } from "./contexts/LibraryContext";
import { AuthProvider } from "./hooks/useAuth";
import { ScheduleProvider } from "./contexts/ScheduleContext";

// Initialize the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LibraryProvider>
          <ScheduleProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<MainLayout />}>
                  <Route index element={<Index />} />
                  <Route path="library" element={<Library />} />
                  <Route path="explore" element={<Explore />} />
                  <Route path="sheets" element={<Sheets />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="liked" element={<Liked />} />
                  <Route path="search" element={<Search />} />
                  <Route path="schedule" element={<Schedule />} />
                  <Route path="profile" element={
                    <AuthenticatedRoute>
                      <Profile />
                    </AuthenticatedRoute>
                  } />
                  <Route path="create-exercise" element={<CreateExercise />} />
                  <Route path="edit-exercise/:id" element={<EditExercise />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ScheduleProvider>
        </LibraryProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
