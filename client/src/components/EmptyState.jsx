import React from 'react';

const EmptyState = ({ title = 'No records found', description = 'There is no data to display right now.', icon = 'bi-inbox', actionBtn }) => {
  return (
    <div className="text-center py-5 px-3">
      <div className="text-muted mb-3">
        <i className={`bi ${icon}`} style={{ fontSize: '3rem' }}></i>
      </div>
      <h5 className="fw-semibold text-secondary">{title}</h5>
      <p className="text-muted mx-auto" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionBtn && <div className="mt-3">{actionBtn}</div>}
    </div>
  );
};

export default EmptyState;
