import { StoryGeneratorAgent } from '../agents/story-generator-agent.js';
import * as userStoryRepository from '../repositories/user-story.repository.js';

/**
 * Generate user stories from test scenario(s)
 * Accepts both single scenario or full test suite from test-scenario-generator
 * @param {Object} input - Test scenario or test suite with multiple scenarios
 * @param {string} provider - AI provider (openai, github, anthropic)
 * @returns {Promise<Object>} Generated user stories result
 */
export const generateUserStories = async (input, provider = 'openai') => {
  const storyAgent = new StoryGeneratorAgent(provider);
  const result = await storyAgent.generateUserStories(input);

  if (!result.success) {
    return result;
  }

  // Save to database
  try {
    const savedEntry = userStoryRepository.create(input, result.data, provider);
    result.id = savedEntry.id;
    console.log(`✅ User stories saved to database with ID: ${savedEntry.id}`);
  } catch (dbError) {
    console.error('⚠️ Error saving to database:', dbError.message);
    throw new Error(`Failed to save user stories: ${dbError.message}`);
  }

  return result;
};

/**
 * Get all user story entries
 * @returns {Object} All user story entries
 */
export const getAllUserStories = () => {
  return userStoryRepository.findAll();
};

/**
 * Get user story entry by ID
 * @param {string} id - User story entry ID
 * @returns {Object|undefined} User story entry or undefined
 */
export const getUserStoryById = id => {
  return userStoryRepository.findById(id);
};

/**
 * Delete user story entry by ID
 * @param {string} id - User story entry ID
 * @returns {boolean|null} True if deleted, null if not found
 */
export const deleteUserStoryById = id => {
  return userStoryRepository.deleteById(id);
};
