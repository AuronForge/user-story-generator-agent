import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import repository functions
import * as userStoryRepository from '../../src/repositories/user-story.repository.js';

describe('User Story Repository - Default Parameters', () => {
  const TEST_DB_PATH = path.join(__dirname, '../../test-default-params-db.json');

  afterEach(() => {
    // Clean up test database after each test
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('findById with default DB_PATH', () => {
    it('should work when called without dbPath parameter', () => {
      // This will use the default DB_PATH
      const result = userStoryRepository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('create with default parameters', () => {
    it('should use default provider openai when provider not specified', () => {
      const testScenario = { title: 'Test', description: 'Test desc' };
      const stories = [{ id: 'US-1', title: 'Story' }];

      // Call without provider argument
      const entry = userStoryRepository.create(testScenario, stories, undefined, TEST_DB_PATH);

      expect(entry.provider).toBe('openai');
    });

    it('should work with explicit openai provider', () => {
      const testScenario = { title: 'Test2', description: 'Test desc 2' };
      const stories = [];

      const entry = userStoryRepository.create(testScenario, stories, 'openai', TEST_DB_PATH);

      expect(entry.provider).toBe('openai');
      expect(entry.userStories).toEqual([]);
    });

    it('should work with github provider', () => {
      const testScenario = { title: 'Test3' };
      const stories = [];

      const entry = userStoryRepository.create(testScenario, stories, 'github', TEST_DB_PATH);

      expect(entry.provider).toBe('github');
    });

    it('should work with anthropic provider', () => {
      const testScenario = { title: 'Test4' };
      const stories = [];

      const entry = userStoryRepository.create(testScenario, stories, 'anthropic', TEST_DB_PATH);

      expect(entry.provider).toBe('anthropic');
    });
  });

  describe('deleteById with default parameters', () => {
    it('should work when called with explicit dbPath', () => {
      const mockDb = {
        userStories: [{ id: 'delete-1', title: 'To Delete' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.deleteById('delete-1', TEST_DB_PATH);

      expect(result).toBe(true);
    });

    it('should return null when entry not found', () => {
      const mockDb = {
        userStories: [{ id: 'keep-1', title: 'Keep' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.deleteById('not-exists', TEST_DB_PATH);

      expect(result).toBe(null);
    });
  });

  describe('findAll with various data scenarios', () => {
    it('should handle valid database with multiple entries', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
          { id: '3', title: 'Story 3' },
        ],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.findAll(TEST_DB_PATH);

      expect(result.userStories).toHaveLength(3);
      expect(result.userStories[0].id).toBe('1');
      expect(result.userStories[2].id).toBe('3');
    });

    it('should handle empty array', () => {
      const mockDb = { userStories: [] };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.findAll(TEST_DB_PATH);

      expect(result.userStories).toEqual([]);
    });
  });
});
