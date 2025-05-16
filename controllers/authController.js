const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  const { userId } = req.user; // From JWT middleware
  const { username, password } = req.body;

  console.log('Update admin request:', { userId, username, password });

  try {
    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: 'Invalid user ID from token' });
    }

    // Validate input
    if (!username && !password) {
      return res.status(400).json({ message: 'At least one field (username or password) must be provided' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', user);

    const updateData = {};

    // Update username if provided
    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      updateData.username = username;
    }

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    console.log('Update data:', updateData);

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
    if (!updatedUser) {
      console.error('Update failed: No user returned after update');
      return res.status(500).json({ message: 'Failed to update user' });
    }

    console.log('User updated successfully:', updatedUser);
    res.json({ message: 'Admin credentials updated successfully', updatedUser });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};