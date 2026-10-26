const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard summary (income, expense, balance, recent transactions, monthly chart data, budget alerts)
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Transactions in selected month
    const monthTransactions = await Transaction.find({
      userId,
      transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ transactionDate: -1 });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryExpenseMap = {};

    monthTransactions.forEach((t) => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpenses += t.amount;
        categoryExpenseMap[t.category] = (categoryExpenseMap[t.category] || 0) + t.amount;
      }
    });

    const balance = totalIncome - totalExpenses;
    const transactionCount = monthTransactions.length;

    // 2. Recent transactions (last 5 overall)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(5);

    // 3. Budgets & alerts for selected month
    const budgets = await Budget.find({ userId, month, year });
    const budgetAlerts = [];
    const budgetUtilization = budgets.map((b) => {
      const spent = categoryExpenseMap[b.category] || 0;
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const roundedPercent = Math.round(percentage * 10) / 10;

      let status = 'normal';
      if (roundedPercent >= 100) {
        status = 'exceeded';
        budgetAlerts.push({
          category: b.category,
          status: 'exceeded',
          message: `Budget exceeded for ${b.category}! Spent ₹${spent.toLocaleString('en-IN')} of ₹${b.monthlyLimit.toLocaleString('en-IN')} (${roundedPercent}%).`,
        });
      } else if (roundedPercent >= 80) {
        status = 'warning';
        budgetAlerts.push({
          category: b.category,
          status: 'warning',
          message: `Budget warning for ${b.category}! Spent ${roundedPercent}% (₹${spent.toLocaleString('en-IN')} of ₹${b.monthlyLimit.toLocaleString('en-IN')}).`,
        });
      }

      return {
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.max(0, b.monthlyLimit - spent),
        percentage: roundedPercent,
        status,
      };
    });

    // 4. Last 6 months trend data for income vs expenses chart
    const sixMonthsAgo = new Date(year, month - 6, 1);
    const trendTransactions = await Transaction.aggregate([
      {
        $match: {
          userId,
          transactionDate: { $gte: sixMonthsAgo, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const monthLabels = [];
    const monthlyIncome = [];
    const monthlyExpense = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthLabels.push(label);

      const inc = trendTransactions.find(
        (t) => t._id.year === y && t._id.month === m && t._id.type === 'income'
      );
      const exp = trendTransactions.find(
        (t) => t._id.year === y && t._id.month === m && t._id.type === 'expense'
      );

      monthlyIncome.push(inc ? inc.total : 0);
      monthlyExpense.push(exp ? exp.total : 0);
    }

    res.status(200).json({
      success: true,
      selectedMonth: month,
      selectedYear: year,
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        transactionCount,
      },
      categoryExpenses: Object.keys(categoryExpenseMap).map((cat) => ({
        category: cat,
        amount: Math.round(categoryExpenseMap[cat] * 100) / 100,
      })),
      recentTransactions,
      budgetUtilization,
      budgetAlerts,
      chartData: {
        labels: monthLabels,
        income: monthlyIncome,
        expenses: monthlyExpense,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary };
