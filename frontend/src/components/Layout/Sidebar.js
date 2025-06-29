import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/students', label: 'Students', icon: '👨‍🎓', roles: ['admin', 'teacher'] },
    { path: '/teachers', label: 'Teachers', icon: '👨‍🏫', roles: ['admin'] },
    { path: '/classes', label: 'Classes', icon: '🏫', roles: ['admin', 'teacher'] },
    { path: '/subjects', label: 'Subjects', icon: '📚', roles: ['admin', 'teacher'] },
    { path: '/attendance', label: 'Attendance', icon: '📋', roles: ['admin', 'teacher', 'student'] },
    { path: '/grades', label: 'Grades', icon: '📊', roles: ['admin', 'teacher', 'student'] },
    { path: '/fees', label: 'Fees', icon: '💰', roles: ['admin', 'student', 'parent'] },
    { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'teacher'] },
    { path: '/profile', label: 'Profile', icon: '👤', roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {filteredMenuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
