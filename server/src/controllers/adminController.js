import * as adminService from '../services/adminService.js';

export async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getAdminDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeedback(req, res, next) {
  try {
    const { rating, page, limit } = req.query;
    const result = await adminService.getAdminFeedbackList({ rating, page, limit });
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req, res, next) {
  try {
    const users = await adminService.getAdminUsersList();
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
}
