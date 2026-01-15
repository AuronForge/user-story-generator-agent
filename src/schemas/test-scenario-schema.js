import { z } from 'zod';

/**
 * Test Step Schema
 */
export const testStepSchema = z.object({
  stepNumber: z.number().int().positive().optional(),
  action: z.string().min(3, 'Action must be at least 3 characters'),
  expectedResult: z.string().min(3, 'Expected result must be at least 3 characters'),
  data: z.record(z.any()).optional(),
});

/**
 * Test Scenario Schema (Input)
 */
export const testScenarioSchema = z.object({
  scenarioId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z
    .enum(['functional', 'non-functional', 'integration', 'e2e', 'unit'])
    .optional()
    .default('functional'),
  priority: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  preconditions: z.array(z.string()).optional().default([]),
  steps: z
    .array(testStepSchema)
    .min(1, 'At least one test step is required')
    .refine(steps => steps.length > 0, {
      message: 'Test scenario must have at least one step',
    }),
  expectedOutcome: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * Validate test scenario
 */
export function validateTestScenario(data) {
  return testScenarioSchema.parse(data);
}

/**
 * Safe validation with error details
 */
export function safeValidateTestScenario(data) {
  const result = testScenarioSchema.safeParse(data);

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
