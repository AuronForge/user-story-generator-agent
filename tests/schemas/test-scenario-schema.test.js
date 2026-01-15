import { describe, test, expect } from '@jest/globals';
import {
  testScenarioSchema,
  testStepSchema,
  validateTestScenario,
  safeValidateTestScenario,
} from '../../src/schemas/test-scenario-schema.js';

describe('Test Scenario Schema', () => {
  describe('testStepSchema', () => {
    test('should validate a valid test step', () => {
      const validStep = {
        stepNumber: 1,
        action: 'Navigate to login page',
        expectedResult: 'Login page is displayed',
      };

      const result = testStepSchema.safeParse(validStep);
      expect(result.success).toBe(true);
    });

    test('should reject step with short action', () => {
      const invalidStep = {
        action: 'Go',
        expectedResult: 'Page shown',
      };

      const result = testStepSchema.safeParse(invalidStep);
      expect(result.success).toBe(false);
    });

    test('should accept step with additional data', () => {
      const stepWithData = {
        action: 'Enter credentials',
        expectedResult: 'Credentials accepted',
        data: {
          email: 'user@example.com',
          password: '****',
        },
      };

      const result = testStepSchema.safeParse(stepWithData);
      expect(result.success).toBe(true);
      expect(result.data.data).toEqual({
        email: 'user@example.com',
        password: '****',
      });
    });
  });

  describe('testScenarioSchema', () => {
    const validScenario = {
      title: 'User Login Authentication',
      description: 'Verify that user can login with valid credentials',
      type: 'functional',
      priority: 'high',
      steps: [
        {
          stepNumber: 1,
          action: 'Navigate to login page',
          expectedResult: 'Login page is displayed',
        },
        {
          stepNumber: 2,
          action: 'Enter valid credentials',
          expectedResult: 'Credentials are accepted',
        },
      ],
    };

    test('should validate a complete valid scenario', () => {
      const result = testScenarioSchema.safeParse(validScenario);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('functional');
      expect(result.data.priority).toBe('high');
    });

    test('should apply default values', () => {
      const minimalScenario = {
        title: 'Test Scenario',
        description: 'Test description here',
        steps: [
          {
            action: 'Perform action',
            expectedResult: 'Expected result',
          },
        ],
      };

      const result = testScenarioSchema.safeParse(minimalScenario);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('functional');
      expect(result.data.priority).toBe('medium');
      expect(result.data.preconditions).toEqual([]);
      expect(result.data.tags).toEqual([]);
    });

    test('should reject scenario without steps', () => {
      const scenarioWithoutSteps = {
        title: 'Test Scenario',
        description: 'Test description',
        steps: [],
      };

      const result = testScenarioSchema.safeParse(scenarioWithoutSteps);
      expect(result.success).toBe(false);
    });

    test('should reject scenario with short title', () => {
      const scenarioShortTitle = {
        title: 'Te',
        description: 'Test description here',
        steps: [
          {
            action: 'Perform action',
            expectedResult: 'Expected result',
          },
        ],
      };

      const result = testScenarioSchema.safeParse(scenarioShortTitle);
      expect(result.success).toBe(false);
    });

    test('should validate scenario with all optional fields', () => {
      const fullScenario = {
        ...validScenario,
        scenarioId: 'TC-001',
        preconditions: ['User is registered', 'System is available'],
        expectedOutcome: 'User is authenticated',
        tags: ['authentication', 'security'],
      };

      const result = testScenarioSchema.safeParse(fullScenario);
      expect(result.success).toBe(true);
      expect(result.data.scenarioId).toBe('TC-001');
      expect(result.data.preconditions).toHaveLength(2);
      expect(result.data.tags).toHaveLength(2);
    });
  });

  describe('validateTestScenario', () => {
    test('should validate and return data', () => {
      const validData = {
        title: 'Test Scenario',
        description: 'Test description',
        steps: [
          {
            action: 'Perform action',
            expectedResult: 'Expected result',
          },
        ],
      };

      const result = validateTestScenario(validData);
      expect(result.title).toBe('Test Scenario');
      expect(result.steps).toHaveLength(1);
    });

    test('should throw on invalid data', () => {
      const invalidData = {
        title: 'Te',
        description: 'Short',
      };

      expect(() => validateTestScenario(invalidData)).toThrow();
    });
  });

  describe('safeValidateTestScenario', () => {
    test('should return success with valid data', () => {
      const validData = {
        title: 'Test Scenario',
        description: 'Test description',
        steps: [
          {
            action: 'Perform action',
            expectedResult: 'Expected result',
          },
        ],
      };

      const result = safeValidateTestScenario(validData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('should return errors with invalid data', () => {
      const invalidData = {
        title: 'Te',
        description: 'Short',
      };

      const result = safeValidateTestScenario(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
