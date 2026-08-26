import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { dbAdapter } from '../config/dbAdapter.js';
import { processDocumentIngestion } from '../rag/ragPipeline.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed(isStandalone = true) {
  logger.info('Starting CollegeGPT Seed Data & Knowledge Base Indexing...');

  try {
    await connectDB();

    // 1. Create or Update Default Users
    let admin = await dbAdapter.users.findOne({ email: 'admin@college.edu' });
    if (!admin) {
      admin = await dbAdapter.users.create({
        name: 'Dr. Sarah Jenkins (Dean / Admin)',
        email: 'admin@college.edu',
        password: 'Admin@12345',
        role: 'admin',
        department: 'Academic Affairs',
      });
      logger.success('Admin user created: admin@college.edu (Password: Admin@12345)');
    } else {
      logger.info('Admin user verified: admin@college.edu');
    }

    let student = await dbAdapter.users.findOne({ email: 'student@college.edu' });
    if (!student) {
      student = await dbAdapter.users.create({
        name: 'Alex Rivera',
        email: 'student@college.edu',
        password: 'Student@12345',
        role: 'student',
        department: 'Computer Science',
        studentId: 'CS-2026-084',
      });
      logger.success('Student user created: student@college.edu (Password: Student@12345)');
    } else {
      logger.info('Student user verified: student@college.edu');
    }

    // 2. Index Sample College Documents
    const sampleDir = path.resolve(__dirname, '../../../sample_data');
    const uploadsDir = env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const sampleDocs = [
      {
        fileName: 'Academic_Regulations_2026.txt',
        name: 'Official Academic Regulations & Examination Rules 2026',
        category: 'Academics',
        department: 'General / College-wide',
        academicYear: '2026-2027',
      },
      {
        fileName: 'Hostel_Rules_and_Fee_Structure.txt',
        name: 'Hostel Residence Policies & Fee Structure 2026',
        category: 'Hostel',
        department: 'General / College-wide',
        academicYear: '2026-2027',
      },
      {
        fileName: 'Placement_and_Scholarships_Handbook.txt',
        name: 'Placement Guidelines, Internships & Scholarship Schemes',
        category: 'Placements',
        department: 'General / College-wide',
        academicYear: '2026-2027',
      },
      {
        fileName: 'Department_and_Courses_Catalog.txt',
        name: 'Academic Departments, Course Catalog & Faculty Directory',
        category: 'Departments',
        department: 'General / College-wide',
        academicYear: '2026-2027',
      },
    ];

    for (const docInfo of sampleDocs) {
      const srcPath = path.join(sampleDir, docInfo.fileName);
      const destName = `seed-${docInfo.fileName}`;
      const destPath = path.join(uploadsDir, destName);

      try {
        const fileContent = await fs.readFile(srcPath);
        await fs.writeFile(destPath, fileContent);

        // Upsert Document
        let docRecord = await dbAdapter.documents.findOne({ name: docInfo.name });
        if (!docRecord) {
          docRecord = await dbAdapter.documents.create({
            name: docInfo.name,
            originalName: docInfo.fileName,
            fileUrl: `/uploads/${destName}`,
            fileType: 'txt',
            fileSize: fileContent.length,
            category: docInfo.category,
            department: docInfo.department,
            academicYear: docInfo.academicYear,
            status: 'PROCESSING',
            uploadedBy: admin._id || admin.id,
          });
        }

        const docId = docRecord._id || docRecord.id;

        // Run Ingestion
        await processDocumentIngestion(docId, destPath, 'txt', {
          name: docRecord.name,
          category: docRecord.category,
          department: docRecord.department,
          academicYear: docRecord.academicYear,
        });

        logger.success(`Indexed sample document: "${docInfo.name}"`);
      } catch (err) {
        logger.warn(`Could not process sample doc ${docInfo.fileName}: ${err.message}`);
      }
    }

    // 3. Seed Sample Conversation & Feedback for Demo
    const existingConvs = await dbAdapter.conversations.find({ userId: student._id || student.id });
    if (existingConvs.length === 0) {
      const conv = await dbAdapter.conversations.create({
        userId: student._id || student.id,
        title: 'Attendance and Supplementary Exam Inquiries',
      });

      const convId = conv._id || conv.id;
      const studId = student._id || student.id;

      await dbAdapter.messages.create({
        conversationId: convId,
        userId: studId,
        role: 'user',
        content: 'What is the minimum attendance required for semester examinations?',
      });

      const asstMsg = await dbAdapter.messages.create({
        conversationId: convId,
        userId: studId,
        role: 'assistant',
        content:
          'Based on the official **Official Academic Regulations & Examination Rules 2026** (Page 1):\n\nEvery registered student is required to maintain a minimum attendance of **75% in aggregate** across all lectures, tutorials, and laboratories conducted in each semester to be eligible for End-Semester Final Examinations.\n\nStudents with attendance between 65% and 74.9% may apply for medical condonation with valid documentation from the Chief Medical Officer upon paying a condonation fee of $50 / Rs. 1,500.\n\n*(Source: Official Academic Regulations & Examination Rules 2026, Page 1)*',
        sources: [
          {
            documentName: 'Official Academic Regulations & Examination Rules 2026',
            page: 1,
            category: 'Academics',
            snippet: 'Minimum Mandatory Attendance: Every registered student is required to maintain a minimum attendance of 75%...',
            score: 0.94,
          },
        ],
        retrievalMetadata: {
          chunksRetrieved: 3,
          provider: 'CollegeGPT RAG',
          responseTimeMs: 120,
          fallbackUsed: false,
        },
      });

      await dbAdapter.feedback.findOneAndUpdate(
        { messageId: asstMsg._id || asstMsg.id },
        {
          userId: studId,
          messageId: asstMsg._id || asstMsg.id,
          conversationId: convId,
          rating: 'helpful',
          comment: 'Very clear and cited the exact section and condonation fee!',
        },
        { upsert: true }
      );

      logger.success('Sample conversation & feedback seeded.');
    }

    logger.success('Database seeding completed successfully!');
  } catch (error) {
    logger.error(`Seed failed: ${error.message}`);
  } finally {
    if (isStandalone && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

// Auto run if executed directly
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  runSeed(true);
}
