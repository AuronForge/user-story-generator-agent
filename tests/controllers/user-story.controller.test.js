import { jest } from '@jest/globals';

// Mock before importing
const mockGenerateUserStories = jest.fn();
const mockGetAllUserStories = jest.fn();
const mockGetUserStoryById = jest.fn();

await jest.unstable_mockModule('../../src/services/user-story.service.js', () => ({
  generateUserStories: mockGenerateUserStories,
  getAllUserStories: mockGetAllUserStories,
  getUserStoryById: mockGetUserStoryById,
}));

// Import after mocking
const { generateUserStories, getUserStories } =
  await import('../../src/controllers/user-story.controller.js');

describe('User Story Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      headers: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  describe('generateUserStories', () => {
    it('should generate user stories successfully', async () => {
      const mockResult = {
        success: true,
        data: [
          {
            id: 'US-001',
            title: 'User Login',
            story: 'As a user, I want to login, so that I can access my account',
            priority: 'high',
            estimatedPoints: '3',
          },
        ],
        metadata: {
          agent: 'User Story Generator Agent',
          version: '1.0.0',
          generatedAt: '2026-01-16T00:00:00.000Z',
        },
        id: 'test-id',
      };

      req.body = {
        title: 'User Login Authentication',
        description: 'Verify user can login',
        type: 'functional',
      };

      req.headers['x-ai-provider'] = 'openai';

      mockGenerateUserStories.mockResolvedValue(mockResult);

      await generateUserStories(req, res);

      expect(mockGenerateUserStories).toHaveBeenCalledWith(req.body, 'openai');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should use default provider when not specified', async () => {
      const mockResult = {
        success: true,
        data: [],
      };

      req.body = {
        title: 'Test',
        description: 'Test description',
        type: 'functional',
      };

      mockGenerateUserStories.mockResolvedValue(mockResult);

      await generateUserStories(req, res);

      expect(mockGenerateUserStories).toHaveBeenCalledWith(req.body, 'openai');
    });

    it('should return 400 when generation fails', async () => {
      const mockResult = {
        success: false,
        error: 'Invalid test scenario',
      };

      req.body = {
        title: 'Test',
      };

      mockGenerateUserStories.mockResolvedValue(mockResult);

      await generateUserStories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle service errors', async () => {
      req.body = {
        title: 'Test',
        description: 'Test description',
        type: 'functional',
      };

      mockGenerateUserStories.mockRejectedValue(new Error('Service error'));

      await generateUserStories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Service error',
        })
      );
    });
  });

  describe('getUserStories', () => {
    it('should get all user stories', async () => {
      const mockDb = {
        userStories: [
          {
            id: 'test-1',
            createdAt: '2026-01-16T00:00:00.000Z',
            testScenario: { title: 'Test 1' },
            userStories: [],
            provider: 'openai',
          },
        ],
      };

      mockGetAllUserStories.mockReturnValue(mockDb);

      await getUserStories(req, res);

      expect(mockGetAllUserStories).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        total: 1,
        data: mockDb.userStories,
      });
    });

    it('should get user story by ID', async () => {
      const mockStory = {
        id: 'test-1',
        createdAt: '2026-01-16T00:00:00.000Z',
        testScenario: { title: 'Test 1' },
        userStories: [],
        provider: 'openai',
      };

      req.query.id = 'test-1';

      mockGetUserStoryById.mockReturnValue(mockStory);

      await getUserStories(req, res);

      expect(mockGetUserStoryById).toHaveBeenCalledWith('test-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockStory,
      });
    });

    it('should return 404 when user story not found', async () => {
      req.query.id = 'nonexistent';

      mockGetUserStoryById.mockReturnValue(undefined);

      await getUserStories(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User story entry not found',
      });
    });

    it('should handle service errors', async () => {
      mockGetAllUserStories.mockImplementation(() => {
        throw new Error('Database error');
      });

      await getUserStories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Database error',
        })
      );
    });
  });
});
