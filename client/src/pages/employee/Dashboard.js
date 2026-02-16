import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/employee');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const { todayStatus, monthSummary, recentAttendance } = dashboardData || {};

  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user?.name}!</h1>
        <p>Here's your attendance overview</p>
      </div>

      {/* Today's Status */}
      <div className="attendance-card">
        <h3>Today's Status</h3>
        <div className="stats-grid" style={{ marginBottom: '0' }}>
          <div className="stat-card">
            <h3>Check In</h3>
            <div className={`value ${todayStatus?.checkedIn ? 'success' : ''}`}>
              {todayStatus?.checkedIn ? formatTime(todayStatus.checkInTime) : 'Not Checked In'}
            </div>
          </div>
          <div className="stat-card">
            <h3>Check Out</h3>
            <div className={`value ${todayStatus?.checkedOut ? 'info' : ''}`}>
              {todayStatus?.checkedOut ? formatTime(todayStatus.checkOutTime) : 'Not Checked Out'}
            </div>
          </div>
          <div className="stat-card">
            <h3>Status</h3>
            <span className={`status-badge ${todayStatus?.status}`}>
              {todayStatus?.status === 'not-checked-in' ? 'Not Checked In' : todayStatus?.status}
            </span>
          </div>
        </div>
        <div className="quick-actions" style={{ marginTop: '24px' }}>
          <Link to="/mark-attendance" className="btn btn-success">
            Mark Attendance
          </Link>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Present Days</h3>
          <div className="value success">{monthSummary?.present || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Absent Days</h3>
          <div className="value danger">{monthSummary?.absent || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Late Arrivals</h3>
          <div className="value warning">{monthSummary?.late || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Hours</h3>
          <div className="value info">{monthSummary?.totalHours?.toFixed(1) || 0}h</div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="table-container">
        <h3>Recent Attendance (Last 7 Days)</h3>
        {recentAttendance && recentAttendance.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((record) => (
                <tr key={record.id}>
                  <td>{formatDate(record.date)}</td>
                  <td>{formatTime(record.checkInTime)}</td>
                  <td>{formatTime(record.checkOutTime)}</td>
                  <td>{record.totalHours ? `${record.totalHours}h` : '-'}</td>
                  <td>
                    <span className={`status-badge ${record.status}`}>
                      {record.status === 'not-checked-in' ? 'Not Checked In' : record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h3>No recent attendance</h3>
            <p>Start marking your attendance!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
