import { z } from 'zod';

/**
 * Team enum - Responsible teams
 */
export const teamEnum = z.enum(['Frontend', 'Backend', 'User Experience', 'Quality Assurance']);

/**
 * Priority enum
 */
export const priorityEnum = z.enum(['high', 'medium', 'low']);

/**
 * Fibonacci points for story estimation
 * Based on complexity and technical difficulty
 */
export const fibonacciPoints = z.enum(['1', '2', '3', '5', '8', '13', '21', '34']);

/**
 * Acceptance Criterion (Definition of Done)
 */
export const acceptanceCriterionSchema = z.object({
  id: z.string().optional(),
  criterion: z.string().min(5, 'Acceptance criterion must be at least 5 characters'),
  type: z.enum(['given', 'when', 'then', 'and', 'general']).optional().default('general'),
});

/**
 * User Story Schema (Output)
 */
export const userStorySchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  story: z
    .string()
    .min(10, 'User story narrative must be at least 10 characters')
    .regex(
      /^As a .+, I want .+, so that .+$/i,
      'User story must follow format: "As a [role], I want [feature], so that [benefit]"'
    )
    .optional(),
  priority: priorityEnum,
  dependsOn: z
    .array(z.string())
    .optional()
    .default([])
    .describe('IDs of user stories this story depends on'),
  acceptanceCriteria: z
    .array(acceptanceCriterionSchema)
    .min(1, 'At least one acceptance criterion is required'),
  team: teamEnum.describe('Responsible team for implementation'),
  storyPoints: fibonacciPoints.describe('Story points using Fibonacci sequence'),
  complexity: z
    .enum(['low', 'medium', 'high', 'very-high'])
    .optional()
    .describe('Technical complexity level'),
  technicalNotes: z.string().optional().describe('Technical implementation details'),
  businessValue: z.string().optional().describe('Business value and impact'),
  relatedStep: z
    .object({
      stepNumber: z.number().int().positive(),
      action: z.string(),
    })
    .optional()
    .describe('Related test scenario step'),
});

/**
 * User Story Generation Response
 */
export const userStoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userStorySchema),
  metadata: z
    .object({
      agent: z.string(),
      version: z.string(),
      generatedAt: z.string(),
      totalStories: z.number().int().nonnegative(),
      testScenarioTitle: z.string(),
    })
    .optional(),
  id: z.string().optional(),
});

/**
 * Validate user story
 */
export function validateUserStory(data) {
  return userStorySchema.parse(data);
}

/**
 * Validate user story response
 */
export function validateUserStoryResponse(data) {
  return userStoryResponseSchema.parse(data);
}

/**
 * Safe validation with error details
 */
export function safeValidateUserStory(data) {
  const result = userStorySchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Helper to create acceptance criteria in Gherkin format
 */
export function createGherkinCriterion(given, when, then) {
  return [
    {
      criterion: `Given ${given}`,
      type: 'given',
    },
    {
      criterion: `When ${when}`,
      type: 'when',
    },
    {
      criterion: `Then ${then}`,
      type: 'then',
    },
  ];
}
