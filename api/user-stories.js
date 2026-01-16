import { getUserStories } from '../src/controllers/user-story.controller.js';

/**
 * @swagger
 * /api/user-stories:
 *   get:
 *     summary: Lists all generated user stories or retrieves a specific one
 *     description: Returns all user stories entries or a specific entry by ID. Entries are automatically saved to database after generation.
 *     tags:
 *       - User Stories
 *     parameters:
 *       - $ref: '#/components/parameters/UserStoryId'
 *     responses:
 *       200:
 *         description: List of user stories or specific entry
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     total:
 *                       type: integer
 *                       description: Total number of entries
 *                       example: 5
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserStoryEntry'
 *                 - type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *                       example: true
 *                     data:
 *                       $ref: '#/components/schemas/UserStoryEntry'
 *       404:
 *         description: Entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: User story entry not found
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  // Delegate to controller
  return getUserStories(req, res);
}
