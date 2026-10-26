const express = require('express');
const router = express.Router();
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All budget endpoints are protected

router.route('/')
  .post(createBudget)
  .get(getBudgets);

router.route('/:id')
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
