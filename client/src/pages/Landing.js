import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const Landing = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('employee');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } else {
      const result = await register({ name, email, password, role, department });
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px 50px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#fff'
          }}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWR3TGkgjecx3-2hSEku1qSdmWyFC6aXUNWA&s" alt="Logo" style={{ width: '50px', height: '50px' }} />
          </div>
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: '600' }}>MD BILAL TECH</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <a href="#home" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', fontSize: '14px' }}>Home</a>
          <a href="#contact" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none', fontSize: '14px' }}>Contact</a>
          <button 
            onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div id="home" style={{
        minHeight: '100vh',
        backgroundImage: 'url(https://d2clawv67efefq.cloudfront.net/ccbp-static-website/seabg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 50px 50px'
      }}>
        <div style={{ maxWidth: '700px' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '700',
            color: 'rgb(70, 11, 152)',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}>
            Smart Employee Attendance System
          </h1>
          <p style={{
            color: '#fffafa',
            fontSize: '18px',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Track your team's attendance effortlessly with our modern, automated solution. 
            Real-time monitoring, detailed reports, and seamless integration for better workforce management.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              style={{
                padding: '16px 32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>



      {/* Contact Section */}
      <div id="contact" style={{ padding: '80px 50px', background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '36px', marginBottom: '20px' }}>Get In Touch</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', marginBottom: '40px' }}>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {[
              { icon: '📧', label: 'Email', value: 'support@bilal.com' },
              { icon: '📞', label: 'Phone', value: '+91 1234567890' },
              { icon: '📍', label: 'Address', value: 'Chennai, India' }
            ].map((item, i) => (
              <div key={i} style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{item.icon}</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ color: '#fff', fontSize: '14px' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: '30px 50px', background: '#020617', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
          © 2003 By Mohamed Bilal. Created with MERN Stack. All rights reserved.
        </p>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)'
        }} onClick={() => setShowAuthModal(false)}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            borderRadius: '20px',
            padding: '40px',
            width: '100%',
            maxWidth: '420px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ color: '#fff', fontSize: '24px', textAlign: 'center', marginBottom: '8px' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center', marginBottom: '30px', fontSize: '14px' }}>
              {isLogin ? 'Sign in to your account' : 'Register for attendance system'}
            </p>

            {/* Toggle Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px', padding: '4px' }}>
              <button onClick={() => setIsLogin(true)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                background: isLogin ? '#4f46e5' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '600'
              }}>Login</button>
              <button onClick={() => setIsLogin(false)} style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                background: !isLogin ? '#4f46e5' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: '600'
              }}>Register</button>
            </div>

            {error && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required={!isLogin}
                  style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', marginBottom: '16px', fontSize: '14px' }} />
              )}
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', marginBottom: '16px', fontSize: '14px' }} />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', marginBottom: '16px', fontSize: '14px' }} />
              
              {!isLogin && (
                <>
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={!isLogin}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', marginBottom: '16px', fontSize: '14px' }} />
                  <select value={role} onChange={e => setRole(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', marginBottom: '16px', fontSize: '14px', cursor: 'pointer' }}>
                    <option value="employee" style={{ background: '#1e293b' }}>Employee</option>
                    <option value="manager" style={{ background: '#1e293b' }}>Manager</option>
                  </select>
                  <input type="text" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)}
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(255, 255, 255, 0.1)', color: '#fff', marginBottom: '24px', fontSize: '14px' }} />
                </>
              )}

              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '16px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none', color: '#fff', fontSize: '16px', fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1
              }}>
                {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <button onClick={() => setShowAuthModal(false)} style={{
              position: 'absolute', top: '20px', right: '20px',
              background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '24px', cursor: 'pointer'
            }}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
