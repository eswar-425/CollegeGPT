import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role, department, collegeName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Name, email, and password are required fields.',
      });
    }

    const data = await authService.registerUser({ name, email, password, role, department, collegeName });
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
      });
    }

    const data = await authService.loginUser({ email, password });
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req, res, next) {
  try {
    const user = await authService.getUserProfile(req.user._id || req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}
