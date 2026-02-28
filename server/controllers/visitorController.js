const Visitor = require('../models/Visitor');
const { generateOTP, getExpiryTime, hashOTP, verifyOTP } = require('../utils/otp');
const { calculateRiskScore } = require('../utils/risk');

// ─── Guard creates a visitor entry ──────────────────────────────────────────
// Guard only enters: name, phone, flatNumber (just the number, e.g. "803"), purpose
// The wing is taken from the guard's JWT — they cannot change it
exports.createVisitor = async (req, res) => {
  try {
    const { name, phone, flatNumber, purpose } = req.body;
    const guardWing = req.user.wing; // from JWT

    if (!name || !phone || !flatNumber || !purpose) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Build full flat address using guard's wing
    const fullFlat = `${guardWing}-${flatNumber}`;

    const visitor = await Visitor.create({
      name,
      phone,
      flatNumber: fullFlat,  // stored as "A-803"
      purpose,
      wing: guardWing,
      status: 'pending',
    });

    // Emit to the specific flat room
    if (req.io) {
      req.io.to(`flat-${fullFlat}`).emit('visitorRequest', {
        id: visitor._id,
        name: visitor.name,
        phone: visitor.phone,
        flatNumber: visitor.flatNumber,
        wing: visitor.wing,
        purpose: visitor.purpose,
        createdAt: visitor.createdAt,
      });
    }

    res.status(201).json(visitor);
  } catch (err) {
    console.error('Create visitor error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Resident approves or rejects ──────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    const visitor = await Visitor.findById(id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    if (action === 'approve') {
      const otp = generateOTP();
      const hashed = await hashOTP(otp);
      visitor.status = 'approved';
      visitor.otp = hashed;
      visitor.otpPlain = otp;
      visitor.otpExpires = getExpiryTime(5);
      await visitor.save();

      if (req.io) {
        req.io.emit('visitorApproved', { id: visitor._id, flatNumber: visitor.flatNumber });
      }

      return res.json({
        message: 'Visitor approved',
        otp,
        visitor: { ...visitor.toObject(), otp: undefined },
      });
    }

    if (action === 'reject') {
      visitor.status = 'rejected';
      await visitor.save();

      if (req.io) {
        req.io.emit('visitorRejected', { id: visitor._id, flatNumber: visitor.flatNumber });
      }

      return res.json({ message: 'Visitor rejected', visitor });
    }

    return res.status(400).json({ message: 'Invalid action' });
  } catch (err) {
    console.error('Update status error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Guard verifies OTP ─────────────────────────────────────────────────────
exports.verifyOtpAndEnter = async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const visitor = await Visitor.findById(id);
    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    if (!visitor.otp || !visitor.otpExpires) {
      return res.status(400).json({ message: 'No OTP set for this visitor' });
    }
    if (new Date() > visitor.otpExpires) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const isValid = await verifyOTP(otp, visitor.otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP' });

    visitor.status = 'entered';
    visitor.checkInTime = new Date();
    visitor.otp = undefined;
    visitor.otpPlain = undefined;
    visitor.otpExpires = undefined;
    visitor.riskScore = await calculateRiskScore(visitor.phone);
    await visitor.save();

    if (req.io) {
      req.io.to(`flat-${visitor.flatNumber}`).emit('visitorEntered', {
        id: visitor._id,
        name: visitor.name,
        checkInTime: visitor.checkInTime,
        riskScore: visitor.riskScore,
      });
    }

    res.json({ message: 'OTP verified, visitor entered', visitor });
  } catch (err) {
    console.error('Verify OTP error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Guard logs visitor exit ─────────────────────────────────────────────────
exports.markExit = async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) return res.status(404).json({ message: 'Visitor not found' });

    if (visitor.status !== 'entered') {
      return res.status(400).json({ message: 'Visitor has not entered yet or already exited' });
    }

    visitor.status = 'exited';
    visitor.exitTime = new Date();
    await visitor.save();

    if (req.io) {
      req.io.to(`flat-${visitor.flatNumber}`).emit('visitorExited', {
        id: visitor._id,
        name: visitor.name,
        exitTime: visitor.exitTime,
      });
    }

    res.json({ message: 'Visitor exit logged', visitor });
  } catch (err) {
    console.error('Mark exit error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Wing-scoped analytics for admin ────────────────────────────────────────
exports.analytics = async (req, res) => {
  try {
    const { role, wing } = req.user;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Admins see ONLY their wing's data
    const filter = { createdAt: { $gte: startDate } };
    if (role === 'admin' && wing) {
      filter.wing = wing;
    }

    const visitors = await Visitor.find(filter);

    const visitorsPerDayMap = {};
    const suspiciousCountMap = {};
    let totalRejections = 0;

    visitors.forEach((v) => {
      const day = v.createdAt.toISOString().slice(0, 10);
      visitorsPerDayMap[day] = (visitorsPerDayMap[day] || 0) + 1;
      if (v.riskScore >= 50) suspiciousCountMap[day] = (suspiciousCountMap[day] || 0) + 1;
      if (v.status === 'rejected') totalRejections += 1;
    });

    res.json({
      visitorsPerDay: Object.entries(visitorsPerDayMap).map(([date, count]) => ({ date, count })),
      suspiciousPerDay: Object.entries(suspiciousCountMap).map(([date, count]) => ({ date, count })),
      rejectionRate: visitors.length ? Math.round((totalRejections / visitors.length) * 100) : 0,
      totalRequests: visitors.length,
      totalRejections,
      wing: wing || 'all',
    });
  } catch (err) {
    console.error('Analytics error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── List visitors — wing-scoped ────────────────────────────────────────────
exports.listVisitors = async (req, res) => {
  try {
    const { role, wing, flatNumber } = req.user;

    let filter = {};

    if (role === 'resident') {
      // Resident sees only visitors for their exact flat ("A-803")
      // Support both new format (wing stored separately) and old format (fullFlat in flatNumber)
      let fullFlat;
      if (wing && flatNumber) {
        // New schema: wing='A', flatNumber='803'
        fullFlat = `${wing}-${flatNumber}`;
      } else if (flatNumber && flatNumber.includes('-')) {
        // Old schema: flatNumber already stored as 'A-803'
        fullFlat = flatNumber;
      } else {
        return res.status(400).json({ message: 'Resident flat not configured. Please log out and register again.' });
      }
      filter.flatNumber = fullFlat;

    } else if (role === 'guard' || role === 'admin') {
      if (!wing) {
        // Old user document with no wing — return empty and hint to re-register
        return res.status(200).json([]);
      }
      filter.wing = wing;
    }

    const visitors = await Visitor.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(visitors);
  } catch (err) {
    console.error('List visitors error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
