import { z } from 'zod';

/**
 * Test Step Schema
 */
export const testStepSchema = z.object({
  stepNumber: z.number().int().positive().optional(),
  action: z.string().min(3, 'Action must be at least 3 characters'),
  expectedResult: z.string().min(3, 'Expected result must be at least 3 characters'),
  testData: z.record(z.any()).optional().default({}),
});

/**
 * Individual Test Scenario Schema (traditional format with steps)
 */
export const testScenarioSchema = z.object({
  scenarioId: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z
    .enum(['functional', 'non-functional', 'integration', 'e2e', 'unit', 'negative', 'edge-case'])
    .optional()
    .default('functional'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional().default('medium'),
  preconditions: z.array(z.string()).optional().default([]),
  steps: z.array(testStepSchema).min(1, 'At least one test step is required'),
  expectedOutcome: z.string().optional(),
  testData: z.record(z.any()).optional().default({}),
  tags: z.array(z.string()).optional().default([]),
  estimatedDuration: z.string().optional(),
  automationPotential: z.enum(['high', 'medium', 'low']).optional(),
});

/**
 * BDD/Gherkin Style Scenario Schema (given/when/then format)
 */
export const bddScenarioSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  given: z.string().min(3, 'Given clause must be at least 3 characters'),
  when: z.string().min(3, 'When clause must be at least 3 characters'),
  then: z.string().min(3, 'Then clause must be at least 3 characters'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional().default('medium'),
  tags: z.array(z.string()).optional().default([]),
});

/**
 * Test Suite Schema (Multiple scenarios from test-scenario-generator)
 * Supports both traditional and BDD formats
 */
export const testSuiteSchema = z.object({
  projectName: z.string().optional(),
  featureId: z.string().optional(),
  featureName: z.string().optional(),
  description: z.string().optional(),
  generatedAt: z.string().optional(),
  scenarios: z
    .array(z.union([testScenarioSchema, bddScenarioSchema]))
    .min(1, 'At least one scenario is required'),
  coverage: z
    .object({
      acceptanceCriteria: z.number(),
      edgeCases: z.number(),
      negativeScenarios: z.number(),
    })
    .optional(),
  recommendations: z.array(z.string()).optional(),
});

/**
 * Input Schema - accepts single scenario (both formats) or full test suite
 */
export const inputSchema = z.union([testScenarioSchema, bddScenarioSchema, testSuiteSchema]);

/**
 * Validate input - accepts both single scenario or full test suite
 */
export function validateInput(data) {
  return inputSchema.parse(data);
}

/**
 * Check if input is a test suite (multiple scenarios)
 */
export function isTestSuite(data) {
  return data && typeof data === 'object' && 'scenarios' in data && Array.isArray(data.scenarios);
}

/**
 * Normalize input to array of scenarios
 */
export function normalizeToScenarios(data) {
  if (isTestSuite(data)) {
    return {
      scenarios: data.scenarios,
      metadata: {
        featureId: data.featureId,
        featureName: data.featureName,
        coverage: data.coverage,
        recommendations: data.recommendations,
      },
    };
  }

  // Single scenario
  return {
    scenarios: [data],
    metadata: null,
  };
}

/**
 * Validate test scenario (backward compatibility)
 */
export function validateTestScenario(data) {
  return testScenarioSchema.parse(data);
}

/**
 * Safe validation with error details
 */
export function safeValidateInput(data) {
  const result = inputSchema.safeParse(data);

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
