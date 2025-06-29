import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const Students = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentsList />} />
      <Route path="/new" element={<NewStudent />} />
      <Route path="/:id" element={<StudentDetail />} />
    </Routes>
  );
};

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/users?role=student&search=${search}`);
      setStudents(response.data.users);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="students-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Students Management</h2>
          {user?.role === 'admin' && (
            <Link to="/students/new" className="btn btn-primary">
              Add New Student
            </Link>
          )}
        </div>
        
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Class</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.studentId}</td>
                  <td>{student.firstName} {student.lastName}</td>
                  <td>{student.email}</td>
                  <td>{student.class?.name || 'Not assigned'}</td>
                  <td>
                    <span className={`badge ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/students/${student.id}`} className="btn btn-sm btn-secondary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const NewStudent = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { ...formData, role: 'student' });
      // Redirect to students list
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Add New Student</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">First Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            className="form-control"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary">
          Create Student
        </button>
      </form>
    </div>
  );
};

const StudentDetail = () => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Student Details</h2>
      </div>
      <p>Student detail view will be implemented here.</p>
    </div>
  );
};

export default Students;
