import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 sidebar" style={{ width: '260px' }}>
      <div className="d-flex align-items-center mb-4 px-2 text-white">
        <i className="bi bi-wallet2 fs-3 text-primary me-2"></i>
        <div>
          <h5 className="fw-bold mb-0 text-white tracking-wide">SpendSmart</h5>
          <small className="text-secondary" style={{ fontSize: '0.75rem' }}>Expense & Budget Mgr</small>
        </div>
      </div>
      <hr className="text-secondary opacity-25 my-2" />
      <ul className="nav nav-pills flex-column mb-auto mt-2">
        <li className="nav-item">
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-speedometer2"></i>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/transactions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-arrow-left-right"></i>
            Transactions
          </NavLink>
        </li>
        <li>
          <NavLink to="/budgets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-piggy-bank"></i>
            Budgets & Limits
          </NavLink>
        </li>
        <li>
          <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-bar-chart-line"></i>
            Reports & Analytics
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <i className="bi bi-person-gear"></i>
            Settings
          </NavLink>
        </li>
      </ul>
      <hr className="text-secondary opacity-25 my-3" />
      <div className="d-flex align-items-center justify-content-between px-2">
        <div className="d-flex align-items-center overflow-hidden">
          <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '36px', height: '36px', fontWeight: 'bold' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-truncate">
            <div className="text-white fw-semibold small text-truncate">{user?.name || 'User'}</div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.7rem' }}>{user?.email}</div>
          </div>
        </div>
        <button className="btn btn-sm btn-outline-danger ms-2 border-0" title="Logout" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right fs-5"></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
