
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import CreateExercise from "./pages/CreateExercise";
import EditExercise from "./pages/EditExercise";
import { LibraryProvider } from "./contexts/LibraryContext";

function App() {
  return (
    <LibraryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="library" element={<Library />} />
            <Route path="explore" element={<Explore />} />
            <Route path="sheets" element={<Sheets />} />
            <Route path="auth" element={<Auth />} />
            <Route path="liked" element={<Liked />} />
            <Route path="search" element={<Search />} />
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
    </LibraryProvider>
  );
}

export default App;
