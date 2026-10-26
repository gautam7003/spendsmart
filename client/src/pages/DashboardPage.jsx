import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/dashboard/summary?month=${selectedMonth}&year=${selectedYear}`);
      setSummaryData(res.data);
    } catch (err) {
      setError('Failed to fetch dashboard data. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  // Bar Chart Configuration: Monthly Income vs Expenses Trend
  const barChartData = {
    labels: summaryData?.chartData?.labels || [],
    datasets: [
      {
        label: 'Income (₹)',
        data: summaryData?.chartData?.income || [],
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Expense (₹)',
        data: summaryData?.chartData?.expenses || [],
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `₹${value}`,
        },
      },
    },
  };

  // Doughnut Chart Configuration: Expense by Category
  const categoryLabels = summaryData?.categoryExpenses?.map((c) => c.category) || [];
  const categoryAmounts = summaryData?.categoryExpenses?.map((c) => c.amount) || [];
  const doughnutColors = [
    '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6',
    '#6366f1', '#14b8a6', '#f97316', '#64748b'
  ];

  const doughnutData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryAmounts,
        backgroundColor: doughnutColors.slice(0, categoryLabels.length),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Financial Dashboard</h3>
          <p className="text-muted small mb-0">Overview of income, expenses, and budget utilization</p>
        </div>

        {/* Date Filter & Action Buttons */}
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

          <Link to="/transactions" className="btn btn-sm btn-primary text-nowrap">
            <i className="bi bi-plus-circle me-1"></i> Add Transaction
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Budget Alerts Banner */}
      {summaryData?.budgetAlerts && summaryData.budgetAlerts.length > 0 && (
        <div className="mb-4">
          {summaryData.budgetAlerts.map((alert, idx) => (
            <div
              key={idx}
              className={`alert ${
                alert.status === 'exceeded' ? 'alert-danger budget-alert-card' : 'alert-warning budget-warning-card'
              } d-flex align-items-center justify-content-between mb-2 shadow-sm`}
            >
              <div className="d-flex align-items-center">
                <i className={`bi ${alert.status === 'exceeded' ? 'bi-exclamation-octagon-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`}></i>
                <span className="fw-medium">{alert.message}</span>
              </div>
              <Link to="/budgets" className="btn btn-sm btn-outline-dark">
                Review Budgets
              </Link>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Calculating dashboard statistics..." />
      ) : (
        <>
          {/* Summary Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Income"
                amount={formatCurrency(summaryData?.summary?.totalIncome || 0)}
                icon="bi-arrow-down-left-circle"
                bgVariant="success"
                subtitle="Inflow for selected month"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Expenses"
                amount={formatCurrency(summaryData?.summary?.totalExpenses || 0)}
                icon="bi-arrow-up-right-circle"
                bgVariant="danger"
                subtitle="Outflow for selected month"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Net Balance"
                amount={formatCurrency(summaryData?.summary?.balance || 0)}
                icon="bi-wallet2"
                bgVariant={(summaryData?.summary?.balance || 0) >= 0 ? 'primary' : 'warning'}
                subtitle="Income − Expenses"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Transactions"
                amount={summaryData?.summary?.transactionCount || 0}
                icon="bi-receipt"
                bgVariant="secondary"
                subtitle="Recorded this month"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-8">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">Income vs Expenses (6-Month Trend)</h6>
                  <span className="badge bg-light text-secondary">Bar Visualization</span>
                </div>
                <div className="card-body" style={{ height: '320px' }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">Expense Distribution</h6>
                  <span className="badge bg-light text-secondary">By Category</span>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '320px' }}>
                  {categoryLabels.length > 0 ? (
                    <div style={{ width: '240px', height: '240px' }}>
                      <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
                    </div>
                  ) : (
                    <EmptyState
                      title="No expense data"
                      description="No expense transactions found for this month."
                      icon="bi-pie-chart"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Budget Utilization & Recent Transactions Row */}
          <div className="row g-4">
            {/* Budget Utilization Summary */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">Category Budget Utilization</h6>
                  <Link to="/budgets" className="btn btn-sm btn-link text-decoration-none">
                    Manage
                  </Link>
                </div>
                <div className="card-body">
                  {summaryData?.budgetUtilization && summaryData.budgetUtilization.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {summaryData.budgetUtilization.map((b, idx) => (
                        <div key={idx}>
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-semibold small">{b.category}</span>
                            <span className="small text-muted">
                              {formatCurrency(b.spent)} / {formatCurrency(b.monthlyLimit)} ({b.percentage}%)
                            </span>
                          </div>
                          <div className="progress progress-budget">
                            <div
                              className={`progress-bar ${
                                b.percentage >= 100
                                  ? 'bg-danger'
                                  : b.percentage >= 80
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
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="No budgets set"
                      description="Set monthly spending limits for categories to prevent overspending."
                      icon="bi-piggy-bank"
                      actionBtn={
                        <Link to="/budgets" className="btn btn-sm btn-outline-primary">
                          Set Budgets
                        </Link>
                      }
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold mb-0">Recent Transactions</h6>
                  <Link to="/transactions" className="btn btn-sm btn-link text-decoration-none">
                    View All
                  </Link>
                </div>
                <div className="card-body p-0">
                  {summaryData?.recentTransactions && summaryData.recentTransactions.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Category & Note</th>
                            <th>Date</th>
                            <th className="text-end">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summaryData.recentTransactions.map((tx) => (
                            <tr key={tx._id}>
                              <td>
                                <div className="fw-semibold small">{tx.category}</div>
                                <div className="text-muted text-truncate" style={{ maxWidth: '180px', fontSize: '0.75rem' }}>
                                  {tx.description || 'No description'}
                                </div>
                              </td>
                              <td className="small text-muted">{formatDate(tx.transactionDate)}</td>
                              <td className={`text-end fw-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title="No transactions yet"
                      description="Click the Add Transaction button to log your first income or expense."
                      icon="bi-receipt"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
