import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="hero-section">
          <h1 className="hero-title">Student Management System</h1>
          <p className="hero-subtitle">
            Streamline your educational institution with our comprehensive management platform
          </p>
          <div className="hero-features">
            <div className="feature">
              <i className="icon">👥</i>
              <span>Manage Students & Teachers</span>
            </div>
            <div className="feature">
              <i className="icon">📚</i>
              <span>Track Attendance & Grades</span>
            </div>
            <div className="feature">
              <i className="icon">💰</i>
              <span>Handle Fees & Payments</span>
            </div>
            <div className="feature">
              <i className="icon">📊</i>
              <span>Generate Reports</span>
            </div>
          </div>
        </div>
        
        <div className="auth-section">
          <h2>Get Started</h2>
          <div className="auth-buttons">
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-outline">
              Create Account
            </Link>
          </div>
          
          <div className="demo-info">
            <h3>Demo Accounts</h3>
            <div className="demo-accounts">
              <div className="demo-account">
                <strong>Admin:</strong> admin@school.com / admin123
              </div>
              <div className="demo-account">
                <strong>Teacher:</strong> teacher@school.com / teacher123
              </div>
              <div className="demo-account">
                <strong>Student:</strong> student@school.com / student123
              </div>
              <div className="demo-account">
                <strong>Parent:</strong> parent@school.com / parent123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
