import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/useAuthStore';

// Landing Page with Login/Register
import Landing from './pages/Landing';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MarkAttendance from './pages/employee/MarkAttendance';
import AttendanceHistory from './pages/employee/AttendanceHistory';
import Profile from './pages/employee/Profile';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import AllAttendance from './pages/manager/AllAttendance';
import Reports from './pages/manager/Reports';

// Layout
import Layout from './components/Layout';

// Loading component
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f3f4f6'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #e5e7eb',
      borderTopColor: '#4f46e5',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
  
  // Show loading while checking auth
  if (isCheckingAuth) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Redirect based on role
  if (!allowedRole) {
    if (user?.role === 'manager') {
      return <Navigate to="/manager" />;
    }
    return children;
  }
  
  if (user?.role !== allowedRole) {
    if (user?.role === 'manager') {
      return <Navigate to="/manager" />;
    }
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { checkAuth, isAuthenticated, isCheckingAuth } = useAuthStore();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Show loading screen while checking auth on initial load
  if (isCheckingAuth) {
    return <LoadingScreen />;
  }
  
  return (
    <Router>
      <Routes>
        {/* Public Routes - Landing Page */}
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
        
        {/* Employee Routes - Uses Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="mark-attendance" element={
            <ProtectedRoute allowedRole="employee">
              <MarkAttendance />
            </ProtectedRoute>
          } />
          <Route path="my-history" element={
            <ProtectedRoute allowedRole="employee">
              <AttendanceHistory />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Manager Routes - Uses same Layout */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRole="manager">
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={
            <ProtectedRoute allowedRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="all-attendance" element={
            <ProtectedRoute allowedRole="manager">
              <AllAttendance />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRole="manager">
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute allowedRole="manager">
              <Profile />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
