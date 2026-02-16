import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determine if we're on manager or employee dashboard
  const isManagerRoute = location.pathname.startsWith('/manager');
  const isManager = user?.role === 'manager' || isManagerRoute;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Attendance System</h2>
          <p>{user?.name}</p>
          <p style={{ textTransform: 'capitalize' }}>{user?.role}</p>
        </div>

        <nav className="sidebar-nav">
          {isManager ? (
            <>
              <NavLink to="/manager" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <span>📊</span> Dashboard
              </NavLink>
              <NavLink to="/manager/all-attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>👥</span> All Employees
              </NavLink>
              <NavLink to="/manager/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>📄</span> Reports
              </NavLink>
              <NavLink to="/manager/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>👤</span> Profile
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
                <span>📊</span> Dashboard
              </NavLink>
              <NavLink to="/dashboard/mark-attendance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>✅</span> Mark Attendance
              </NavLink>
              <NavLink to="/dashboard/my-history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>📅</span> My History
              </NavLink>
              <NavLink to="/dashboard/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span>👤</span> Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="logout-btn">
          <button className="btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
