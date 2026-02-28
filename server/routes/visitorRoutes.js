const express = require('express');
const {
  createVisitor,
  updateStatus,
  verifyOtpAndEnter,
  markExit,
  analytics,
  listVisitors,
} = require('../controllers/visitorController');
const { auth, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Guard creates visitor
router.post('/', auth, requireRole('guard', 'admin'), createVisitor);

// Resident approves/rejects
router.put('/:id/status', auth, requireRole('resident', 'admin'), updateStatus);

// Guard verifies OTP and marks entered
router.post('/:id/verify-otp', auth, requireRole('guard', 'admin'), verifyOtpAndEnter);

// Guard logs visitor exit
router.post('/:id/exit', auth, requireRole('guard', 'admin'), markExit);

// Analytics (must be before /:id routes)
router.get('/analytics/summary', auth, analytics);

// List visitors
router.get('/', auth, listVisitors);

module.exports = router;



