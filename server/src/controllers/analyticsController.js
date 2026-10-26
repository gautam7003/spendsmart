const { Transaction } = require('../models/Transaction');

// @desc    Get monthly analytics comparing current month to previous month
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // Current month range
    const curStart = new Date(year, month - 1, 1);
    const curEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Previous month range
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const prevStart = new Date(prevYear, prevMonth - 1, 1);
    const prevEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

    const [curMonthTx, prevMonthTx] = await Promise.all([
      Transaction.find({ userId, transactionDate: { $gte: curStart, $lte: curEnd } }),
      Transaction.find({ userId, transactionDate: { $gte: prevStart, $lte: prevEnd } }),
    ]);

    const calculateTotals = (transactions) => {
      let income = 0;
      let expenses = 0;
      const catSpend = {};
      transactions.forEach((t) => {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') {
          expenses += t.amount;
          catSpend[t.category] = (catSpend[t.category] || 0) + t.amount;
        }
      });

      let highestCategory = null;
      let highestSpend = 0;
      Object.keys(catSpend).forEach((c) => {
        if (catSpend[c] > highestSpend) {
          highestSpend = catSpend[c];
          highestCategory = c;
        }
      });

      return {
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        balance: Math.round((income - expenses) * 100) / 100,
        transactionCount: transactions.length,
        highestCategory: highestCategory || 'N/A',
        highestSpend: Math.round(highestSpend * 100) / 100,
        categoryMap: catSpend,
      };
    };

    const currentStats = calculateTotals(curMonthTx);
    const prevStats = calculateTotals(prevMonthTx);

    // Percentage changes
    const calcChange = (cur, prev) => {
      if (prev === 0) return cur > 0 ? 100 : 0;
      return Math.round(((cur - prev) / prev) * 1000) / 10;
    };

    const expenseChangePct = calcChange(currentStats.expenses, prevStats.expenses);
    const incomeChangePct = calcChange(currentStats.income, prevStats.income);

    res.status(200).json({
      success: true,
      currentMonth: {
        month,
        year,
        ...currentStats,
      },
      previousMonth: {
        month: prevMonth,
        year: prevYear,
        ...prevStats,
      },
      comparisons: {
        expenseChangePct,
        incomeChangePct,
        savedMore: currentStats.balance >= prevStats.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category analytics breakdown
// @route   GET /api/analytics/categories
// @access  Private
const getCategoryAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: 'expense',
          transactionDate: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalExpense = categoryBreakdown.reduce((sum, item) => sum + item.totalAmount, 0);

    const categories = categoryBreakdown.map((item) => ({
      category: item._id,
      amount: Math.round(item.totalAmount * 100) / 100,
      count: item.count,
      percentage:
        totalExpense > 0 ? Math.round((item.totalAmount / totalExpense) * 1000) / 10 : 0,
    }));

    res.status(200).json({
      success: true,
      month,
      year,
      totalExpense: Math.round(totalExpense * 100) / 100,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMonthlyAnalytics,
  getCategoryAnalytics,
};
