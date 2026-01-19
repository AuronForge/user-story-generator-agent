import { generateUserStories } from '../../src/controllers/user-story.controller.js';

/**
 * @swagger
 * /generate-user-stories:
 *   post:
 *     summary: Generates user stories from a test scenario
 *     description: Uses AI to automatically generate Agile user stories based on test scenario input. Supports multiple AI providers.
 *     tags:
 *       - User Stories
 *     parameters:
 *       - $ref: '#/components/parameters/AIProvider'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TestScenario'
 *           examples:
 *             login:
 *               summary: Login Test Scenario
 *               value:
 *                 title: User Login Authentication
 *                 description: Verify that users can login with valid credentials
 *                 type: functional
 *                 steps:
 *                   - action: Navigate to login page
 *                     expectedResult: Login page is displayed
 *                   - action: Enter valid email and password
 *                     expectedResult: Credentials are accepted
 *                   - action: Click login button
 *                     expectedResult: User is redirected to dashboard
 *     responses:
 *       200:
 *         description: User stories generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenerateResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-ai-provider');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Delegate to controller
  return generateUserStories(req, res);
}
