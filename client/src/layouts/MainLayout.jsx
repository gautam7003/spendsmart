import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, backgroundColor: 'var(--neutral-bg)' }}>
        <header className="navbar navbar-expand-lg bg-white border-bottom px-4 py-3 sticky-top">
          <div className="container-fluid px-0">
            <span className="navbar-brand mb-0 h6 fw-semibold text-secondary">
              MCA Technical Training Project Demonstration
            </span>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-light text-dark border">
                <i className="bi bi-currency-rupee me-1 text-primary"></i>
                Currency: INR (₹)
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle">
                <i className="bi bi-shield-check me-1"></i>
                JWT Protected
              </span>
            </div>
          </div>
        </header>
        <main className="p-4 flex-grow-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
