import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MyStoriesPage from './pages/MyStoriesPage';
import ProfilePage from './pages/ProfilePage';
import StoryPage from './pages/StoryPage';
import AuthProvider from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-boho-cream bg-boho-pattern">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/my-stories" element={<MyStoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/story/:id" element={<StoryPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;