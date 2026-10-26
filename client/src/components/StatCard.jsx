import React from 'react';

const StatCard = ({ title, amount, icon, bgVariant = 'primary', subtitle }) => {
  return (
    <div className="card stat-card h-100 p-3">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <span className="text-muted text-uppercase fw-semibold" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
          {title}
        </span>
        <div className={`stat-icon-wrapper bg-${bgVariant}-subtle text-${bgVariant}`}>
          <i className={`bi ${icon}`}></i>
        </div>
      </div>
      <h3 className="fw-bold mb-1">{amount}</h3>
      {subtitle && <small className="text-muted">{subtitle}</small>}
    </div>
  );
};

export default StatCard;
