/**
 * Health check endpoint
 * Returns API status and version information
 *
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Returns API status, version information and available endpoints
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: API is healthy and operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: user-story-generator-agent
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 apiVersion:
 *                   type: string
 *                   example: v1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-19T10:30:00.000Z
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     generateUserStories:
 *                       type: string
 *                       example: /api/v1/generate-user-stories
 *                     userStories:
 *                       type: string
 *                       example: /api/v1/user-stories
 *                     swagger:
 *                       type: string
 *                       example: /api/v1/swagger
 *                     docs:
 *                       type: string
 *                       example: /api/v1/api-docs
 *       405:
 *         description: Method not allowed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Method not allowed
 */
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
    status: 'ok',
    service: 'user-story-generator-agent',
    version: '1.0.0',
    apiVersion: 'v1',
    timestamp: new Date().toISOString(),
    endpoints: {
      generateUserStories: '/api/v1/generate-user-stories',
      userStories: '/api/v1/user-stories',
      swagger: '/api/v1/swagger',
      docs: '/api/v1/api-docs',
    },
  });
}
