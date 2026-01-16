import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as userStoryRepository from '../../src/repositories/user-story.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DB_PATH = path.join(__dirname, 'test-user-stories.json');

describe('User Story Repository', () => {
  beforeEach(() => {
    // Clean up test database before each test
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  afterEach(() => {
    // Clean up test database after each test
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('findAll', () => {
    it('should create database if not exists', () => {
      const db = userStoryRepository.findAll(TEST_DB_PATH);

      expect(db).toEqual({ userStories: [] });
      expect(fs.existsSync(TEST_DB_PATH)).toBe(true);
    });

    it('should return existing database', () => {
      const mockDb = {
        userStories: [{ id: '1', title: 'Test' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const db = userStoryRepository.findAll(TEST_DB_PATH);

      expect(db).toEqual(mockDb);
    });

    it('should return empty array when database has no userStories property', () => {
      fs.mkdirSync(path.dirname(TEST_DB_PATH), { recursive: true });
      fs.writeFileSync(TEST_DB_PATH, JSON.stringify({ something: 'else' }));

      const result = userStoryRepository.findAll(TEST_DB_PATH);

      expect(result.userStories).toEqual([]);
    });

    it('should handle null database', () => {
      fs.mkdirSync(path.dirname(TEST_DB_PATH), { recursive: true });
      fs.writeFileSync(TEST_DB_PATH, 'null');

      const result = userStoryRepository.findAll(TEST_DB_PATH);

      expect(result.userStories).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find user story entry by id', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
          { id: '3', title: 'Story 3' },
        ],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.findById('2', TEST_DB_PATH);

      expect(result).toEqual({ id: '2', title: 'Story 2' });
    });

    it('should find first entry when matching id is at beginning', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1', testScenario: { title: 'Test 1' } },
          { id: '2', title: 'Story 2', testScenario: { title: 'Test 2' } },
        ],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.findById('1', TEST_DB_PATH);

      expect(result).toEqual({ id: '1', title: 'Story 1', testScenario: { title: 'Test 1' } });
      expect(result.id).toBe('1');
    });

    it('should work with custom database path', () => {
      const customPath = path.join(__dirname, '../../custom-test-db.json');
      const mockDb = {
        userStories: [{ id: 'custom-1', title: 'Custom Story' }],
      };

      fs.writeFileSync(customPath, JSON.stringify(mockDb));

      const result = userStoryRepository.findById('custom-1', customPath);

      expect(result).toEqual({ id: 'custom-1', title: 'Custom Story' });

      // Clean up
      fs.unlinkSync(customPath);
    });

    it('should return undefined when not found', () => {
      const mockDb = {
        userStories: [{ id: '1', title: 'Story 1' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.findById('999', TEST_DB_PATH);

      expect(result).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create new user story entry with different providers', () => {
      const testScenario = {
        title: 'Test Scenario',
        description: 'Test description',
        type: 'functional',
      };

      const generatedStories = [
        {
          id: 'US-001',
          title: 'Test Story',
          description: 'Test description',
          story: 'As a user, I want to test',
          priority: 'high',
        },
      ];

      // Test with openai provider
      const entry1 = userStoryRepository.create(
        testScenario,
        generatedStories,
        'openai',
        TEST_DB_PATH
      );
      expect(entry1.provider).toBe('openai');

      // Test with anthropic provider
      const entry2 = userStoryRepository.create(
        testScenario,
        generatedStories,
        'anthropic',
        TEST_DB_PATH
      );
      expect(entry2.provider).toBe('anthropic');

      // Test with github provider
      const entry3 = userStoryRepository.create(
        testScenario,
        generatedStories,
        'github',
        TEST_DB_PATH
      );
      expect(entry3.provider).toBe('github');
    });

    it('should use default provider when none specified', () => {
      const testScenario = {
        title: 'Default Provider Test',
        description: 'Testing default provider',
      };

      const stories = [{ id: 'US-100', title: 'Story' }];

      // Call create without provider argument (should use default 'openai')
      const entry = userStoryRepository.create(testScenario, stories, undefined, TEST_DB_PATH);

      expect(entry.provider).toBe('openai');
    });

    it('should create new user story entry', () => {
      const testScenario = {
        title: 'Test Scenario',
        description: 'Test description',
        type: 'functional',
      };

      const generatedStories = [
        {
          id: 'US-001',
          title: 'Test Story',
          story: 'As a user, I want to test, so that I can verify',
          priority: 'high',
        },
      ];

      const entry = userStoryRepository.create(
        testScenario,
        generatedStories,
        'openai',
        TEST_DB_PATH
      );

      expect(entry.id).toBeDefined();
      expect(entry.createdAt).toBeDefined();
      expect(entry.testScenario).toEqual(testScenario);
      expect(entry.userStories).toEqual(generatedStories);
      expect(entry.provider).toBe('openai');

      // Verify saved to database
      const db = userStoryRepository.findAll(TEST_DB_PATH);
      expect(db.userStories).toHaveLength(1);
      expect(db.userStories[0]).toEqual(entry);
    });

    it('should append to existing database', () => {
      const mockDb = {
        userStories: [{ id: 'existing-1' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const testScenario = { title: 'New Test' };
      const generatedStories = [];

      userStoryRepository.create(testScenario, generatedStories, 'openai', TEST_DB_PATH);

      const db = userStoryRepository.findAll(TEST_DB_PATH);
      expect(db.userStories).toHaveLength(2);
    });

    it('should handle corrupted database gracefully', () => {
      // Create corrupted database
      fs.mkdirSync(path.dirname(TEST_DB_PATH), { recursive: true });
      fs.writeFileSync(TEST_DB_PATH, '{"userStories": "not-an-array"}');

      const testScenario = { title: 'Test', description: 'Test description' };
      const stories = [];

      // findAll returns default structure for corrupted data
      const entry = userStoryRepository.create(testScenario, stories, 'github', TEST_DB_PATH);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
    });

    it('should handle null database gracefully', () => {
      // Create invalid database (null)
      fs.mkdirSync(path.dirname(TEST_DB_PATH), { recursive: true });
      fs.writeFileSync(TEST_DB_PATH, 'null');

      const testScenario = { title: 'Test', description: 'Test description' };
      const stories = [];

      // findAll returns default structure for null
      const entry = userStoryRepository.create(testScenario, stories, 'github', TEST_DB_PATH);

      expect(entry).toBeDefined();
      expect(entry.id).toBeDefined();
    });
  });

  describe('deleteById', () => {
    it('should delete user story entry by id', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
          { id: '3', title: 'Story 3' },
        ],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.deleteById('2', TEST_DB_PATH);

      expect(result).toBe(true);

      const db = userStoryRepository.findAll(TEST_DB_PATH);
      expect(db.userStories).toHaveLength(2);
      expect(db.userStories.find(s => s.id === '2')).toBeUndefined();
    });

    it('should return false when entry not found', () => {
      const mockDb = {
        userStories: [{ id: '1', title: 'Story 1' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.deleteById('999', TEST_DB_PATH);

      expect(result).toBe(null);

      const db = userStoryRepository.findAll(TEST_DB_PATH);
      expect(db.userStories).toHaveLength(1);
    });

    it('should delete successfully when entry exists', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
          { id: '3', title: 'Story 3' },
        ],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.deleteById('2', TEST_DB_PATH);

      expect(result).toBe(true);

      const db = userStoryRepository.findAll(TEST_DB_PATH);
      expect(db.userStories).toHaveLength(2);
      expect(db.userStories.find(s => s.id === '2')).toBeUndefined();
    });
  });
});
