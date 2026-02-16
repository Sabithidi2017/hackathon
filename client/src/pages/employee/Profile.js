import React from 'react';
import useAuthStore from '../../store/useAuthStore';

const Profile = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>View your profile information</p>
      </div>

      <div className="profile-info">
        <h3>Personal Information</h3>
        
        <div className="profile-item">
          <label>Full Name</label>
          <span>{user?.name}</span>
        </div>
        
        <div className="profile-item">
          <label>Email</label>
          <span>{user?.email}</span>
        </div>
        
        <div className="profile-item">
          <label>Role</label>
          <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
        </div>
        
        {user?.employeeId && (
          <div className="profile-item">
            <label>Employee ID</label>
            <span>{user.employeeId}</span>
          </div>
        )}
        
        {user?.department && (
          <div className="profile-item">
            <label>Department</label>
            <span>{user.department}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
