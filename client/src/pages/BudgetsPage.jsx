import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatCurrency, getMonthName } from '../utils/formatters';

const BudgetsPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Food',
    monthlyLimit: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
  });

  // Delete State
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/transactions/categories');
      setCategories(res.data.expenseCategories);
    } catch (err) {
      console.error('Error fetching categories');
    }
  };

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      setBudgets(res.data.budgets);
    } catch (err) {
      setError('Failed to load budgets for the chosen month.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: categories[0] || 'Food',
      monthlyLimit: '',
      month: selectedMonth,
      year: selectedYear,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b) => {
    setEditingId(b._id);
    setFormData({
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      month: b.month,
      year: b.year,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (Number(formData.monthlyLimit) <= 0) {
      setError('Budget limit must be a positive number.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/budgets/${editingId}`, formData);
        setSuccess('Budget updated successfully!');
      } else {
        await api.post('/budgets', formData);
        setSuccess('Budget created successfully!');
      }
      setShowModal(false);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/budgets/${deleteTargetId}`);
      setSuccess('Budget deleted successfully!');
      setDeleteTargetId(null);
      fetchBudgets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete budget.');
      setDeleteTargetId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Budget Management</h3>
          <p className="text-muted small mb-0">Set spending thresholds and prevent overspending</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(2000, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>

          <select
            className="form-select form-select-sm"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button className="btn btn-sm btn-primary text-nowrap" onClick={handleOpenAdd}>
            <i className="bi bi-plus-circle me-1"></i> Set New Budget
          </button>
        </div>
      </div>

      {/* Notifications */}
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

      {/* Budgets Grid */}
      {loading ? (
        <LoadingSpinner message="Calculating budget tracking..." />
      ) : budgets.length > 0 ? (
        <div className="row g-4">
          {budgets.map((b) => {
            const isExceeded = b.percentage >= 100;
            const isWarning = b.percentage >= 80 && !isExceeded;

            return (
              <div key={b._id} className="col-12 col-md-6 col-lg-4">
                <div
                  className={`card h-100 p-3 shadow-sm ${
                    isExceeded
                      ? 'budget-alert-card'
                      : isWarning
                      ? 'budget-warning-card'
                      : ''
                  }`}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{b.category}</h5>
                      <small className="text-muted">
                        {getMonthName(b.month)} {b.year}
                      </small>
                    </div>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-light"
                        title="Edit"
                        onClick={() => handleOpenEdit(b)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-light text-danger"
                        title="Delete"
                        onClick={() => setDeleteTargetId(b._id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="my-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">Spent:</span>
                      <span className="fw-semibold small">
                        {formatCurrency(b.spent)} of {formatCurrency(b.monthlyLimit)}
                      </span>
                    </div>

                    <div className="progress progress-budget">
                      <div
                        className={`progress-bar ${
                          isExceeded
                            ? 'bg-danger'
                            : isWarning
                            ? 'bg-warning'
                            : 'bg-primary'
                        }`}
                        role="progressbar"
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                        aria-valuenow={b.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                    <span className="small text-muted">
                      {isExceeded ? 'Exceeded by:' : 'Remaining:'}
                    </span>
                    <span
                      className={`fw-bold small ${
                        isExceeded ? 'text-danger' : 'text-success'
                      }`}
                    >
                      {isExceeded
                        ? formatCurrency(b.spent - b.monthlyLimit)
                        : formatCurrency(b.remaining)}
                    </span>
                  </div>

                  {/* Warning Pill */}
                  <div className="mt-3">
                    {isExceeded && (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle w-100 py-1">
                        <i className="bi bi-exclamation-octagon me-1"></i> Budget Exceeded (
                        {b.percentage}%)
                      </span>
                    )}
                    {isWarning && (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle w-100 py-1">
                        <i className="bi bi-exclamation-triangle me-1"></i> Approaching Limit (
                        {b.percentage}%)
                      </span>
                    )}
                    {!isExceeded && !isWarning && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle w-100 py-1">
                        <i className="bi bi-check2-circle me-1"></i> Within Budget ({b.percentage}
                        %)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={`No budgets set for ${getMonthName(selectedMonth)} ${selectedYear}`}
          description="Create a monthly budget limit for categories like Food, Transport, Rent, or Shopping to track your spending habits."
          icon="bi-piggy-bank"
          actionBtn={
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              Create Budget Limit
            </button>
          }
        />
      )}

      {/* Budget Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Category Budget' : 'Set Category Budget'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Expense Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      disabled={!!editingId}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {editingId && (
                      <small className="text-muted">Category cannot be altered for an existing budget.</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Monthly Spending Limit (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="form-control"
                        placeholder="e.g. 5000"
                        value={formData.monthlyLimit}
                        onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label fw-semibold small">Month</label>
                      <select
                        className="form-select"
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                        disabled={!!editingId}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label fw-semibold small">Year</label>
                      <select
                        className="form-select"
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        disabled={!!editingId}
                      >
                        {[2024, 2025, 2026, 2027].map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold px-4">
                    {editingId ? 'Update Budget' : 'Save Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={!!deleteTargetId}
        title="Confirm Budget Removal"
        message="Are you sure you want to remove this category budget limit? Spending history will remain untouched."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default BudgetsPage;
