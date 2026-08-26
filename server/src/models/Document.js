import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'md'],
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: [
        'Admissions',
        'Academics',
        'Departments',
        'Courses',
        'Fees',
        'Examinations',
        'Academic Calendar',
        'Hostel',
        'Library',
        'Scholarships',
        'Placements',
        'Clubs',
        'Events',
        'Policies',
        'General',
      ],
      default: 'General',
    },
    department: {
      type: String,
      default: 'General / College-wide',
    },
    collegeName: {
      type: String,
      default: 'General / All Colleges',
      trim: true,
    },
    academicYear: {
      type: String,
      default: '2026-2027',
    },
    status: {
      type: String,
      enum: ['UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETING'],
      default: 'PROCESSING',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    characterCount: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Document = mongoose.models.Document || mongoose.model('Document', DocumentSchema);
