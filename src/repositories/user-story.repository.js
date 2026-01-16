import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ensureDirectoryExists,
  saveJsonFile,
  readJsonFile,
  fileExists,
} from '../utils/file.utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const DB_PATH = path.join(__dirname, '..', '..', 'database', 'user-stories.json');

/**
 * Ensure database exists
 * @param {string} dbPath - Custom database path (optional, for testing)
 */
const ensureDatabase = (dbPath = DB_PATH) => {
  const dbDir = path.dirname(dbPath);
  ensureDirectoryExists(dbDir);

  if (!fileExists(dbPath)) {
    saveJsonFile(dbPath, { userStories: [] });
  }
};

/**
 * Get all user stories from database
 * @param {string} dbPath - Custom database path (optional, for testing)
 * @returns {Object} Database object with userStories array
 */
export const findAll = (dbPath = DB_PATH) => {
  ensureDatabase(dbPath);
  const data = readJsonFile(dbPath);
  // Ensure we always return the proper structure
  if (!data || !Array.isArray(data.userStories)) {
    return { userStories: [] };
  }
  return data;
};

/**
 * Find user story entry by ID
 * @param {string} id - User story entry ID
 * @param {string} dbPath - Custom database path (optional, for testing)
 * @returns {Object|undefined} User story entry object or undefined
 */
export const findById = (id, dbPath = DB_PATH) => {
  const db = findAll(dbPath);
  return db.userStories.find(entry => entry.id === id);
};

/**
 * Create a new user story entry
 * @param {Object} testScenario - Test scenario data
 * @param {Object} generatedStories - Generated user stories
 * @param {string} provider - AI provider used
 * @param {string} dbPath - Custom database path (optional, for testing)
 * @returns {Object} Created user story entry
 */
export const create = (testScenario, generatedStories, provider = 'openai', dbPath = DB_PATH) => {
  ensureDatabase(dbPath);
  const db = findAll(dbPath);

  // Ensure userStories array exists
  if (!db || !Array.isArray(db.userStories)) {
    throw new Error('Database is corrupted or invalid format');
  }

  const userStoryEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    testScenario,
    userStories: generatedStories,
    provider,
  };

  db.userStories.push(userStoryEntry);
  saveJsonFile(dbPath, db);

  return userStoryEntry;
};

/**
 * Delete user story entry by ID
 * @param {string} id - User story entry ID
 * @param {string} dbPath - Custom database path (optional, for testing)
 * @returns {boolean|null} True if deleted, null if not found
 */
export const deleteById = (id, dbPath = DB_PATH) => {
  ensureDatabase(dbPath);
  const db = findAll(dbPath);

  const initialLength = db.userStories.length;
  db.userStories = db.userStories.filter(entry => entry.id !== id);

  if (db.userStories.length === initialLength) {
    return null; // Entry not found
  }

  saveJsonFile(dbPath, db);
  return true;
};
