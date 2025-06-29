import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Profile</h2>
      </div>
      
      <div className="profile-info">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <p>{user?.firstName} {user?.lastName}</p>
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <p>{user?.email}</p>
        </div>
        
        <div className="form-group">
          <label className="form-label">Role</label>
          <p className="badge badge-info">{user?.role?.toUpperCase()}</p>
        </div>
        
        {user?.studentId && (
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <p>{user.studentId}</p>
          </div>
        )}
        
        {user?.employeeId && (
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <p>{user.employeeId}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
