import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword) {
      if (newPassword !== confirmNewPassword) {
        return setError('New passwords do not match.');
      }
      if (newPassword.length < 6) {
        return setError('New password must be at least 6 characters long.');
      }
      if (!currentPassword) {
        return setError('Current password is required to change your password.');
      }
    }

    try {
      setLoading(true);
      const res = await api.put('/auth/profile', {
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      updateUserProfile(res.data.user);
      setSuccess('Profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-1">Profile & Settings</h3>
        <p className="text-muted small mb-0">Manage your personal credentials and system preferences</p>
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">Personal Information</h5>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleUpdate}>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold small">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  value={user?.email || ''}
                  disabled
                  readOnly
                />
                <small className="text-muted">Unique account identifier</small>
              </div>
            </div>

            <hr className="my-4 text-muted" />

            <h6 className="fw-bold text-dark mb-3">Change Password</h6>
            <p className="text-muted small">Leave blank if you do not want to change your password.</p>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold small">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* System Settings & App Information */}
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="fw-bold mb-0">System Preferences</h5>
        </div>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Default Currency</label>
              <input type="text" className="form-control bg-light" value="INR (₹) - Indian Rupee" disabled readOnly />
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold small">Authentication Mechanism</label>
              <input type="text" className="form-control bg-light" value="JSON Web Token (JWT) Bearer" disabled readOnly />
            </div>

            <div className="col-12">
              <div className="alert alert-info py-2 small mb-0">
                <i className="bi bi-info-circle-fill me-2"></i>
                <strong>Student Academic Viva Note:</strong> User passwords are encrypted using one-way <strong>bcryptjs</strong> salt hashing with work factor 10. API routes strictly verify ownership via authenticated JWT payload.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
