import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1>🎓 Student Management System</h1>
          <p className="welcome-subtitle">
            Comprehensive school management solution for administrators, teachers, students, and parents
          </p>
        </div>

        <div className="welcome-features">
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍💼</div>
              <h3>For Administrators</h3>
              <p>Manage students, teachers, classes, and generate comprehensive reports</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>For Teachers</h3>
              <p>Track attendance, manage grades, and communicate with students</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👨‍🎓</div>
              <h3>For Students</h3>
              <p>View grades, attendance, assignments, and stay updated with announcements</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👨‍👩‍👧</div>
              <h3>For Parents</h3>
              <p>Monitor your child's progress, attendance, and communicate with teachers</p>
            </div>
          </div>
        </div>

        <div className="welcome-actions">
          <Link to="/login" className="btn btn-primary btn-lg">
            Sign In
          </Link>
          <Link to="/register" className="btn btn-secondary btn-lg">
            Create Account
          </Link>
        </div>

        <div className="demo-section">
          <h3>Try Demo Accounts</h3>
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
  );
};

export default Welcome;
