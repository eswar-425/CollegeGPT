import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { localDb } from './mockStore.js';
import { User } from '../models/User.js';
import { Document } from '../models/Document.js';
import { DocumentChunk } from '../models/DocumentChunk.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Feedback } from '../models/Feedback.js';
import { ProcessingJob } from '../models/ProcessingJob.js';

const isMongoActive = () => mongoose.connection.readyState === 1;

// Helper to attach methods to mock user
function decorateUser(u) {
  if (!u) return null;
  return {
    ...u,
    _id: u._id || u.id,
    id: u._id || u.id,
    matchPassword: async (p) => {
      if (!p || !u.password) return false;
      return await bcrypt.compare(p, u.password);
    },
    generateAuthToken: () =>
      jwt.sign(
        { id: u._id || u.id, email: u.email, role: u.role, name: u.name },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
      ),
    save: async () => {
      await localDb.save();
    },
  };
}

export const dbAdapter = {
  isMongoActive,

  users: {
    findOne: async (query) => {
      if (isMongoActive()) {
        const q = User.findOne(query).select('+password');
        return await q;
      }
      await localDb.load();
      const u = localDb.data.users.find((user) => {
        if (query.email && user.email.toLowerCase() === query.email.toLowerCase()) return true;
        if (query._id && (user._id === query._id || user.id === query._id)) return true;
        return false;
      });
      return decorateUser(u);
    },
    findById: async (id) => {
      if (isMongoActive()) {
        return await User.findById(id);
      }
      await localDb.load();
      const u = localDb.data.users.find((user) => (user._id === id || user.id === id));
      return decorateUser(u);
    },
    create: async (data) => {
      if (isMongoActive()) {
        return await User.create(data);
      }
      await localDb.load();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
      const newUser = {
        _id: localDb.generateId(),
        id: localDb.generateId(),
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: data.role || 'student',
        department: data.department || 'General',
        studentId: data.studentId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      localDb.data.users.push(newUser);
      await localDb.save();
      return decorateUser(newUser);
    },
    countDocuments: async (query = {}) => {
      if (isMongoActive()) return await User.countDocuments(query);
      await localDb.load();
      if (query.role) {
        return localDb.data.users.filter((u) => u.role === query.role).length;
      }
      return localDb.data.users.length;
    },
    find: async () => {
      if (isMongoActive()) return await User.find().select('-password');
      await localDb.load();
      return localDb.data.users.map((u) => {
        const { password, ...rest } = u;
        return rest;
      });
    },
  },

  documents: {
    find: async (query = {}) => {
      if (isMongoActive()) {
        const mongoQuery = {};
        if (query.category && query.category !== 'All') {
          mongoQuery.category = query.category;
        }
        if (query.department && query.department !== 'All') {
          mongoQuery.department = query.department;
        }
        if (query.status && query.status !== 'All') {
          mongoQuery.status = query.status;
        }
        if (query.search) {
          mongoQuery.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { originalName: { $regex: query.search, $options: 'i' } },
          ];
        }
        return await Document.find(mongoQuery).sort({ createdAt: -1 });
      }
      await localDb.load();
      let res = [...localDb.data.documents];
      if (query.category && query.category !== 'All') {
        res = res.filter((d) => d.category === query.category);
      }
      if (query.department && query.department !== 'All') {
        res = res.filter((d) => d.department === query.department);
      }
      if (query.status && query.status !== 'All') {
        res = res.filter((d) => d.status === query.status);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        res = res.filter((d) => d.name.toLowerCase().includes(s) || d.originalName?.toLowerCase().includes(s));
      }
      return res.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findById: async (id) => {
      if (isMongoActive()) return await Document.findById(id);
      await localDb.load();
      return localDb.data.documents.find((d) => d._id === id || d.id === id) || null;
    },
    findOne: async (query) => {
      if (isMongoActive()) return await Document.findOne(query);
      await localDb.load();
      return (
        localDb.data.documents.find((d) => {
          if (query.name && d.name === query.name) return true;
          if (query._id && (d._id === query._id || d.id === query._id)) return true;
          return false;
        }) || null
      );
    },
    create: async (data) => {
      if (isMongoActive()) return await Document.create(data);
      await localDb.load();
      const doc = {
        _id: localDb.generateId(),
        id: localDb.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localDb.data.documents.push(doc);
      await localDb.save();
      return doc;
    },
    findByIdAndUpdate: async (id, update) => {
      if (isMongoActive()) return await Document.findByIdAndUpdate(id, update, { new: true });
      await localDb.load();
      const idx = localDb.data.documents.findIndex((d) => d._id === id || d.id === id);
      if (idx !== -1) {
        localDb.data.documents[idx] = {
          ...localDb.data.documents[idx],
          ...update,
          updatedAt: new Date().toISOString(),
        };
        await localDb.save();
        return localDb.data.documents[idx];
      }
      return null;
    },
    findByIdAndDelete: async (id) => {
      if (isMongoActive()) return await Document.findByIdAndDelete(id);
      await localDb.load();
      localDb.data.documents = localDb.data.documents.filter((d) => d._id !== id && d.id !== id);
      await localDb.save();
      return { success: true };
    },
    countDocuments: async (query = {}) => {
      if (isMongoActive()) {
        const mongoQuery = {};
        if (query.status && query.status !== 'All') mongoQuery.status = query.status;
        if (query.category && query.category !== 'All') mongoQuery.category = query.category;
        if (query.department && query.department !== 'All') mongoQuery.department = query.department;
        return await Document.countDocuments(mongoQuery);
      }
      await localDb.load();
      if (query.status && query.status !== 'All') {
        return localDb.data.documents.filter((d) => d.status === query.status).length;
      }
      return localDb.data.documents.length;
    },
  },

  documentChunks: {
    find: async (query = {}) => {
      if (isMongoActive()) return await DocumentChunk.find(query).sort({ chunkIndex: 1 });
      await localDb.load();
      return localDb.data.documentChunks
        .filter((c) => String(c.documentId) === String(query.documentId))
        .sort((a, b) => a.chunkIndex - b.chunkIndex);
    },
    insertMany: async (chunks) => {
      if (isMongoActive()) return await DocumentChunk.insertMany(chunks);
      await localDb.load();
      for (const c of chunks) {
        localDb.data.documentChunks.push({
          _id: localDb.generateId(),
          id: localDb.generateId(),
          ...c,
          createdAt: new Date().toISOString(),
        });
      }
      await localDb.save();
      return chunks;
    },
    deleteMany: async (query = {}) => {
      if (isMongoActive()) return await DocumentChunk.deleteMany(query);
      await localDb.load();
      localDb.data.documentChunks = localDb.data.documentChunks.filter(
        (c) => String(c.documentId) !== String(query.documentId)
      );
      await localDb.save();
      return { deletedCount: 1 };
    },
  },

  conversations: {
    find: async (query = {}) => {
      if (isMongoActive()) return await Conversation.find(query).sort({ updatedAt: -1, lastMessageAt: -1 });
      await localDb.load();
      return localDb.data.conversations
        .filter((c) => !query.userId || String(c.userId) === String(query.userId))
        .sort((a, b) => new Date(b.lastMessageAt || b.updatedAt) - new Date(a.lastMessageAt || a.updatedAt));
    },
    findOne: async (query = {}) => {
      if (isMongoActive()) return await Conversation.findOne(query);
      await localDb.load();
      const conv = localDb.data.conversations.find((c) => {
        if (query._id && (c._id === query._id || c.id === query._id)) return true;
        if (query.userId && String(c.userId) === String(query.userId)) return true;
        return false;
      });
      if (!conv) return null;
      return {
        ...conv,
        save: async () => {
          await localDb.save();
        },
      };
    },
    create: async (data) => {
      if (isMongoActive()) return await Conversation.create(data);
      await localDb.load();
      const conv = {
        _id: localDb.generateId(),
        id: localDb.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      localDb.data.conversations.push(conv);
      await localDb.save();
      return {
        ...conv,
        save: async () => {
          await localDb.save();
        },
      };
    },
    findOneAndUpdate: async (filter, update) => {
      if (isMongoActive()) return await Conversation.findOneAndUpdate(filter, update, { new: true });
      await localDb.load();
      const idx = localDb.data.conversations.findIndex((c) => c._id === filter._id || c.id === filter._id);
      if (idx !== -1) {
        localDb.data.conversations[idx] = {
          ...localDb.data.conversations[idx],
          ...update,
          updatedAt: new Date().toISOString(),
        };
        await localDb.save();
        return localDb.data.conversations[idx];
      }
      return null;
    },
    findOneAndDelete: async (filter) => {
      if (isMongoActive()) return await Conversation.findOneAndDelete(filter);
      await localDb.load();
      localDb.data.conversations = localDb.data.conversations.filter(
        (c) => c._id !== filter._id && c.id !== filter._id
      );
      await localDb.save();
      return { success: true };
    },
  },

  messages: {
    find: async (query = {}) => {
      if (isMongoActive()) return await Message.find(query).sort({ createdAt: 1 });
      await localDb.load();
      return localDb.data.messages
        .filter((m) => !query.conversationId || String(m.conversationId) === String(query.conversationId))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    },
    findById: async (id) => {
      if (isMongoActive()) return await Message.findById(id);
      await localDb.load();
      const msg = localDb.data.messages.find((m) => m._id === id || m.id === id);
      if (!msg) return null;
      return {
        ...msg,
        save: async () => {
          await localDb.save();
        },
      };
    },
    create: async (data) => {
      if (isMongoActive()) return await Message.create(data);
      await localDb.load();
      const msg = {
        _id: localDb.generateId(),
        id: localDb.generateId(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localDb.data.messages.push(msg);
      await localDb.save();
      return msg;
    },
    countDocuments: async (query = {}) => {
      if (isMongoActive()) return await Message.countDocuments(query);
      await localDb.load();
      if (query.role) {
        return localDb.data.messages.filter((m) => m.role === query.role).length;
      }
      return localDb.data.messages.length;
    },
    deleteMany: async (query = {}) => {
      if (isMongoActive()) return await Message.deleteMany(query);
      await localDb.load();
      localDb.data.messages = localDb.data.messages.filter(
        (m) => String(m.conversationId) !== String(query.conversationId)
      );
      await localDb.save();
      return { deletedCount: 1 };
    },
  },

  feedback: {
    find: async (query = {}) => {
      if (isMongoActive()) {
        return await Feedback.find(query)
          .sort({ createdAt: -1 })
          .populate('userId', 'name email')
          .populate('messageId');
      }
      await localDb.load();
      return localDb.data.feedback
        .filter((f) => !query.rating || f.rating === query.rating)
        .map((f) => {
          const user = localDb.data.users.find((u) => u._id === f.userId || u.id === f.userId);
          const msg = localDb.data.messages.find((m) => m._id === f.messageId || m.id === f.messageId);
          return {
            ...f,
            userId: user ? { name: user.name, email: user.email } : { name: 'Student' },
            messageId: msg || null,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    findOneAndUpdate: async (filter, update, options = {}) => {
      if (isMongoActive()) return await Feedback.findOneAndUpdate(filter, update, options);
      await localDb.load();
      const idx = localDb.data.feedback.findIndex((f) => String(f.messageId) === String(filter.messageId));
      if (idx !== -1) {
        localDb.data.feedback[idx] = {
          ...localDb.data.feedback[idx],
          ...update,
          updatedAt: new Date().toISOString(),
        };
        await localDb.save();
        return localDb.data.feedback[idx];
      }
      const newFb = {
        _id: localDb.generateId(),
        id: localDb.generateId(),
        ...update,
        createdAt: new Date().toISOString(),
      };
      localDb.data.feedback.push(newFb);
      await localDb.save();
      return newFb;
    },
    countDocuments: async (query = {}) => {
      if (isMongoActive()) return await Feedback.countDocuments(query);
      await localDb.load();
      if (query.rating) {
        return localDb.data.feedback.filter((f) => f.rating === query.rating).length;
      }
      return localDb.data.feedback.length;
    },
    deleteMany: async (query = {}) => {
      if (isMongoActive()) return await Feedback.deleteMany(query);
      await localDb.load();
      localDb.data.feedback = localDb.data.feedback.filter(
        (f) => String(f.conversationId) !== String(query.conversationId)
      );
      await localDb.save();
      return { deletedCount: 1 };
    },
  },

  processingJobs: {
    findOne: async (query = {}) => {
      if (isMongoActive()) return await ProcessingJob.findOne(query);
      await localDb.load();
      const job = localDb.data.processingJobs.find((j) => String(j.documentId) === String(query.documentId));
      if (!job) return null;
      return {
        ...job,
        save: async () => {
          await localDb.save();
        },
      };
    },
    create: async (data) => {
      if (isMongoActive()) return await ProcessingJob.create(data);
      await localDb.load();
      const job = {
        _id: localDb.generateId(),
        id: localDb.generateId(),
        ...data,
        startedAt: new Date().toISOString(),
      };
      localDb.data.processingJobs.push(job);
      await localDb.save();
      return {
        ...job,
        save: async () => {
          await localDb.save();
        },
      };
    },
    deleteMany: async (query = {}) => {
      if (isMongoActive()) return await ProcessingJob.deleteMany(query);
      await localDb.load();
      localDb.data.processingJobs = localDb.data.processingJobs.filter(
        (j) => String(j.documentId) !== String(query.documentId)
      );
      await localDb.save();
      return { deletedCount: 1 };
    },
  },
};
