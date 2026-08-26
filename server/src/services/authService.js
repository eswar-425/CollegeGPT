import { dbAdapter } from '../config/dbAdapter.js';

export async function registerUser({ name, email, password, role = 'student', department, collegeName }) {
  const existingUser = await dbAdapter.users.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    const error = new Error('A user with this email address already exists.');
    error.code = 'EMAIL_ALREADY_EXISTS';
    error.statusCode = 400;
    throw error;
  }

  const user = await dbAdapter.users.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    role: role === 'admin' ? 'admin' : 'student',
    department: department || 'General',
    collegeName: collegeName ? collegeName.trim() : 'General College',
  });

  const token = user.generateAuthToken();

  return {
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      collegeName: user.collegeName,
      createdAt: user.createdAt,
    },
    token,
  };
}

export async function loginUser({ email, password }) {
  const user = await dbAdapter.users.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.code = 'INVALID_CREDENTIALS';
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  if (user.save) await user.save();

  const token = user.generateAuthToken();

  return {
    user: {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      collegeName: user.collegeName || 'General College',
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
    token,
  };
}

export async function getUserProfile(userId) {
  const user = await dbAdapter.users.findById(userId);
  if (!user) {
    const error = new Error('User profile not found.');
    error.code = 'USER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    collegeName: user.collegeName || 'General College',
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  };
}
