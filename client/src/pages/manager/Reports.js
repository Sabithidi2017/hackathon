import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Reports = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    employeeId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);

      const response = await api.get(`/attendance/all?${params.toString()}`);
      setAttendance(response.data);

      // Calculate summary
      if (response.data.length > 0) {
        const present = response.data.filter(a => a.status === 'present').length;
        const absent = response.data.filter(a => a.status === 'absent').length;
        const late = response.data.filter(a => a.status === 'late').length;
        const halfDay = response.data.filter(a => a.status === 'half-day').length;
        const totalHours = response.data.reduce((sum, a) => sum + (a.totalHours || 0), 0);

        setSummary({ present, absent, late, 'half-day': halfDay, totalHours });
      } else {
        setSummary({ present: 0, absent: 0, late: 0, 'half-day': 0, totalHours: 0 });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      
      const response = await api.get(`/attendance/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = `attendance_report_${filters.startDate}_${filters.endDate}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Attendance Reports</h1>
        <p>Generate and export attendance reports</p>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Select Date Range</h3>
        <div className="filter-group">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Employee ID (Optional)</label>
            <input
              type="text"
              value={filters.employeeId}
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              placeholder="e.g., EMP001"
            />
          </div>
          <button className="btn btn-primary" onClick={fetchData} disabled={loading}>
            {loading ? 'Loading...' : 'Generate Report'}
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
            <div className="value info">{summary['half-day']}</div>
          </div>
          <div className="stat-card">
            <h3>Total Hours</h3>
            <div className="value">{summary.totalHours?.toFixed(1) || 0}h</div>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="table-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: 0 }}>Attendance Report</h3>
          {attendance.length > 0 && (
            <button className="btn btn-secondary" onClick={handleExport}>
              Export to CSV
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : attendance.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
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
                  <td>{formatDate(record.date)}</td>
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
            <h3>No records found</h3>
            <p>Select a date range and click "Generate Report" to view data</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
