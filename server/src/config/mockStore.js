import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.resolve(__dirname, '../../uploads/local_db.json');

/**
 * Built-in zero-config embedded store for when MongoDB is not running locally.
 */
class LocalDatastore {
  constructor() {
    this.data = {
      users: [],
      documents: [],
      documentChunks: [],
      conversations: [],
      messages: [],
      feedback: [],
      processingJobs: [],
    };
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    try {
      await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
      const raw = await fs.readFile(DB_FILE, 'utf-8');
      this.data = JSON.parse(raw);
    } catch (e) {
      // Start fresh
    }
    this.loaded = true;
  }

  async save() {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      logger.error(`Error saving local db: ${e.message}`);
    }
  }

  generateId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }
}

export const localDb = new LocalDatastore();
