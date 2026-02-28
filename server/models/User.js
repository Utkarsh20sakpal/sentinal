const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'guard', 'resident'],
      default: 'resident',
    },
    // Wing A / B / C / D — required for new registrations (enforced in controller)
    // Not required at schema level so old documents without wing don't error on read
    wing: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    // Flat number stored without wing prefix (e.g. "803"), only meaningful for residents
    // Full address = wing + flatNumber → "A-803"
    flatNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: full flat identifier, e.g. "A-803"
userSchema.virtual('fullFlat').get(function () {
  if (this.role === 'resident' && this.flatNumber) {
    return `${this.wing}-${this.flatNumber}`;
  }
  return null;
});

module.exports = mongoose.model('User', userSchema);
