import { describe, test, expect } from '@jest/globals';
import {
  userStorySchema,
  acceptanceCriterionSchema,
  validateUserStory,
  safeValidateUserStory,
  createGherkinCriterion,
} from '../../src/schemas/user-story-schema.js';

describe('User Story Schema', () => {
  describe('acceptanceCriterionSchema', () => {
    test('should validate a valid acceptance criterion', () => {
      const validCriterion = {
        id: 'AC-001',
        criterion: 'Given I am on the login page',
        type: 'given',
      };

      const result = acceptanceCriterionSchema.safeParse(validCriterion);
      expect(result.success).toBe(true);
    });

    test('should apply default type', () => {
      const criterion = {
        criterion: 'User should see success message',
      };

      const result = acceptanceCriterionSchema.safeParse(criterion);
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('general');
    });

    test('should reject short criterion', () => {
      const invalidCriterion = {
        criterion: 'Test',
      };

      const result = acceptanceCriterionSchema.safeParse(invalidCriterion);
      expect(result.success).toBe(false);
    });
  });

  describe('userStorySchema', () => {
    const validUserStory = {
      id: 'US-001',
      title: 'Implement Login Form',
      description: 'Create a login form with email and password fields',
      story: 'As a user, I want to login with my credentials, so that I can access my account',
      priority: 'high',
      dependsOn: [],
      acceptanceCriteria: [
        {
          criterion: 'Given I am on the login page',
          type: 'given',
        },
        {
          criterion: 'When I enter valid credentials',
          type: 'when',
        },
        {
          criterion: 'Then I should be redirected to dashboard',
          type: 'then',
        },
      ],
      team: 'Frontend',
      storyPoints: '5',
      complexity: 'medium',
    };

    test('should validate a complete valid user story', () => {
      const result = userStorySchema.safeParse(validUserStory);
      expect(result.success).toBe(true);
      expect(result.data.team).toBe('Frontend');
      expect(result.data.storyPoints).toBe('5');
    });

    test('should validate user story with dependencies', () => {
      const storyWithDeps = {
        ...validUserStory,
        dependsOn: ['US-002', 'US-003'],
      };

      const result = userStorySchema.safeParse(storyWithDeps);
      expect(result.success).toBe(true);
      expect(result.data.dependsOn).toHaveLength(2);
    });

    test('should validate user story with related step', () => {
      const storyWithStep = {
        ...validUserStory,
        relatedStep: {
          stepNumber: 1,
          action: 'Navigate to login page',
        },
      };

      const result = userStorySchema.safeParse(storyWithStep);
      expect(result.success).toBe(true);
      expect(result.data.relatedStep.stepNumber).toBe(1);
    });

    test('should accept all valid teams', () => {
      const teams = ['Frontend', 'Backend', 'User Experience', 'Quality Assurance'];

      teams.forEach(team => {
        const story = { ...validUserStory, team };
        const result = userStorySchema.safeParse(story);
        expect(result.success).toBe(true);
      });
    });

    test('should accept all Fibonacci points', () => {
      const points = ['1', '2', '3', '5', '8', '13', '21', '34'];

      points.forEach(storyPoints => {
        const story = { ...validUserStory, storyPoints };
        const result = userStorySchema.safeParse(story);
        expect(result.success).toBe(true);
      });
    });

    test('should reject invalid story points', () => {
      const story = { ...validUserStory, storyPoints: '4' };
      const result = userStorySchema.safeParse(story);
      expect(result.success).toBe(false);
    });

    test('should reject invalid team', () => {
      const story = { ...validUserStory, team: 'DevOps' };
      const result = userStorySchema.safeParse(story);
      expect(result.success).toBe(false);
    });

    test('should require at least one acceptance criterion', () => {
      const story = { ...validUserStory, acceptanceCriteria: [] };
      const result = userStorySchema.safeParse(story);
      expect(result.success).toBe(false);
    });

    test('should reject short title', () => {
      const story = { ...validUserStory, title: 'Test' };
      const result = userStorySchema.safeParse(story);
      expect(result.success).toBe(false);
    });

    test('should validate story with optional fields', () => {
      const fullStory = {
        ...validUserStory,
        businessValue: 'Enables user authentication',
        technicalNotes: 'Use JWT for tokens',
      };

      const result = userStorySchema.safeParse(fullStory);
      expect(result.success).toBe(true);
      expect(result.data.businessValue).toBeDefined();
      expect(result.data.technicalNotes).toBeDefined();
    });
  });

  describe('validateUserStory', () => {
    test('should validate and return data', () => {
      const validData = {
        id: 'US-001',
        title: 'Implement Login',
        description: 'Create login functionality',
        priority: 'high',
        acceptanceCriteria: [
          {
            criterion: 'User can login successfully',
          },
        ],
        team: 'Backend',
        storyPoints: '3',
      };

      const result = validateUserStory(validData);
      expect(result.id).toBe('US-001');
      expect(result.team).toBe('Backend');
    });

    test('should throw on invalid data', () => {
      const invalidData = {
        id: 'US-001',
        title: 'Test',
        description: 'Short',
      };

      expect(() => validateUserStory(invalidData)).toThrow();
    });
  });

  describe('safeValidateUserStory', () => {
    test('should return success with valid data', () => {
      const validData = {
        id: 'US-001',
        title: 'Implement Login',
        description: 'Create login functionality',
        priority: 'high',
        acceptanceCriteria: [
          {
            criterion: 'User can login successfully',
          },
        ],
        team: 'Backend',
        storyPoints: '3',
      };

      const result = safeValidateUserStory(validData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('should return errors with invalid data', () => {
      const invalidData = {
        id: 'US-001',
        title: 'Test',
      };

      const result = safeValidateUserStory(invalidData);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('createGherkinCriterion', () => {
    test('should create Gherkin format criteria', () => {
      const criteria = createGherkinCriterion(
        'I am on the login page',
        'I enter valid credentials',
        'I should be redirected to dashboard'
      );

      expect(criteria).toHaveLength(3);
      expect(criteria[0].criterion).toBe('Given I am on the login page');
      expect(criteria[0].type).toBe('given');
      expect(criteria[1].criterion).toBe('When I enter valid credentials');
      expect(criteria[1].type).toBe('when');
      expect(criteria[2].criterion).toBe('Then I should be redirected to dashboard');
      expect(criteria[2].type).toBe('then');
    });
  });
});
