import { jest } from '@jest/globals';
import { StoryGeneratorAgent } from '../../src/agents/story-generator-agent.js';

// Set environment variables before any imports
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.GITHUB_MODEL = 'gpt-4o';

describe('Story Generator Agent', () => {
  let agent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new StoryGeneratorAgent('github');
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(agent.agentName).toBe('User Story Generator Agent');
      expect(agent.version).toBe('1.0.0');
      expect(agent.aiService).toBeDefined();
    });

    it('should accept different AI providers', () => {
      const githubAgent = new StoryGeneratorAgent('github');
      expect(githubAgent.aiService).toBeDefined();
      expect(githubAgent.aiService.provider).toBe('github');
    });

    it('should accept anthropic provider', () => {
      const anthropicAgent = new StoryGeneratorAgent('anthropic');
      expect(anthropicAgent.aiService.provider).toBe('anthropic');
    });
  });

  describe('generateUserStories', () => {
    it('should generate user stories successfully with single scenario', async () => {
      const mockTestScenario = {
        title: 'User Login',
        description: 'Test user login functionality',
        given: 'User is on login page',
        when: 'User enters valid credentials',
        then: 'User is logged in',
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

      jest.spyOn(agent.aiService, 'generateCompletion').mockResolvedValue(mockAIResponse);

      const result = await agent.generateUserStories(mockTestScenario);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('US-001');
      expect(result.metadata.agent).toBe('User Story Generator Agent');
      expect(agent.aiService.generateCompletion).toHaveBeenCalled();
    });

    it('should generate user stories for multiple scenarios', async () => {
      const mockTestSuite = {
        featureName: 'Shopping Cart',
        scenarios: [
          {
            title: 'Add to Cart',
            description: 'Add item to cart',
            given: 'User is on product page',
            when: 'User clicks Add to Cart',
            then: 'Product is added',
          },
          {
            title: 'Remove from Cart',
            description: 'Remove item from cart',
            given: 'User has items in cart',
            when: 'User clicks remove',
            then: 'Product is removed',
          },
        ],
      };

      const mockAIResponse1 = JSON.stringify({
        userStories: [
          {
            id: 'US-001',
            title: 'Add Product to Cart',
            description: 'Enable users to add products to their shopping cart',
            story: 'As a user, I want to add products',
            priority: 'high',
            dependsOn: [],
            acceptanceCriteria: [{ criterion: 'Product added', type: 'general' }],
            businessValue: 'Shopping',
            team: 'Frontend',
            tags: [],
          },
        ],
      });

      const mockAIResponse2 = JSON.stringify({
        userStories: [
          {
            id: 'US-002',
            title: 'Remove Product from Cart',
            description: 'Enable users to remove products from their shopping cart',
            story: 'As a user, I want to remove products',
            priority: 'medium',
            dependsOn: ['US-001'],
            acceptanceCriteria: [{ criterion: 'Product removed', type: 'general' }],
            businessValue: 'Shopping',
            team: 'Frontend',
            tags: [],
          },
        ],
      });

      jest
        .spyOn(agent.aiService, 'generateCompletion')
        .mockResolvedValueOnce(mockAIResponse1)
        .mockResolvedValueOnce(mockAIResponse2);

      const result = await agent.generateUserStories(mockTestSuite);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(agent.aiService.generateCompletion).toHaveBeenCalledTimes(2);
    });

    it('should handle validation errors', async () => {
      const invalidScenario = {
        // Missing required fields
        title: 'Te', // Too short
        description: 'Short', // Too short
      };

      const result = await agent.generateUserStories(invalidScenario);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metadata.agent).toBe('User Story Generator Agent');
    });

    it('should process test suite with feature metadata', async () => {
      const mockTestSuite = {
        featureName: 'Shopping Cart',
        description: 'Shopping cart functionality',
        scenarios: [
          {
            title: 'Add to Cart',
            description: 'Add item to cart',
            given: 'User is on product page',
            when: 'User clicks Add to Cart',
            then: 'Product is added',
          },
        ],
      };

      const mockAIResponse = JSON.stringify({
        userStories: [
          {
            id: 'US-001',
            title: 'Add Product to Cart',
            description: 'Shopping cart addition',
            story: 'As a user, I want to add products',
            priority: 'high',
            dependsOn: [],
            acceptanceCriteria: [{ criterion: 'Product added', type: 'general' }],
            businessValue: 'Shopping',
            team: 'Frontend',
            tags: [],
          },
        ],
      });

      jest.spyOn(agent.aiService, 'generateCompletion').mockResolvedValue(mockAIResponse);

      const result = await agent.generateUserStories(mockTestSuite);

      expect(result.success).toBe(true);
      expect(result.metadata.featureMetadata).toBeDefined();
      expect(result.metadata.featureMetadata.featureName).toBe('Shopping Cart');
    });

    it('should handle AI service errors', async () => {
      const mockTestScenario = {
        title: 'Test Scenario',
        description: 'Test description for error handling',
        given: 'User is on test page',
        when: 'User performs action',
        then: 'System responds',
      };

      jest
        .spyOn(agent.aiService, 'generateCompletion')
        .mockRejectedValue(new Error('AI Service Error'));

      const result = await agent.generateUserStories(mockTestScenario);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI Service Error');
    });

    it('should handle invalid AI response format', async () => {
      const mockTestScenario = {
        title: 'Test Scenario',
        description: 'Test description for invalid response',
        given: 'User is on test page',
        when: 'User performs action',
        then: 'System responds',
      };

      const invalidResponse = JSON.stringify({
        userStories: [
          {
            // Missing required fields
            id: 'US-001',
          },
        ],
      });

      jest.spyOn(agent.aiService, 'generateCompletion').mockResolvedValue(invalidResponse);

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

    it('should handle story without estimatedPoints field', async () => {
      const stories = [
        { id: 'US-100', priority: 'high' },
        { id: 'US-101', priority: 'medium', estimatedPoints: undefined },
      ];

      const analysis = await agent.analyzeUserStories(stories);

      expect(analysis.totalPoints).toBe(0);
      expect(analysis.total).toBe(2);
    });

    it('should handle story with null dependsOn', async () => {
      const stories = [{ id: 'US-102', priority: 'high', estimatedPoints: '5', dependsOn: null }];

      const analysis = await agent.analyzeUserStories(stories);

      expect(analysis.dependencies).toBe(0);
    });

    it('should handle story with empty dependsOn array', async () => {
      const stories = [{ id: 'US-103', priority: 'medium', estimatedPoints: '3', dependsOn: [] }];

      const analysis = await agent.analyzeUserStories(stories);

      expect(analysis.dependencies).toBe(0);
    });

    it('should handle story with non-empty dependsOn array', async () => {
      const stories = [
        { id: 'US-104', priority: 'low', estimatedPoints: '2', dependsOn: ['US-103'] },
      ];

      const analysis = await agent.analyzeUserStories(stories);

      expect(analysis.dependencies).toBe(1);
    });

    it('should calculate totalPoints correctly with various estimatedPoints', async () => {
      const stories = [
        { id: 'US-105', priority: 'high', estimatedPoints: '5' },
        { id: 'US-106', priority: 'medium', estimatedPoints: '8' },
        { id: 'US-107', priority: 'low', estimatedPoints: '13' },
      ];

      const analysis = await agent.analyzeUserStories(stories);

      expect(analysis.totalPoints).toBe(26);
    });
  });
});
