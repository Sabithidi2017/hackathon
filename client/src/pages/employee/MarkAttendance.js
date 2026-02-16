import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const MarkAttendance = () => {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching today status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setMessage(null);
    try {
      const response = await api.post('/attendance/checkin');
      setTodayStatus(response.data);
      setMessage({ type: 'success', text: 'Successfully checked in!' });
      fetchTodayStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to check in' 
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    setMessage(null);
    try {
      const response = await api.post('/attendance/checkout');
      setTodayStatus(response.data);
      setMessage({ type: 'success', text: 'Successfully checked out!' });
      fetchTodayStatus();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to check out' 
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div>
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Check in and out for today</p>
      </div>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="attendance-card">
        <h3>Current Time: {currentTime}</h3>
        
        <div style={{ marginBottom: '24px' }}>
          <div className="stat-card" style={{ marginBottom: '16px' }}>
            <h3>Check In Time</h3>
            <div className="value success">
              {todayStatus?.checkedIn ? formatTime(todayStatus.checkInTime) : 'Not Checked In'}
            </div>
          </div>
          
          <div className="stat-card" style={{ marginBottom: '16px' }}>
            <h3>Check Out Time</h3>
            <div className="value info">
              {todayStatus?.checkedOut ? formatTime(todayStatus.checkOutTime) : 'Not Checked Out'}
            </div>
          </div>

          <div className="stat-card">
            <h3>Current Status</h3>
            <span className={`status-badge ${todayStatus?.status}`} style={{ fontSize: '16px', padding: '8px 16px' }}>
              {todayStatus?.status === 'not-checked-in' ? 'Not Checked In' : todayStatus?.status}
            </span>
          </div>
        </div>

        <div className="attendance-buttons">
          <button 
            className="btn btn-success" 
            onClick={handleCheckIn}
            disabled={checkingIn || todayStatus?.checkedIn}
          >
            {checkingIn ? 'Checking In...' : todayStatus?.checkedIn ? 'Already Checked In' : 'Check In'}
          </button>
          
          <button 
            className="btn btn-danger" 
            onClick={handleCheckOut}
            disabled={checkingOut || !todayStatus?.checkedIn || todayStatus?.checkedOut}
          >
            {checkingOut ? 'Checking Out...' : !todayStatus?.checkedIn ? 'Check In First' : todayStatus?.checkedOut ? 'Already Checked Out' : 'Check Out'}
          </button>
        </div>
      </div>

      <div className="attendance-card">
        <h3>Instructions</h3>
        <ul style={{ paddingLeft: '20px', color: '#4b5563' }}>
          <li style={{ marginBottom: '8px' }}>Click "Check In" when you arrive at work</li>
          <li style={{ marginBottom: '8px' }}>Click "Check Out" when you leave work</li>
          <li style={{ marginBottom: '8px' }}>Late arrivals (after 9:15 AM) will be marked as "Late"</li>
          <li style={{ marginBottom: '8px' }}>Working less than 4 hours will be marked as "Half Day"</li>
        </ul>
      </div>
    </div>
  );
};

export default MarkAttendance;
