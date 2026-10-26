const { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } = require('../models/Transaction');

// @desc    Create a new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, description, transactionDate } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type (income/expense), amount, and category.',
      });
    }

    if (!['income', 'expense'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense".',
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number.',
      });
    }

    const transaction = await Transaction.create({
      userId: req.user._id,
      type: type.toLowerCase(),
      amount: parsedAmount,
      category: category.trim(),
      description: description ? description.trim() : '',
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully!',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions for current user with filtering, search, sorting & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'transactionDate',
      order = 'desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type.toLowerCase())) {
      query.type = type.toLowerCase();
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) {
        query.transactionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.transactionDate.$lte = end;
      }
    }

    if (search) {
      query.description = { $regex: search.trim(), $options: 'i' };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: transactions.length,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    // Check ownership
    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction.',
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this transaction.',
      });
    }

    const { type, amount, category, description, transactionDate } = req.body;

    if (type) {
      if (!['income', 'expense'].includes(type.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense".',
        });
      }
      transaction.type = type.toLowerCase();
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number.',
        });
      }
      transaction.amount = parsedAmount;
    }

    if (category) transaction.category = category.trim();
    if (description !== undefined) transaction.description = description.trim();
    if (transactionDate) transaction.transactionDate = new Date(transactionDate);

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully!',
      transaction: updatedTransaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    if (transaction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction.',
      });
    }

    await transaction.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories list
// @route   GET /api/transactions/categories
// @access  Private
const getCategories = async (req, res) => {
  res.status(200).json({
    success: true,
    incomeCategories: INCOME_CATEGORIES,
    expenseCategories: EXPENSE_CATEGORIES,
  });
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getCategories,
};
