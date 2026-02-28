const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const WINGS = ['A', 'B', 'C', 'D'];

const createToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
      wing: user.wing,
      flatNumber: user.flatNumber,   // raw flat number e.g. "803"
      fullFlat: user.role === 'resident' ? `${user.wing}-${user.flatNumber}` : null,
    },
    process.env.JWT_SECRET || 'supersecretjwtkey',
    { expiresIn: '1d' }
  );

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  wing: user.wing,
  flatNumber: user.flatNumber,
  fullFlat: user.role === 'resident' ? `${user.wing}-${user.flatNumber}` : null,
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, wing, flatNumber } = req.body;

    // Basic required fields
    if (!name || !email || !password || !wing) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Wing must be valid
    if (!WINGS.includes(wing)) {
      return res.status(400).json({ message: 'Invalid wing — must be A, B, C or D' });
    }

    // Resident must provide a flat number
    if (role === 'resident' && !flatNumber) {
      return res.status(400).json({ message: 'Residents must provide a flat number' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'resident',
      wing,
      flatNumber: role === 'resident' ? flatNumber : '',
    });

    const token = createToken(user);
    res.status(201).json({ user: safeUser(user), token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({ user: safeUser(user), token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.me = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
