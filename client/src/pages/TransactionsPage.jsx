import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ incomeCategories: [], expenseCategories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('transactionDate');
  const [order, setOrder] = useState('desc');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get('/transactions/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  // Fetch Transactions with current filters
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter && categoryFilter !== 'All') params.append('category', categoryFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (search) params.append('search', search);
      params.append('sortBy', sortBy);
      params.append('order', order);

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.data.transactions);
    } catch (err) {
      setError('Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, startDate, endDate, search, sortBy, order]);

  // Open modal for new transaction
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      type: 'expense',
      amount: '',
      category: 'Food',
      description: '',
      transactionDate: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  // Open modal for editing transaction
  const handleOpenEdit = (tx) => {
    setEditingId(tx._id);
    setFormData({
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || '',
      transactionDate: tx.transactionDate ? tx.transactionDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  // Handle Create or Update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (Number(formData.amount) <= 0) {
      setError('Amount must be a positive number.');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, formData);
        setSuccess('Transaction updated successfully!');
      } else {
        await api.post('/transactions', formData);
        setSuccess('Transaction added successfully!');
      }
      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/transactions/${deleteTargetId}`);
      setSuccess('Transaction deleted successfully!');
      setDeleteTargetId(null);
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      setDeleteTargetId(null);
    }
  };

  const activeCategoryList =
    formData.type === 'income'
      ? categories.incomeCategories
      : categories.expenseCategories;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Transaction History</h3>
          <p className="text-muted small mb-0">Record, filter, search, and manage financial transactions</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <i className="bi bi-plus-circle me-2"></i> Add New Transaction
        </button>
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

      {/* Filter Toolbar Card */}
      <div className="card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search notes/description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCategoryFilter('');
              }}
            >
              <option value="">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {typeFilter !== 'expense' &&
                categories.incomeCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              {typeFilter !== 'income' &&
                categories.expenseCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control form-control-sm"
              title="From Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control form-control-sm"
              title="To Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-1">
            <button
              className="btn btn-sm btn-outline-secondary w-100"
              title="Reset Filters"
              onClick={() => {
                setTypeFilter('');
                setCategoryFilter('');
                setStartDate('');
                setEndDate('');
                setSearch('');
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-secondary">
            Total Records: <strong className="text-dark">{transactions.length}</strong>
          </span>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Sort:</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
              }}
            >
              <option value="transactionDate-desc">Date (Newest first)</option>
              <option value="transactionDate-asc">Date (Oldest first)</option>
              <option value="amount-desc">Amount (Highest first)</option>
              <option value="amount-asc">Amount (Lowest first)</option>
            </select>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <LoadingSpinner message="Fetching transactions..." />
          ) : transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th className="text-end">Amount</th>
                    <th className="text-center" style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td className="small text-muted">{formatDate(tx.transactionDate)}</td>
                      <td>
                        <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="fw-semibold small">{tx.category}</td>
                      <td className="text-muted small">{tx.description || '—'}</td>
                      <td className={`text-end fw-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            title="Edit Transaction"
                            onClick={() => handleOpenEdit(tx)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            title="Delete Transaction"
                            onClick={() => setDeleteTargetId(tx._id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No transactions match your criteria"
              description="Try adjusting your filters or record a new transaction using the button above."
              icon="bi-receipt"
              actionBtn={
                <button className="btn btn-sm btn-primary" onClick={handleOpenAdd}>
                  Add Transaction
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* Add / Edit Transaction Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">
                  {editingId ? 'Edit Transaction' : 'Record New Transaction'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body py-3">
                  {/* Type Selector */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Transaction Type</label>
                    <div className="btn-group w-100" role="group">
                      <input
                        type="radio"
                        className="btn-check"
                        name="txType"
                        id="type-expense"
                        autoComplete="off"
                        checked={formData.type === 'expense'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            type: 'expense',
                            category: categories.expenseCategories[0] || 'Food',
                          })
                        }
                      />
                      <label className="btn btn-outline-danger" htmlFor="type-expense">
                        <i className="bi bi-arrow-up-right me-1"></i> Expense
                      </label>

                      <input
                        type="radio"
                        className="btn-check"
                        name="txType"
                        id="type-income"
                        autoComplete="off"
                        checked={formData.type === 'income'}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            type: 'income',
                            category: categories.incomeCategories[0] || 'Salary',
                          })
                        }
                      />
                      <label className="btn btn-outline-success" htmlFor="type-income">
                        <i className="bi bi-arrow-down-left me-1"></i> Income
                      </label>
                    </div>
                  </div>

                  {/* Amount Field */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Amount (₹)</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Category Field */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {activeCategoryList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Field */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Transaction Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.transactionDate}
                      onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                      required
                    />
                  </div>

                  {/* Description Field */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description / Note</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Grocery items from D-Mart"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold px-4">
                    {editingId ? 'Save Changes' : 'Save Transaction'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        show={!!deleteTargetId}
        title="Confirm Transaction Deletion"
        message="Are you sure you want to delete this transaction record? This action will immediately adjust your financial balance and cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default TransactionsPage;
