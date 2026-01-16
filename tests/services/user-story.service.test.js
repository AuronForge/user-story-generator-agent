import { jest } from '@jest/globals';

// Set environment variable for tests
process.env.GITHUB_TOKEN = 'test-github-token';

// Mock repository before importing
const mockCreate = jest.fn();
const mockFindAll = jest.fn();
const mockFindById = jest.fn();
const mockDeleteById = jest.fn();

await jest.unstable_mockModule('../../src/repositories/user-story.repository.js', () => ({
  create: mockCreate,
  findAll: mockFindAll,
  findById: mockFindById,
  deleteById: mockDeleteById,
}));

// Import after mocking
const userStoryService = await import('../../src/services/user-story.service.js');
const { StoryGeneratorAgent } = await import('../../src/agents/story-generator-agent.js');

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
        provider: 'github',
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      mockCreate.mockReturnValue(mockSavedEntry);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'github');

      expect(result.success).toBe(true);
      expect(result.id).toBe('entry-123');
      expect(mockCreate).toHaveBeenCalledWith(mockTestScenario, mockGeneratedStories, 'github');
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
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'github');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Agent error');
      expect(mockCreate).not.toHaveBeenCalled();
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
      mockCreate.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(
        userStoryService.generateUserStories(mockTestScenario, 'github')
      ).rejects.toThrow('Failed to save user stories: Database error');
    });
  });

  describe('getAllUserStories', () => {
    it('should return all user stories', () => {
      const mockDb = {
        userStories: [{ id: '1' }, { id: '2' }],
      };

      mockFindAll.mockReturnValue(mockDb);

      const result = userStoryService.getAllUserStories();

      expect(result).toEqual(mockDb);
      expect(mockFindAll).toHaveBeenCalled();
    });
  });

  describe('getUserStoryById', () => {
    it('should return user story by id', () => {
      const mockStory = { id: '123' };

      mockFindById.mockReturnValue(mockStory);

      const result = userStoryService.getUserStoryById('123');

      expect(result).toEqual(mockStory);
      expect(mockFindById).toHaveBeenCalledWith('123');
    });
  });

  describe('deleteUserStoryById', () => {
    it('should delete user story by id', () => {
      mockDeleteById.mockReturnValue(true);

      const result = userStoryService.deleteUserStoryById('123');

      expect(result).toBe(true);
      expect(mockDeleteById).toHaveBeenCalledWith('123');
    });
  });
});
