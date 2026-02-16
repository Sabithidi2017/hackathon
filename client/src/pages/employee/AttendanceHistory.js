import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyRes, summaryRes] = await Promise.all([
        api.get(`/attendance/my-history?month=${month}&year=${year}`),
        api.get(`/attendance/my-summary?month=${month}&year=${year}`)
      ]);
      setAttendance(historyRes.data);
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

  // Generate calendar days
  const generateCalendarDays = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push({ empty: true });
    }
    
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i);
      const dateStr = date.toISOString().split('T')[0];
      const record = attendance.find(a => {
        const recordDate = new Date(a.date).toISOString().split('T')[0];
        return recordDate === dateStr;
      });
      
      days.push({
        day: i,
        date: dateStr,
        status: record?.status || 'no-record',
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

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
        <h1>My Attendance History</h1>
        <p>View your attendance records</p>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <h3>Filter by Month</h3>
        <div className="filter-group">
          <div className="form-group">
            <label>Month</label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
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

      {/* Calendar View */}
      <div className="attendance-card" style={{ marginBottom: '24px' }}>
        <h3>Calendar View</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '16px', textAlign: 'center', fontWeight: '600', color: '#6b7280' }}>
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>
        <div className="calendar-grid">
          {generateCalendarDays().map((day, index) => (
            <div
              key={index}
              className={`calendar-day ${day.empty ? 'empty' : day.status} ${day.isToday ? 'today' : ''}`}
              style={{ padding: '8px' }}
            >
              {!day.empty && (
                <>
                  <div style={{ fontWeight: '600' }}>{day.day}</div>
                  <div style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                    {day.status === 'present' ? 'P' : day.status === 'absent' ? 'A' : day.status === 'late' ? 'L' : day.status === 'half-day' ? 'HD' : ''}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#d1fae5' }}></div>
            <span style={{ fontSize: '12px' }}>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#fee2e2' }}></div>
            <span style={{ fontSize: '12px' }}>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#fef3c7' }}></div>
            <span style={{ fontSize: '12px' }}>Late</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#fed7aa' }}></div>
            <span style={{ fontSize: '12px' }}>Half Day</span>
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="table-container">
        <h3>Detailed View</h3>
        {attendance.length > 0 ? (
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
              {attendance.map((record) => (
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
            <h3>No attendance records</h3>
            <p>No records found for this month</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
