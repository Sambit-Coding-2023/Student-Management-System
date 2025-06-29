import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './components/Home';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students/Students';
import Teachers from './pages/Teachers/Teachers';
import Classes from './pages/Classes/Classes';
import Subjects from './pages/Subjects/Subjects';
import Attendance from './pages/Attendance/Attendance';
import Grades from './pages/Grades/Grades';
import Fees from './pages/Fees/Fees';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Students />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teachers/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Teachers />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classes/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Classes />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Subjects />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Attendance />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/grades/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Grades />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees/*"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Fees />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Reports />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default App;
