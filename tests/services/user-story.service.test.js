import { jest } from '@jest/globals';
import * as userStoryService from '../../src/services/user-story.service.js';
import * as userStoryRepository from '../../src/repositories/user-story.repository.js';
import { StoryGeneratorAgent } from '../../src/agents/story-generator-agent.js';

jest.mock('../../src/repositories/user-story.repository.js');
jest.mock('../../src/agents/story-generator-agent.js');

describe('User Story Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUserStories', () => {
    it('should generate user stories and save to database', async () => {
      const mockTestScenario = {
        title: 'User Login',
        description: 'Test user login',
        type: 'functional',
      };

      const mockGeneratedStories = [
        {
          id: 'US-001',
          title: 'User Login',
          story: 'As a user, I want to login, so that I can access my account',
          priority: 'high',
          estimatedPoints: '3',
        },
      ];

      const mockAgentResult = {
        success: true,
        data: mockGeneratedStories,
        metadata: {
          agent: 'User Story Generator Agent',
          version: '1.0.0',
          generatedAt: '2026-01-16T00:00:00.000Z',
        },
      };

      const mockSavedEntry = {
        id: 'entry-123',
        createdAt: '2026-01-16T00:00:00.000Z',
        testScenario: mockTestScenario,
        userStories: mockGeneratedStories,
        provider: 'openai',
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      userStoryRepository.create.mockReturnValue(mockSavedEntry);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'openai');

      expect(result.success).toBe(true);
      expect(result.id).toBe('entry-123');
      expect(userStoryRepository.create).toHaveBeenCalledWith(
        mockTestScenario,
        mockGeneratedStories,
        'openai'
      );
    });

    it('should return error when agent fails', async () => {
      const mockTestScenario = {
        title: 'Test',
        description: 'Test description',
        type: 'functional',
      };

      const mockAgentResult = {
        success: false,
        error: 'Agent error',
        metadata: {
          agent: 'User Story Generator Agent',
          version: '1.0.0',
        },
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'openai');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent error');
      expect(userStoryRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when database save fails', async () => {
      const mockTestScenario = {
        title: 'Test',
        description: 'Test description',
        type: 'functional',
      };

      const mockAgentResult = {
        success: true,
        data: [],
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      userStoryRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        userStoryService.generateUserStories(mockTestScenario, 'openai')
      ).rejects.toThrow('Failed to save user stories: Database error');
    });
  });

  describe('getAllUserStories', () => {
    it('should return all user stories', () => {
      const mockDb = {
        userStories: [{ id: '1' }, { id: '2' }],
      };

      userStoryRepository.findAll.mockReturnValue(mockDb);

      const result = userStoryService.getAllUserStories();

      expect(result).toEqual(mockDb);
      expect(userStoryRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getUserStoryById', () => {
    it('should return user story by id', () => {
      const mockStory = { id: '123' };

      userStoryRepository.findById.mockReturnValue(mockStory);

      const result = userStoryService.getUserStoryById('123');

      expect(result).toEqual(mockStory);
      expect(userStoryRepository.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('deleteUserStoryById', () => {
    it('should delete user story by id', () => {
      userStoryRepository.deleteById.mockReturnValue(true);

      const result = userStoryService.deleteUserStoryById('123');

      expect(result).toBe(true);
      expect(userStoryRepository.deleteById).toHaveBeenCalledWith('123');
    });
  });
});
