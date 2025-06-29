import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Student Management System</h2>
      </div>
      
      <div className="navbar-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={toggleDarkMode}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        <div className="user-menu">
          <span className="user-name">
            {user?.fullName || `${user?.firstName} ${user?.lastName}`}
          </span>
          <span className="user-role badge badge-info">
            {user?.role?.toUpperCase()}
          </span>
          <button 
            className="btn btn-danger btn-sm"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
