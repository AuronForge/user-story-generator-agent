import { describe, test, expect } from '@jest/globals';
import {
  isTestSuite,
  normalizeToScenarios,
  validateTestScenario,
  safeValidateInput,
} from '../../src/schemas/test-scenario-schema.js';

describe('Schema Utilities', () => {
  describe('isTestSuite', () => {
    test('should return true for test suite', () => {
      const testSuite = {
        featureName: 'Shopping Cart',
        scenarios: [
          {
            title: 'Add to cart',
            description: 'User adds product',
            given: 'User on product page',
            when: 'User clicks add',
            then: 'Product added',
          },
        ],
      };

      expect(isTestSuite(testSuite)).toBe(true);
    });

    test('should return false for single scenario', () => {
      const scenario = {
        title: 'Add to cart',
        description: 'User adds product',
        given: 'User on product page',
        when: 'User clicks add',
        then: 'Product added',
      };

      expect(isTestSuite(scenario)).toBe(false);
    });

    test('should return false for null', () => {
      expect(isTestSuite(null)).toBeFalsy();
    });

    test('should return false for undefined', () => {
      expect(isTestSuite(undefined)).toBeFalsy();
    });

    test('should return false for non-object', () => {
      expect(isTestSuite('string')).toBeFalsy();
      expect(isTestSuite(123)).toBeFalsy();
    });

    test('should return false for object without scenarios', () => {
      expect(isTestSuite({ featureName: 'Test' })).toBe(false);
    });

    test('should return false for object with non-array scenarios', () => {
      expect(isTestSuite({ scenarios: 'not-array' })).toBe(false);
    });
  });

  describe('normalizeToScenarios', () => {
    test('should normalize test suite', () => {
      const testSuite = {
        featureId: 'F-001',
        featureName: 'Shopping Cart',
        scenarios: [
          {
            title: 'Add to cart',
            description: 'User adds product',
            given: 'User on product page',
            when: 'User clicks add',
            then: 'Product added',
          },
        ],
        coverage: {
          acceptanceCriteria: 90,
          edgeCases: 80,
          negativeScenarios: 70,
        },
        recommendations: ['Add error handling'],
      };

      const result = normalizeToScenarios(testSuite);

      expect(result.scenarios).toHaveLength(1);
      expect(result.scenarios[0].title).toBe('Add to cart');
      expect(result.metadata).toBeDefined();
      expect(result.metadata.featureId).toBe('F-001');
      expect(result.metadata.featureName).toBe('Shopping Cart');
      expect(result.metadata.coverage).toBeDefined();
      expect(result.metadata.recommendations).toHaveLength(1);
    });

    test('should normalize single scenario', () => {
      const scenario = {
        title: 'Add to cart',
        description: 'User adds product',
        given: 'User on product page',
        when: 'User clicks add',
        then: 'Product added',
      };

      const result = normalizeToScenarios(scenario);

      expect(result.scenarios).toHaveLength(1);
      expect(result.scenarios[0]).toEqual(scenario);
      expect(result.metadata).toBeNull();
    });

    test('should normalize test suite without optional fields', () => {
      const testSuite = {
        scenarios: [
          {
            title: 'Test',
            description: 'Test scenario',
            given: 'Given',
            when: 'When',
            then: 'Then',
          },
        ],
      };

      const result = normalizeToScenarios(testSuite);

      expect(result.scenarios).toHaveLength(1);
      expect(result.metadata).toBeDefined();
      expect(result.metadata.featureId).toBeUndefined();
      expect(result.metadata.featureName).toBeUndefined();
    });
  });

  describe('validateTestScenario', () => {
    test('should validate traditional scenario successfully', () => {
      const scenario = {
        title: 'Login Test',
        description: 'Test user login functionality',
        steps: [
          {
            action: 'Navigate to login',
            expectedResult: 'Login page shown',
          },
        ],
      };

      const result = validateTestScenario(scenario);
      expect(result.title).toBe('Login Test');
    });

    test('should throw error for invalid scenario', () => {
      const invalid = {
        title: 'T',
        description: 'Short',
      };

      expect(() => validateTestScenario(invalid)).toThrow();
    });
  });

  describe('safeValidateInput', () => {
    test('should return success for valid data', () => {
      const valid = {
        title: 'Test Scenario',
        description: 'Test description',
        given: 'User on page',
        when: 'User clicks',
        then: 'Action happens',
      };

      const result = safeValidateInput(valid);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('should return errors for invalid data', () => {
      const invalid = {
        title: 'T',
        description: 'S',
      };

      const result = safeValidateInput(invalid);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
