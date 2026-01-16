import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import {
  ensureDirectoryExists,
  saveJsonFile,
  readJsonFile,
  fileExists,
} from '../../src/utils/file.utils.js';

const TEST_DIR = path.join(process.cwd(), 'tests', 'temp');
const TEST_FILE = path.join(TEST_DIR, 'test.json');

describe('File Utils', () => {
  beforeEach(() => {
    // Cleanup before each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Cleanup after each test
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });

  describe('ensureDirectoryExists', () => {
    test('should create directory if it does not exist', () => {
      expect(fs.existsSync(TEST_DIR)).toBe(false);

      ensureDirectoryExists(TEST_DIR);

      expect(fs.existsSync(TEST_DIR)).toBe(true);
    });

    test('should not throw error if directory already exists', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });

      expect(() => ensureDirectoryExists(TEST_DIR)).not.toThrow();
    });

    test('should create nested directories', () => {
      const nestedDir = path.join(TEST_DIR, 'level1', 'level2', 'level3');

      ensureDirectoryExists(nestedDir);

      expect(fs.existsSync(nestedDir)).toBe(true);
    });
  });

  describe('saveJsonFile', () => {
    test('should save JSON data to file', () => {
      const data = { test: 'data', number: 123 };

      saveJsonFile(TEST_FILE, data);

      expect(fs.existsSync(TEST_FILE)).toBe(true);
      const content = fs.readFileSync(TEST_FILE, 'utf-8');
      expect(JSON.parse(content)).toEqual(data);
    });

    test('should create directory if it does not exist', () => {
      const data = { test: 'data' };

      expect(fs.existsSync(TEST_DIR)).toBe(false);

      saveJsonFile(TEST_FILE, data);

      expect(fs.existsSync(TEST_DIR)).toBe(true);
      expect(fs.existsSync(TEST_FILE)).toBe(true);
    });

    test('should format JSON with indentation', () => {
      const data = { test: 'data' };

      saveJsonFile(TEST_FILE, data);

      const content = fs.readFileSync(TEST_FILE, 'utf-8');
      expect(content).toContain('\n');
      expect(content).toContain('  ');
    });
  });

  describe('readJsonFile', () => {
    test('should read JSON file', () => {
      const data = { test: 'data', array: [1, 2, 3] };
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(TEST_FILE, JSON.stringify(data));

      const result = readJsonFile(TEST_FILE);

      expect(result).toEqual(data);
    });

    test('should return default value if file does not exist', () => {
      const defaultValue = { default: true };

      const result = readJsonFile(TEST_FILE, defaultValue);

      expect(result).toEqual(defaultValue);
    });

    test('should return null by default if file does not exist', () => {
      const result = readJsonFile(TEST_FILE);

      expect(result).toBeNull();
    });
  });

  describe('fileExists', () => {
    test('should return true if file exists', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });
      fs.writeFileSync(TEST_FILE, '{}');

      expect(fileExists(TEST_FILE)).toBe(true);
    });

    test('should return false if file does not exist', () => {
      expect(fileExists(TEST_FILE)).toBe(false);
    });

    test('should return true for directories', () => {
      fs.mkdirSync(TEST_DIR, { recursive: true });

      expect(fileExists(TEST_DIR)).toBe(true);
    });
  });
});
