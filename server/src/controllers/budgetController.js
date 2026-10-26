const Budget = require('../models/Budget');
const { Transaction } = require('../models/Transaction');

// Helper to calculate start and end of month
const getMonthDateRange = (month, year) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

// @desc    Create a new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month, year } = req.body;

    if (!category || !monthlyLimit || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category, monthlyLimit, month, and year.',
      });
    }

    const limitNum = Number(monthlyLimit);
    const monthNum = Number(month);
    const yearNum = Number(year);

    if (isNaN(limitNum) || limitNum <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Monthly limit must be a positive number.',
      });
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be an integer between 1 and 12.',
      });
    }

    // Check duplicate
    const existing = await Budget.findOne({
      userId: req.user._id,
      category: category.trim(),
      month: monthNum,
      year: yearNum,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A budget for category "${category}" already exists for ${monthNum}/${yearNum}. You can edit it instead.`,
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category: category.trim(),
      monthlyLimit: limitNum,
      month: monthNum,
      year: yearNum,
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully!',
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all budgets for current user (filtered by month/year) with spending calculations
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    });

    const { startDate, endDate } = getMonthDateRange(month, year);

    // Aggregate expense transactions for current user in this month by category
    const expensesByCategory = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          transactionDate: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = {};
    expensesByCategory.forEach((item) => {
      expenseMap[item._id] = item.totalSpent;
    });

    // Merge budgets with spent amount and utilization %
    const enrichedBudgets = budgets.map((b) => {
      const spent = expenseMap[b.category] || 0;
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const remaining = b.monthlyLimit - spent;
      let status = 'normal'; // 'normal' | 'warning' (>=80%) | 'exceeded' (>100%)
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 80) {
        status = 'warning';
      }

      return {
        _id: b._id,
        category: b.category,
        monthlyLimit: b.monthlyLimit,
        month: b.month,
        year: b.year,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage: Math.round(percentage * 10) / 10,
        status,
        createdAt: b.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      count: enrichedBudgets.length,
      budgets: enrichedBudgets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single budget by ID
// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this budget.',
      });
    }

    res.status(200).json({
      success: true,
      budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this budget.',
      });
    }

    const { category, monthlyLimit, month, year } = req.body;

    if (monthlyLimit !== undefined) {
      const limitNum = Number(monthlyLimit);
      if (isNaN(limitNum) || limitNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Monthly limit must be a positive number.',
        });
      }
      budget.monthlyLimit = limitNum;
    }

    if (category) budget.category = category.trim();
    if (month) budget.month = Number(month);
    if (year) budget.year = Number(year);

    const updatedBudget = await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully!',
      budget: updatedBudget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.',
      });
    }

    if (budget.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this budget.',
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
