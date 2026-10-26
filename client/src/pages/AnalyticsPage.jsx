import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatCard from '../components/StatCard';
import { formatCurrency, getMonthName } from '../utils/formatters';

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
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [monthlyData, setMonthlyData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const [resMonthly, resCat] = await Promise.all([
        api.get(`/analytics/monthly?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/categories?month=${selectedMonth}&year=${selectedYear}`),
      ]);
      setMonthlyData(resMonthly.data);
      setCategoryData(resCat.data);
    } catch (err) {
      setError('Failed to fetch analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth, selectedYear]);

  // Doughnut Chart for Categories
  const catLabels = categoryData?.categories?.map((c) => c.category) || [];
  const catAmounts = categoryData?.categories?.map((c) => c.amount) || [];
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#64748b', '#f97316'
  ];

  const catChartData = {
    labels: catLabels,
    datasets: [
      {
        data: catAmounts,
        backgroundColor: colors.slice(0, catLabels.length),
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart comparing Current vs Previous Month
  const comparisonBarData = {
    labels: [
      `${getMonthName(monthlyData?.previousMonth?.month || 1)} (Prev)`,
      `${getMonthName(monthlyData?.currentMonth?.month || 1)} (Current)`
    ],
    datasets: [
      {
        label: 'Income (₹)',
        data: [
          monthlyData?.previousMonth?.income || 0,
          monthlyData?.currentMonth?.income || 0
        ],
        backgroundColor: '#10b981',
      },
      {
        label: 'Expense (₹)',
        data: [
          monthlyData?.previousMonth?.expenses || 0,
          monthlyData?.currentMonth?.expenses || 0
        ],
        backgroundColor: '#ef4444',
      },
    ],
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Reports & Analytics</h3>
          <p className="text-muted small mb-0">Monthly comparison and categorical expense distribution</p>
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
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <LoadingSpinner message="Generating analytics charts..." />
      ) : (
        <>
          {/* Key Analytics Summary Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Highest Expense Category"
                amount={monthlyData?.currentMonth?.highestCategory || 'N/A'}
                icon="bi-trophy"
                bgVariant="danger"
                subtitle={`Peak: ${formatCurrency(monthlyData?.currentMonth?.highestSpend || 0)}`}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Total Monthly Spend"
                amount={formatCurrency(monthlyData?.currentMonth?.expenses || 0)}
                icon="bi-credit-card-2-front"
                bgVariant="secondary"
                subtitle={`${monthlyData?.currentMonth?.transactionCount || 0} Transactions`}
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Month-over-Month Expense"
                amount={`${monthlyData?.comparisons?.expenseChangePct > 0 ? '+' : ''}${monthlyData?.comparisons?.expenseChangePct || 0}%`}
                icon={monthlyData?.comparisons?.expenseChangePct > 0 ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'}
                bgVariant={monthlyData?.comparisons?.expenseChangePct > 0 ? 'danger' : 'success'}
                subtitle="Compared to previous month"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="Net Savings"
                amount={formatCurrency(monthlyData?.currentMonth?.balance || 0)}
                icon="bi-piggy-bank"
                bgVariant={(monthlyData?.currentMonth?.balance || 0) >= 0 ? 'success' : 'warning'}
                subtitle={(monthlyData?.currentMonth?.balance || 0) >= 0 ? 'Positive Cash Flow' : 'Deficit Cash Flow'}
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="row g-4 mb-4">
            {/* Previous vs Current Month Comparison */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="fw-bold mb-0">Previous vs. Current Month Comparison</h6>
                </div>
                <div className="card-body" style={{ height: '320px' }}>
                  <Bar
                    data={comparisonBarData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: { callback: (v) => `₹${v}` },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Doughnut Chart */}
            <div className="col-12 col-lg-6">
              <div className="card h-100">
                <div className="card-header">
                  <h6 className="fw-bold mb-0">Expense Share by Category</h6>
                </div>
                <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '320px' }}>
                  {catLabels.length > 0 ? (
                    <div style={{ width: '250px', height: '250px' }}>
                      <Doughnut
                        data={catChartData}
                        options={{
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom' } },
                        }}
                      />
                    </div>
                  ) : (
                    <EmptyState
                      title="No categorical expenses"
                      description="Add expenses for this month to visualize category breakdown."
                      icon="bi-pie-chart"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Categorical Breakdown Table */}
          <div className="card">
            <div className="card-header">
              <h6 className="fw-bold mb-0">Categorical Spending Table</h6>
            </div>
            <div className="card-body p-0">
              {categoryData?.categories && categoryData.categories.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Category</th>
                        <th>Transaction Count</th>
                        <th>Total Spent</th>
                        <th>Share of Expenses</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryData.categories.map((item, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{item.category}</td>
                          <td>{item.count} items</td>
                          <td className="fw-bold text-dark">{formatCurrency(item.amount)}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                <div
                                  className="progress-bar bg-primary"
                                  role="progressbar"
                                  style={{ width: `${item.percentage}%` }}
                                ></div>
                              </div>
                              <span className="small text-muted" style={{ width: '45px' }}>
                                {item.percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="No data available"
                  description="No recorded transactions found for this period."
                  icon="bi-table"
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
