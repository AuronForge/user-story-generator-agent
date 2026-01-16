import * as userStoryService from '../services/user-story.service.js';

/**
 * Generate user stories controller
 * Accepts both single test scenario or full test suite from test-scenario-generator
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const generateUserStories = async (req, res) => {
  try {
    let input = req.body;
    const aiProvider = req.headers['x-ai-provider'] || 'openai';

    // If input comes wrapped in the test-scenario-generator response format
    // Extract the actual data from the "data" field
    if (input.success && input.data) {
      input = input.data;
    }

    const result = await userStoryService.generateUserStories(input, aiProvider);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * Get all user stories or specific user story by ID
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getUserStories = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const userStory = userStoryService.getUserStoryById(id);

      if (!userStory) {
        return res.status(404).json({
          success: false,
          error: 'User story entry not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: userStory,
      });
    }

    const db = userStoryService.getAllUserStories();

    return res.status(200).json({
      success: true,
      total: db.userStories.length,
      data: db.userStories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};
