import { jest } from '@jest/globals';
import { StoryGeneratorAgent } from '../../src/agents/story-generator-agent.js';
import { AIService } from '../../src/services/ai-service.js';

jest.mock('../../src/services/ai-service.js');

describe('Story Generator Agent', () => {
  let agent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new StoryGeneratorAgent('openai');
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.agentName).toBe('User Story Generator Agent');
      expect(agent.version).toBe('1.0.0');
      expect(agent.aiService).toBeInstanceOf(AIService);
    });

    it('should accept different AI providers', () => {
      const githubAgent = new StoryGeneratorAgent('github');
      expect(githubAgent.aiService).toBeInstanceOf(AIService);
    });
  });

  describe('generateUserStories', () => {
    it('should generate user stories successfully', async () => {
      const mockTestScenario = {
        title: 'User Login',
        description: 'Test user login functionality',
        type: 'functional',
      };

      const mockAIResponse = JSON.stringify({
        userStories: [
          {
            id: 'US-001',
            title: 'User Login',
            description: 'Enable user authentication',
            story: 'As a user, I want to login, so that I can access my account',
            priority: 'high',
            dependsOn: [],
            acceptanceCriteria: [
              {
                criterion: 'Given valid credentials, when user logs in, then access is granted',
                type: 'given',
              },
            ],
            businessValue: 'Secure user access',
            estimatedPoints: '3',
            team: 'Backend',
            technicalNotes: 'Use JWT authentication',
            tags: ['auth', 'security'],
          },
        ],
      });

      AIService.prototype.generateCompletion = jest.fn().mockResolvedValue(mockAIResponse);

      const result = await agent.generateUserStories(mockTestScenario);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('US-001');
      expect(result.metadata.agent).toBe('User Story Generator Agent');
      expect(AIService.prototype.generateCompletion).toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      const invalidScenario = {
        // Missing required fields
        title: '',
      };

      const result = await agent.generateUserStories(invalidScenario);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metadata.agent).toBe('User Story Generator Agent');
    });

    it('should handle AI service errors', async () => {
      const mockTestScenario = {
        title: 'Test',
        description: 'Test description',
        type: 'functional',
      };

      AIService.prototype.generateCompletion = jest
        .fn()
        .mockRejectedValue(new Error('AI Service Error'));

      const result = await agent.generateUserStories(mockTestScenario);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI Service Error');
    });

    it('should handle invalid AI response format', async () => {
      const mockTestScenario = {
        title: 'Test',
        description: 'Test description',
        type: 'functional',
      };

      const invalidResponse = JSON.stringify({
        userStories: [
          {
            // Missing required fields
            id: 'US-001',
          },
        ],
      });

      AIService.prototype.generateCompletion = jest.fn().mockResolvedValue(invalidResponse);

      const result = await agent.generateUserStories(mockTestScenario);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to parse AI response');
    });
  });

  describe('parseAIResponse', () => {
    it('should parse valid AI response', () => {
      const mockResponse = JSON.stringify({
        userStories: [
          {
            id: 'US-001',
            title: 'Test Story',
            description: 'Test description',
            story: 'As a user, I want to test, so that I can verify',
            priority: 'high',
            dependsOn: [],
            acceptanceCriteria: [
              {
                criterion: 'Given a condition, when action occurs, then result happens',
                type: 'given',
              },
            ],
            businessValue: 'Test value',
            estimatedPoints: '3',
            team: 'Backend',
            technicalNotes: 'Test notes',
            tags: ['test'],
          },
        ],
      });

      const result = agent.parseAIResponse(mockResponse);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('US-001');
    });

    it('should throw error for invalid JSON', () => {
      const invalidResponse = 'not valid json';

      expect(() => agent.parseAIResponse(invalidResponse)).toThrow('Failed to parse AI response');
    });

    it('should throw error for invalid user story schema', () => {
      const invalidResponse = JSON.stringify({
        userStories: [
          {
            id: 'US-001',
            // Missing required fields
          },
        ],
      });

      expect(() => agent.parseAIResponse(invalidResponse)).toThrow('Failed to parse AI response');
    });
  });

  describe('analyzeUserStories', () => {
    it('should analyze user stories correctly', async () => {
      const mockStories = [
        {
          id: 'US-001',
          priority: 'high',
          estimatedPoints: '5',
          dependsOn: ['US-002'],
        },
        {
          id: 'US-002',
          priority: 'medium',
          estimatedPoints: '3',
          dependsOn: [],
        },
        {
          id: 'US-003',
          priority: 'low',
          estimatedPoints: '2',
          dependsOn: [],
        },
      ];

      const analysis = await agent.analyzeUserStories(mockStories);

      expect(analysis.total).toBe(3);
      expect(analysis.byPriority.high).toBe(1);
      expect(analysis.byPriority.medium).toBe(1);
      expect(analysis.byPriority.low).toBe(1);
      expect(analysis.totalPoints).toBe(10);
      expect(analysis.dependencies).toBe(1);
    });

    it('should handle empty user stories array', async () => {
      const analysis = await agent.analyzeUserStories([]);

      expect(analysis.total).toBe(0);
      expect(analysis.totalPoints).toBe(0);
      expect(analysis.dependencies).toBe(0);
    });
  });
});
