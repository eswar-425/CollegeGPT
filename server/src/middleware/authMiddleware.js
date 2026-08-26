import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      errorCode: 'AUTH_REQUIRED',
      message: 'Authentication token is required to access this resource.',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    
    // Try to attach full user from DB if available
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbErr) {}

    // If DB is offline or user found via JWT token payload
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'student',
      name: decoded.name || 'Student User',
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      errorCode: 'INVALID_TOKEN',
      message: 'Token is invalid or expired. Please log in again.',
    });
  }
}
