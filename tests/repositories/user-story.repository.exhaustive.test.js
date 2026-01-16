import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import * as userStoryRepository from '../../src/repositories/user-story.repository.js';

describe('User Story Repository - Exhaustive Branch Coverage', () => {
  const TEST_DB = path.join(__dirname, '../../test-exhaustive.json');

  afterEach(() => {
    if (fs.existsSync(TEST_DB)) {
      fs.unlinkSync(TEST_DB);
    }
  });

  describe('ensureDatabase with fileExists check', () => {
    it('should create file when it does not exist', () => {
      // Ensure file doesn't exist
      if (fs.existsSync(TEST_DB)) {
        fs.unlinkSync(TEST_DB);
      }

      // This will trigger ensureDatabase which checks if file exists
      userStoryRepository.findAll(TEST_DB);

      // File should now exist
      expect(fs.existsSync(TEST_DB)).toBe(true);
    });

    it('should not recreate file when it already exists', () => {
      // Create file first
      fs.writeFileSync(TEST_DB, JSON.stringify({ userStories: [{ id: 'existing' }] }));
      const stat1 = fs.statSync(TEST_DB);

      // Call again
      userStoryRepository.findAll(TEST_DB);

      const stat2 = fs.statSync(TEST_DB);

      // File should not be recreated (same modification time or very close)
      expect(Math.abs(stat2.mtimeMs - stat1.mtimeMs)).toBeLessThan(100);
    });
  });

  describe('findAll with data validation', () => {
    it('should return empty array when data is null', () => {
      fs.writeFileSync(TEST_DB, 'null');

      const result = userStoryRepository.findAll(TEST_DB);

      expect(result.userStories).toEqual([]);
    });

    it('should return empty array when userStories is not an array', () => {
      fs.writeFileSync(TEST_DB, JSON.stringify({ userStories: 'not-an-array' }));

      const result = userStoryRepository.findAll(TEST_DB);

      expect(result.userStories).toEqual([]);
    });

    it('should return data when userStories is a valid array', () => {
      const validData = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
        ],
      };
      fs.writeFileSync(TEST_DB, JSON.stringify(validData));

      const result = userStoryRepository.findAll(TEST_DB);

      expect(Array.isArray(result.userStories)).toBe(true);
      expect(result.userStories).toHaveLength(2);
    });
  });

  describe('findById with various scenarios', () => {
    it('should return undefined when id not found', () => {
      fs.writeFileSync(TEST_DB, JSON.stringify({ userStories: [{ id: 'other', title: 'Other' }] }));

      const result = userStoryRepository.findById('not-found', TEST_DB);

      expect(result).toBeUndefined();
    });

    it('should return item when id is found at start', () => {
      fs.writeFileSync(
        TEST_DB,
        JSON.stringify({
          userStories: [
            { id: 'first', title: 'First' },
            { id: 'second', title: 'Second' },
          ],
        })
      );

      const result = userStoryRepository.findById('first', TEST_DB);

      expect(result).toEqual({ id: 'first', title: 'First' });
    });

    it('should return item when id is found at end', () => {
      fs.writeFileSync(
        TEST_DB,
        JSON.stringify({
          userStories: [
            { id: 'first', title: 'First' },
            { id: 'last', title: 'Last' },
          ],
        })
      );

      const result = userStoryRepository.findById('last', TEST_DB);

      expect(result).toEqual({ id: 'last', title: 'Last' });
    });

    it('should return item when id is found in middle', () => {
      fs.writeFileSync(
        TEST_DB,
        JSON.stringify({
          userStories: [
            { id: 'first', title: 'First' },
            { id: 'middle', title: 'Middle' },
            { id: 'last', title: 'Last' },
          ],
        })
      );

      const result = userStoryRepository.findById('middle', TEST_DB);

      expect(result).toEqual({ id: 'middle', title: 'Middle' });
    });
  });

  describe('create with all provider variations', () => {
    it('should create with explicit openai provider', () => {
      const entry = userStoryRepository.create({ title: 'Test' }, [], 'openai', TEST_DB);

      expect(entry.provider).toBe('openai');
    });

    it('should create with explicit github provider', () => {
      const entry = userStoryRepository.create({ title: 'Test' }, [], 'github', TEST_DB);

      expect(entry.provider).toBe('github');
    });

    it('should create with explicit anthropic provider', () => {
      const entry = userStoryRepository.create({ title: 'Test' }, [], 'anthropic', TEST_DB);

      expect(entry.provider).toBe('anthropic');
    });

    it('should use default openai when provider is undefined', () => {
      const entry = userStoryRepository.create({ title: 'Test' }, [], undefined, TEST_DB);

      expect(entry.provider).toBe('openai');
    });

    it('should persist entry to database', () => {
      const scenario = { title: 'Persist Test' };
      const stories = [{ id: 'US-P1', title: 'Persisted' }];

      const entry = userStoryRepository.create(scenario, stories, 'github', TEST_DB);

      // Read back from file
      const db = userStoryRepository.findAll(TEST_DB);

      expect(db.userStories).toHaveLength(1);
      expect(db.userStories[0].id).toBe(entry.id);
      expect(db.userStories[0].provider).toBe('github');
    });
  });

  describe('deleteById with all branches', () => {
    it('should return null when entry not found (empty array)', () => {
      fs.writeFileSync(TEST_DB, JSON.stringify({ userStories: [] }));

      const result = userStoryRepository.deleteById('not-exists', TEST_DB);

      expect(result).toBe(null);
    });

    it('should return null when entry not found (with other entries)', () => {
      fs.writeFileSync(
        TEST_DB,
        JSON.stringify({
          userStories: [
            { id: 'keep1', title: 'Keep 1' },
            { id: 'keep2', title: 'Keep 2' },
          ],
        })
      );

      const result = userStoryRepository.deleteById('not-exists', TEST_DB);

      expect(result).toBe(null);

      // Verify nothing was deleted
      const db = userStoryRepository.findAll(TEST_DB);
      expect(db.userStories).toHaveLength(2);
    });

    it('should return true and delete when entry found', () => {
      fs.writeFileSync(
        TEST_DB,
        JSON.stringify({
          userStories: [
            { id: 'delete-me', title: 'Delete Me' },
            { id: 'keep', title: 'Keep' },
          ],
        })
      );

      const result = userStoryRepository.deleteById('delete-me', TEST_DB);

      expect(result).toBe(true);

      // Verify it was deleted
      const db = userStoryRepository.findAll(TEST_DB);
      expect(db.userStories).toHaveLength(1);
      expect(db.userStories[0].id).toBe('keep');
    });

    it('should delete only the specified entry', () => {
      fs.writeFileSync(
        TEST_DB,
        JSON.stringify({
          userStories: [
            { id: 'id1', title: 'Story 1' },
            { id: 'id2', title: 'Story 2' },
            { id: 'id3', title: 'Story 3' },
          ],
        })
      );

      userStoryRepository.deleteById('id2', TEST_DB);

      const db = userStoryRepository.findAll(TEST_DB);
      expect(db.userStories).toHaveLength(2);
      expect(db.userStories.find(s => s.id === 'id2')).toBeUndefined();
      expect(db.userStories.find(s => s.id === 'id1')).toBeDefined();
      expect(db.userStories.find(s => s.id === 'id3')).toBeDefined();
    });
  });
});
