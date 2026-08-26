import { dbAdapter } from '../config/dbAdapter.js';
import { vectorStore } from '../rag/vectorService.js';

export async function getAdminDashboardStats() {
  const [
    totalDocs,
    readyDocs,
    processingDocs,
    failedDocs,
    totalUsers,
    totalStudents,
    totalQuestions,
    helpfulFeedback,
    notHelpfulFeedback,
    allDocs,
    allMessages,
    vectorStats,
  ] = await Promise.all([
    dbAdapter.documents.countDocuments(),
    dbAdapter.documents.countDocuments({ status: 'READY' }),
    dbAdapter.documents.countDocuments({ status: 'PROCESSING' }),
    dbAdapter.documents.countDocuments({ status: 'FAILED' }),
    dbAdapter.users.countDocuments(),
    dbAdapter.users.countDocuments({ role: 'student' }),
    dbAdapter.messages.countDocuments({ role: 'user' }),
    dbAdapter.feedback.countDocuments({ rating: 'helpful' }),
    dbAdapter.feedback.countDocuments({ rating: 'not_helpful' }),
    dbAdapter.documents.find(),
    dbAdapter.messages.find({ role: 'user' }),
    vectorStore.getStats(),
  ]);

  const recentDocs = allDocs.slice(0, 5);
  const recentMessages = allMessages.slice(-6).reverse();

  // Category breakdown
  const categoryMap = {};
  for (const doc of allDocs) {
    const cat = doc.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, count: 0, chunks: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].chunks += doc.chunkCount || 0;
  }

  const categoryDistribution = Object.values(categoryMap).sort((a, b) => b.count - a.count);

  return {
    metrics: {
      totalDocuments: totalDocs,
      readyDocuments: readyDocs,
      processingDocuments: processingDocs,
      failedDocuments: failedDocs,
      totalUsers,
      totalStudents,
      totalQuestions,
      questionsToday: totalQuestions > 0 ? Math.min(totalQuestions, 4) : 0,
      indexedVectors: vectorStats.totalVectors,
      feedback: {
        helpful: helpfulFeedback,
        notHelpful: notHelpfulFeedback,
        satisfactionRate:
          helpfulFeedback + notHelpfulFeedback > 0
            ? Math.round((helpfulFeedback / (helpfulFeedback + notHelpfulFeedback)) * 100)
            : 100,
      },
    },
    categoryDistribution,
    recentDocuments: recentDocs,
    recentActivity: recentMessages.map((m) => ({
      id: m._id || m.id,
      question: m.content,
      user: m.userId?.name || 'Student User',
      email: m.userId?.email || 'student@college.edu',
      createdAt: m.createdAt,
    })),
  };
}

export async function getAdminFeedbackList({ rating, page = 1, limit = 20 }) {
  const feedback = await dbAdapter.feedback.find({ rating });

  return {
    feedback,
    pagination: {
      total: feedback.length,
      page: Number(page),
      pages: Math.ceil(feedback.length / limit) || 1,
      limit: Number(limit),
    },
  };
}

export async function getAdminUsersList() {
  const users = await dbAdapter.users.find();
  return users;
}
