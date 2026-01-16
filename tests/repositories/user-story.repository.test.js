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
  });

  describe('findById', () => {
    it('should find user story entry by id', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
        ],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.findById('2', TEST_DB_PATH);

      expect(result).toEqual({ id: '2', title: 'Story 2' });
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

    it('should return null when entry not found', () => {
      const mockDb = {
        userStories: [{ id: '1', title: 'Story 1' }],
      };

      fs.writeFileSync(TEST_DB_PATH, JSON.stringify(mockDb));

      const result = userStoryRepository.deleteById('999', TEST_DB_PATH);

      expect(result).toBeNull();

      const db = userStoryRepository.findAll(TEST_DB_PATH);
      expect(db.userStories).toHaveLength(1);
    });
  });
});
