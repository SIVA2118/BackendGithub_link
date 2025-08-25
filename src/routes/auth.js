import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, email, password } = req.body;
    if (!firstName || !lastName || !mobileNumber || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ $or: [{ email }, { mobileNumber }] });
    if (existing) {
      return res.status(409).json({ message: 'User already exists with email or mobile' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ firstName, lastName, mobileNumber, email, password: hashed });
    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, firstName, lastName, mobileNumber, email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;
    if ((!email && !mobileNumber) || !password) {
      return res.status(400).json({ message: 'Provide email/mobile and password' });
    }
    const query = email ? { email } : { mobileNumber };
    const user = await User.findOne(query);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out (client should remove token)' });
});

export default router;
