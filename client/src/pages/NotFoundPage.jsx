import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center p-4 bg-light">
      <div className="text-primary mb-3">
        <i className="bi bi-exclamation-diamond" style={{ fontSize: '4rem' }}></i>
      </div>
      <h1 className="fw-bold display-4 text-dark">404</h1>
      <h4 className="fw-semibold text-secondary mb-3">Page Not Found</h4>
      <p className="text-muted mb-4" style={{ maxWidth: '400px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary px-4">
        <i className="bi bi-house-door me-2"></i> Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
