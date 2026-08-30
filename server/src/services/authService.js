import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const registerUser = async (userData) => {
  const { name, email, password, studentId, department, year, role } = userData;

  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    studentId: studentId ? studentId.trim() : '',
    department: department ? department.trim() : '',
    year: year ? year.trim() : '',
    role: role === 'admin' ? 'admin' : 'student',
  });

  const token = generateToken(user);
  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Please provide both email and password');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  return { user: user.toJSON(), token };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user;
};
