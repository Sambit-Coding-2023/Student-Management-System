import React, { useState, useEffect } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuth();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting login form...');
    
    const result = await login(formData.email, formData.password);
    console.log('Login result:', result);
    console.log('isAuthenticated after login:', isAuthenticated);
    
    setIsLoading(false);
    
    if (!result.success) {
      console.log('Login failed:', result.error);
      // Error is handled by the context
    } else {
      console.log('Login successful, redirecting manually...');
      // Force redirect manually
      window.location.href = '/dashboard';
    }
  };

  console.log('Login component render - isAuthenticated:', isAuthenticated, 'loading:', isLoading);

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Student Management System</h1>
          <h2>Sign In</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-lg login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <div className="auth-links">
            <p>
              Don't have an account? 
              <Link to="/register" className="auth-link"> Sign up here</Link>
            </p>
          </div>
          
          <div className="demo-credentials">
            <h4>Demo Credentials:</h4>
            <p><strong>Admin:</strong> admin@school.com / admin123</p>
            <p><strong>Teacher:</strong> teacher@school.com / teacher123</p>
            <p><strong>Student:</strong> student@school.com / student123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
