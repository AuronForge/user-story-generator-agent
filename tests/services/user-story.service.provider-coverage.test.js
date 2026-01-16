import { jest } from '@jest/globals';

// Set environment variables
process.env.GITHUB_TOKEN = 'test-github-token';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

// Mock repository
const mockCreate = jest.fn();
const mockFindAll = jest.fn();

await jest.unstable_mockModule('../../src/repositories/user-story.repository.js', () => ({
  create: mockCreate,
  findAll: mockFindAll,
}));

// Mock StoryGeneratorAgent completely
await jest.unstable_mockModule('../../src/agents/story-generator-agent.js', () => ({
  StoryGeneratorAgent: class MockAgent {
    constructor(provider) {
      this.provider = provider;
    }
    async generateUserStories(input) {
      return {
        success: true,
        data: [{ id: 'US-MOCK', title: 'Mock Story' }],
        metadata: { agent: 'Mock Agent' },
      };
    }
  },
}));

const userStoryService = await import('../../src/services/user-story.service.js');

describe('User Story Service - Provider Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockReturnValue({ id: 'saved-123' });
  });

  it('should work with explicit github provider', async () => {
    const input = { title: 'Test', description: 'Test desc' };

    const result = await userStoryService.generateUserStories(input, 'github');

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(input, expect.any(Array), 'github');
  });

  it('should work with explicit anthropic provider', async () => {
    const input = { title: 'Test2', description: 'Test desc 2' };

    const result = await userStoryService.generateUserStories(input, 'anthropic');

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(input, expect.any(Array), 'anthropic');
  });

  it('should work with default provider when undefined is passed', async () => {
    const input = { title: 'Test3', description: 'Test desc 3' };

    const result = await userStoryService.generateUserStories(input, undefined);

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(input, expect.any(Array), 'openai');
  });

  it('should work when no provider argument is passed at all', async () => {
    const input = { title: 'Test4', description: 'Test desc 4' };

    // Call without second argument
    const result = await userStoryService.generateUserStories(input);

    expect(result.success).toBe(true);
    expect(mockCreate).toHaveBeenCalledWith(input, expect.any(Array), 'openai');
  });
});
