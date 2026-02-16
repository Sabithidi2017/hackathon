import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AllAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: new Date().toISOString().split('T')[0],
    status: '',
    employeeId: '',
    department: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters.date, filters.status, filters.employeeId, filters.department]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('date', filters.date);
      if (filters.status) params.append('status', filters.status);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.department) params.append('department', filters.department);

      const [attendanceRes, summaryRes] = await Promise.all([
        api.get(`/attendance/all?${params.toString()}`),
        api.get('/attendance/summary')
      ]);
      setAttendance(attendanceRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.date) params.append('startDate', filters.date);
      if (filters.date) params.append('endDate', filters.date);
      
      const response = await api.get(`/attendance/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>All Employees Attendance</h1>
        <p>View and manage team attendance</p>
      </div>

      {/* Filters */}
      <div className="filter-section">
        <h3>Filter Options</h3>
        <div className="filter-group">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="HR">HR</option>
            </select>
          </div>
          <button className="btn btn-secondary" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Present</h3>
            <div className="value success">{summary.present}</div>
          </div>
          <div className="stat-card">
            <h3>Absent</h3>
            <div className="value danger">{summary.absent}</div>
          </div>
          <div className="stat-card">
            <h3>Late</h3>
            <div className="value warning">{summary.late}</div>
          </div>
          <div className="stat-card">
            <h3>Half Day</h3>
            <div className="value info">{summary['half-day'] || 0}</div>
          </div>
          <div className="stat-card">
            <h3>Total Hours</h3>
            <div className="value">{summary.totalHours?.toFixed(1) || 0}h</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <h3>Attendance Records</h3>
        {attendance.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td>{record.User?.name || 'Unknown'}</td>
                  <td>{record.User?.employeeId || '-'}</td>
                  <td>{record.User?.department || '-'}</td>
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
            <h3>No attendance records</h3>
            <p>No records found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAttendance;
