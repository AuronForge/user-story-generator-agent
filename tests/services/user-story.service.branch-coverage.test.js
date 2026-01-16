import { jest } from '@jest/globals';

// Set environment variable for tests
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

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

describe('User Story Service - Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateUserStories with various providers', () => {
    it('should work with github provider explicitly', async () => {
      const mockTestScenario = {
        title: 'GitHub Test',
        description: 'Testing GitHub provider',
        given: 'User is authenticated',
        when: 'User performs action',
        then: 'Action succeeds',
      };

      const mockGeneratedStories = [
        {
          id: 'US-GH-001',
          title: 'GitHub Story',
          description: 'GitHub story description',
          story: 'As a user, I want GitHub integration',
          priority: 'high',
        },
      ];

      const mockAgentResult = {
        success: true,
        data: mockGeneratedStories,
        metadata: {
          agent: 'User Story Generator Agent',
          version: '1.0.0',
        },
      };

      const mockSavedEntry = {
        id: 'entry-github',
        provider: 'github',
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      mockCreate.mockReturnValue(mockSavedEntry);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'github');

      expect(result.success).toBe(true);
      expect(result.id).toBe('entry-github');
      expect(mockCreate).toHaveBeenCalledWith(mockTestScenario, mockGeneratedStories, 'github');
    });

    it('should work with anthropic provider explicitly', async () => {
      const mockTestScenario = {
        title: 'Anthropic Test',
        description: 'Testing Anthropic provider',
        given: 'System is ready',
        when: 'User initiates process',
        then: 'Process completes',
      };

      const mockGeneratedStories = [
        {
          id: 'US-AN-001',
          title: 'Anthropic Story',
          description: 'Anthropic story description',
          story: 'As a user, I want Anthropic integration',
          priority: 'medium',
        },
      ];

      const mockAgentResult = {
        success: true,
        data: mockGeneratedStories,
      };

      const mockSavedEntry = {
        id: 'entry-anthropic',
        provider: 'anthropic',
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      mockCreate.mockReturnValue(mockSavedEntry);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'anthropic');

      expect(result.success).toBe(true);
      expect(result.id).toBe('entry-anthropic');
      expect(mockCreate).toHaveBeenCalledWith(mockTestScenario, mockGeneratedStories, 'anthropic');
    });

    it('should handle agent success with empty data array', async () => {
      const mockTestScenario = {
        title: 'Empty Result Test',
        description: 'Testing empty results',
        given: 'System has no data',
        when: 'User requests stories',
        then: 'Empty array returned',
      };

      const mockAgentResult = {
        success: true,
        data: [],
      };

      const mockSavedEntry = {
        id: 'entry-empty',
        userStories: [],
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      mockCreate.mockReturnValue(mockSavedEntry);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'github');

      expect(result.success).toBe(true);
      expect(result.id).toBe('entry-empty');
    });

    it('should not save when agent fails', async () => {
      const mockTestScenario = {
        title: 'Failure Test',
        description: 'Testing agent failure',
      };

      const mockAgentResult = {
        success: false,
        error: 'Validation failed',
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);

      const result = await userStoryService.generateUserStories(mockTestScenario, 'github');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should handle database save errors correctly', async () => {
      const mockTestScenario = {
        title: 'DB Error Test',
        description: 'Testing database error handling',
        given: 'Database is unavailable',
        when: 'Save is attempted',
        then: 'Error is thrown',
      };

      const mockAgentResult = {
        success: true,
        data: [{ id: 'US-001', title: 'Test' }],
      };

      StoryGeneratorAgent.prototype.generateUserStories = jest
        .fn()
        .mockResolvedValue(mockAgentResult);
      mockCreate.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      await expect(
        userStoryService.generateUserStories(mockTestScenario, 'github')
      ).rejects.toThrow('Failed to save user stories: Database connection failed');
    });
  });

  describe('getAllUserStories', () => {
    it('should return all user stories from repository', () => {
      const mockDb = {
        userStories: [
          { id: '1', title: 'Story 1' },
          { id: '2', title: 'Story 2' },
          { id: '3', title: 'Story 3' },
        ],
      };

      mockFindAll.mockReturnValue(mockDb);

      const result = userStoryService.getAllUserStories();

      expect(result.userStories).toHaveLength(3);
      expect(mockFindAll).toHaveBeenCalled();
    });

    it('should return empty array when no stories exist', () => {
      const mockDb = {
        userStories: [],
      };

      mockFindAll.mockReturnValue(mockDb);

      const result = userStoryService.getAllUserStories();

      expect(result.userStories).toEqual([]);
    });
  });

  describe('getUserStoryById', () => {
    it('should return story when id exists', () => {
      const mockStory = {
        id: 'found-id',
        title: 'Found Story',
      };

      mockFindById.mockReturnValue(mockStory);

      const result = userStoryService.getUserStoryById('found-id');

      expect(result).toEqual(mockStory);
      expect(mockFindById).toHaveBeenCalledWith('found-id');
    });

    it('should return undefined when id does not exist', () => {
      mockFindById.mockReturnValue(undefined);

      const result = userStoryService.getUserStoryById('not-found');

      expect(result).toBeUndefined();
    });
  });

  describe('deleteUserStoryById', () => {
    it('should return true when deletion succeeds', () => {
      mockDeleteById.mockReturnValue(true);

      const result = userStoryService.deleteUserStoryById('delete-id');

      expect(result).toBe(true);
      expect(mockDeleteById).toHaveBeenCalledWith('delete-id');
    });

    it('should return null when entry not found', () => {
      mockDeleteById.mockReturnValue(null);

      const result = userStoryService.deleteUserStoryById('not-found');

      expect(result).toBe(null);
    });
  });
});
