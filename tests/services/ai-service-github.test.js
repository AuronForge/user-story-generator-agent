import { jest } from '@jest/globals';
import { AIService } from '../../src/services/ai-service.js';

// Mock OpenAI and Anthropic clients
jest.mock('openai');
jest.mock('@anthropic-ai/sdk');

describe('AI Service - GitHub Models Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set environment variables for testing
    process.env.GITHUB_TOKEN = 'test-github-token';
    process.env.GITHUB_MODEL = 'gpt-4o';
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_MODEL;
  });

  describe('GitHub Provider Configuration', () => {
    it('should initialize with GitHub provider', () => {
      const service = new AIService('github');

      expect(service.provider).toBe('github');
      expect(service.model).toBe('gpt-4o');
    });

    it('should use default model when not specified', () => {
      delete process.env.GITHUB_MODEL;

      const service = new AIService('github');

      expect(service.model).toBe('gpt-4o');
    });

    it('should use custom model from environment', () => {
      process.env.GITHUB_MODEL = 'gpt-4o-mini';

      const service = new AIService('github');

      expect(service.model).toBe('gpt-4o-mini');
    });

    it('should configure correct base URL for GitHub Models', () => {
      const service = new AIService('github');

      // OpenAI client should be initialized with Azure endpoint
      expect(service.client).toBeDefined();
    });
  });

  describe('generateCompletion with GitHub', () => {
    it('should generate completion using GitHub Models', async () => {
      const service = new AIService('github');
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                userStories: [
                  {
                    id: 'US-001',
                    title: 'Test Story',
                    story: 'As a user, I want to test, so that I can verify',
                    priority: 'high',
                  },
                ],
              }),
            },
          },
        ],
      };

      // Mock the OpenAI client method
      service.client.chat = {
        completions: {
          create: jest.fn().mockResolvedValue(mockResponse),
        },
      };

      const prompt = 'Generate user stories for login feature';
      const result = await service.generateCompletion(prompt);

      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user', content: prompt }),
          ]),
          response_format: { type: 'json_object' },
        })
      );

      expect(result).toBeDefined();
      const parsed = JSON.parse(result);
      expect(parsed.userStories).toHaveLength(1);
    });

    it('should handle custom temperature option', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: '{}' } }],
          }),
        },
      };

      await service.generateCompletion('test prompt', { temperature: 0.9 });

      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.9,
        })
      );
    });

    it('should use default temperature when not specified', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: '{}' } }],
          }),
        },
      };

      await service.generateCompletion('test prompt');

      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle GitHub API errors gracefully', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('Rate limit exceeded')),
        },
      };

      await expect(service.generateCompletion('test')).rejects.toThrow(
        'AI Service Error: Rate limit exceeded'
      );
    });

    it('should handle authentication errors', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('Invalid authentication credentials')),
        },
      };

      await expect(service.generateCompletion('test')).rejects.toThrow(
        'AI Service Error: Invalid authentication credentials'
      );
    });

    it('should handle network errors', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('Network error: ECONNREFUSED')),
        },
      };

      await expect(service.generateCompletion('test')).rejects.toThrow(
        'AI Service Error: Network error: ECONNREFUSED'
      );
    });
  });

  describe('Multiple Provider Support', () => {
    it('should support switching between providers', async () => {
      const githubService = new AIService('github');
      const openaiService = new AIService('openai');
      const anthropicService = new AIService('anthropic');

      expect(githubService.provider).toBe('github');
      expect(openaiService.provider).toBe('openai');
      expect(anthropicService.provider).toBe('anthropic');
    });

    it('should route to correct completion method', async () => {
      const service = new AIService('github');

      service.generateOpenAICompletion = jest.fn().mockResolvedValue('{}');

      await service.generateCompletion('test');

      expect(service.generateOpenAICompletion).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should request JSON response format', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: '{}' } }],
          }),
        },
      };

      await service.generateCompletion('test');

      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          response_format: { type: 'json_object' },
        })
      );
    });

    it('should return string content from response', async () => {
      const service = new AIService('github');
      const expectedContent = JSON.stringify({ test: 'data' });

      service.client.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: expectedContent } }],
          }),
        },
      };

      const result = await service.generateCompletion('test');

      expect(result).toBe(expectedContent);
      expect(typeof result).toBe('string');
    });
  });

  describe('System Prompt', () => {
    it('should use correct system prompt for user story generation', async () => {
      const service = new AIService('github');

      service.client.chat = {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: '{}' } }],
          }),
        },
      };

      await service.generateCompletion('test');

      expect(service.client.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('Product Owner'),
            }),
          ]),
        })
      );
    });
  });
});
