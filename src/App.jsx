import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './ProfilePage';
import DecksPage from './DecksPage';
import CardsPage from './pages/CardsPage';
import StudyPage from './pages/StudyPage';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/decks" 
            element={
              <ProtectedRoute>
                <DecksPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/decks/:deckId/cards" 
            element={
              <ProtectedRoute>
                <CardsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/decks/:deckId/study" 
            element={
              <ProtectedRoute>
                <StudyPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;