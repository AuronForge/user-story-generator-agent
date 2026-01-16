import fs from 'fs';
import path from 'path';

/**
 * Ensure directory exists, create if not
 * @param {string} dirPath - Directory path
 */
export const ensureDirectoryExists = dirPath => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Save JSON data to file
 * @param {string} filePath - File path
 * @param {Object} data - Data to save
 */
export const saveJsonFile = (filePath, data) => {
  const dir = path.dirname(filePath);
  ensureDirectoryExists(dir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

/**
 * Read JSON file
 * @param {string} filePath - File path
 * @param {*} defaultValue - Default value if file does not exist
 * @returns {*} - Parsed JSON data or default value
 */
export const readJsonFile = (filePath, defaultValue = null) => {
  if (!fileExists(filePath)) {
    return defaultValue;
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

/**
 * Check if file exists
 * @param {string} filePath - File path
 * @returns {boolean} True if file exists
 */
export const fileExists = filePath => {
  return fs.existsSync(filePath);
};
