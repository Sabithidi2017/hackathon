import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/dashboard/manager');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const { totalEmployees, todayAttendance, weeklyTrend, departmentStats, absentEmployees } = dashboardData || {};

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <div className="page-header">
        <h1>Manager Dashboard</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      {/* Today's Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Employees</h3>
          <div className="value">{totalEmployees || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Present Today</h3>
          <div className="value success">{todayAttendance?.present || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Absent Today</h3>
          <div className="value danger">{todayAttendance?.absent || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Late Arrivals</h3>
          <div className="value warning">{todayAttendance?.late || 0}</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Weekly Trend Chart */}
        <div className="chart-container">
          <h3>Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="present" name="Present" fill="#10b981" />
              <Bar dataKey="late" name="Late" fill="#f59e0b" />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department-wise Chart */}
        <div className="chart-container">
          <h3>Department-wise Attendance</h3>
          {departmentStats && departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentStats}
                  dataKey="present"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ department, present }) => `${department}: ${present}`}
                >
                  {departmentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <h3>No department data</h3>
            </div>
          )}
        </div>
      </div>

      {/* Absent Employees Today */}
      <div className="table-container">
        <h3>Absent Employees Today</h3>
        {absentEmployees && absentEmployees.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {absentEmployees.map((emp, index) => (
                <tr key={index}>
                  <td>{emp.name}</td>
                  <td>{emp.employeeId}</td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`status-badge ${emp.status}`}>
                      {emp.status === 'not-checked-in' ? 'Not Checked In' : emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h3>All employees present!</h3>
            <p>No absent employees today</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
