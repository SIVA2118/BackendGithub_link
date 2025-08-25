import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    delete updates._id;

    const updated = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or mobile already in use' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  if (id !== req.user.id) {
    return res
      .status(403)
      .json({ message: 'You can only update your own profile' });
  }

  try {
    const updates = { ...req.body };

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    delete updates._id;

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });

    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email or mobile already in use' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/others', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select(
      '-password'
    );
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
