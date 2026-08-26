export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      errorCode: 'ACCESS_DENIED',
      message: 'Administrative privileges are required to perform this action.',
    });
  }
  next;
  next();
}
