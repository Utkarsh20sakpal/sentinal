const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    // Full flat address stored as "A-803" (wing prefix + flat number)
    flatNumber: { type: String, required: true },
    // Wing stored explicitly for O(1) filtering without string parsing
    wing: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    purpose: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'otp_verified', 'entered', 'exited'],
      default: 'pending',
    },
    otp: { type: String },       // bcrypt-hashed
    otpPlain: { type: String },       // plaintext shown to resident; cleared on entry
    otpExpires: { type: Date },
    riskScore: { type: Number, default: 0 },
    checkInTime: { type: Date },
    exitTime: { type: Date },   // set when guard logs the exit
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Index for fast wing-based queries
visitorSchema.index({ wing: 1, createdAt: -1 });
visitorSchema.index({ flatNumber: 1, createdAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
