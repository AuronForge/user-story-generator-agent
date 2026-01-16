import { validateInput, normalizeToScenarios } from '../schemas/test-scenario-schema.js';
import { userStorySchema } from '../schemas/user-story-schema.js';
import { AIService } from '../services/ai-service.js';
import { generateUserStoryPrompt } from '../prompts/user-story-generation-prompt.js';

export class StoryGeneratorAgent {
  constructor(aiProvider = 'openai') {
    this.aiService = new AIService(aiProvider);
    this.agentName = 'User Story Generator Agent';
    this.version = '1.0.0';
  }

  async generateUserStories(input) {
    try {
      // Validate input (accepts both single scenario or test suite)
      const validatedInput = validateInput(input);

      // Normalize to array of scenarios
      const { scenarios, metadata } = normalizeToScenarios(validatedInput);

      // Generate user stories for all scenarios
      const allUserStories = [];

      for (const scenario of scenarios) {
        const prompt = generateUserStoryPrompt(scenario);
        const aiResponse = await this.aiService.generateCompletion(prompt);
        const stories = this.parseAIResponse(aiResponse);
        allUserStories.push(...stories);
      }

      return {
        success: true,
        data: allUserStories,
        metadata: {
          agent: this.agentName,
          version: this.version,
          generatedAt: new Date().toISOString(),
          scenariosProcessed: scenarios.length,
          featureMetadata: metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metadata: {
          agent: this.agentName,
          version: this.version,
        },
      };
    }
  }

  parseAIResponse(aiResponse) {
    try {
      const parsed = JSON.parse(aiResponse);

      // Validate each user story
      const validatedStories = parsed.userStories.map(story => userStorySchema.parse(story));

      return validatedStories;
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  async analyzeUserStories(userStories) {
    // Analyze user stories for quality metrics
    const analysis = {
      total: userStories.length,
      byPriority: {
        high: 0,
        medium: 0,
        low: 0,
      },
      totalPoints: 0,
      dependencies: 0,
    };

    userStories.forEach(story => {
      analysis.byPriority[story.priority]++;
      analysis.totalPoints += parseInt(story.estimatedPoints || '0', 10);
      if (story.dependsOn && story.dependsOn.length > 0) {
        analysis.dependencies++;
      }
    });

    return analysis;
  }
}
