import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Story Generator API',
      version: '1.0.0',
      description:
        'API for converting test scenarios into Agile user stories. Supports multiple AI providers (OpenAI, GitHub Models, Anthropic) to create clear, value-driven user stories with acceptance criteria.',
      contact: {
        name: 'API Support',
        url: 'https://github.com/AuronForge/user-story-generator-agent',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://user-story-generator-agent.vercel.app',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'User Stories',
        description: 'Endpoints for managing user stories',
      },
    ],
    components: {
      schemas: {
        TestStep: {
          type: 'object',
          required: ['action', 'expectedResult'],
          properties: {
            stepNumber: {
              type: 'integer',
              description: 'Step sequence number',
              example: 1,
            },
            action: {
              type: 'string',
              description: 'Action to be performed',
              example: 'Navigate to login page',
            },
            expectedResult: {
              type: 'string',
              description: 'Expected result after action',
              example: 'Login page is displayed',
            },
            data: {
              type: 'object',
              description: 'Additional data for the step',
              additionalProperties: true,
            },
          },
        },
        TestScenario: {
          type: 'object',
          required: ['title', 'description', 'steps'],
          properties: {
            scenarioId: {
              type: 'string',
              description: 'Scenario identifier',
              example: 'TC-001',
            },
            title: {
              type: 'string',
              description: 'Test scenario title',
              example: 'User Login Authentication',
            },
            description: {
              type: 'string',
              description: 'Detailed test scenario description',
              example: 'Verify that user can login with valid credentials',
            },
            type: {
              type: 'string',
              enum: ['functional', 'non-functional', 'integration', 'e2e', 'unit'],
              description: 'Test type',
              example: 'functional',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Test priority',
              example: 'high',
            },
            preconditions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Required preconditions',
              example: ['User is registered', 'System is available'],
            },
            steps: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TestStep',
              },
              description: 'Test steps',
              minItems: 1,
            },
            expectedOutcome: {
              type: 'string',
              description: 'Overall expected outcome',
              example: 'User is authenticated and redirected to dashboard',
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tags for categorization',
              example: ['authentication', 'security'],
            },
          },
        },
        AcceptanceCriterion: {
          type: 'object',
          required: ['criterion'],
          properties: {
            id: {
              type: 'string',
              description: 'Criterion identifier',
              example: 'AC-001',
            },
            criterion: {
              type: 'string',
              description: 'Acceptance criterion description',
              example: 'Given I am on the login page',
            },
            type: {
              type: 'string',
              enum: ['given', 'when', 'then', 'and', 'general'],
              description: 'Criterion type (Gherkin format)',
              example: 'given',
            },
          },
        },
        UserStory: {
          type: 'object',
          required: [
            'id',
            'title',
            'description',
            'priority',
            'acceptanceCriteria',
            'team',
            'storyPoints',
          ],
          properties: {
            id: {
              type: 'string',
              description: 'Unique story identifier',
              example: 'US-001',
            },
            title: {
              type: 'string',
              description: 'User story title',
              example: 'Implement User Login Form',
            },
            description: {
              type: 'string',
              description: 'Detailed description',
              example: 'Create a login form with email and password fields',
            },
            story: {
              type: 'string',
              description: 'User story in standard format',
              example:
                'As a registered user, I want to login with my credentials, so that I can access my account',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Story priority',
              example: 'high',
            },
            dependsOn: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'IDs of dependent user stories',
              example: ['US-002', 'US-003'],
            },
            acceptanceCriteria: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AcceptanceCriterion',
              },
              description: 'Definition of Done (DoD)',
              minItems: 1,
            },
            team: {
              type: 'string',
              enum: ['Frontend', 'Backend', 'User Experience', 'Quality Assurance'],
              description: 'Responsible team',
              example: 'Frontend',
            },
            storyPoints: {
              type: 'string',
              enum: ['1', '2', '3', '5', '8', '13', '21', '34'],
              description: 'Fibonacci story points (complexity + technical difficulty)',
              example: '5',
            },
            complexity: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'very-high'],
              description: 'Technical complexity level',
              example: 'medium',
            },
            technicalNotes: {
              type: 'string',
              description: 'Technical implementation details',
              example: 'Use React Hook Form for validation, implement JWT authentication',
            },
            businessValue: {
              type: 'string',
              description: 'Business value and impact',
              example: 'Enables secure user authentication and session management',
            },
            relatedStep: {
              type: 'object',
              properties: {
                stepNumber: {
                  type: 'integer',
                  example: 1,
                },
                action: {
                  type: 'string',
                  example: 'Navigate to login page',
                },
              },
              description: 'Related test scenario step',
            },
          },
        },
        GenerateResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indicates if generation was successful',
              example: true,
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserStory',
              },
            },
            metadata: {
              type: 'object',
              properties: {
                agent: {
                  type: 'string',
                  example: 'User Story Generator Agent',
                },
                version: {
                  type: 'string',
                  example: '1.0.0',
                },
                generatedAt: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-01-15T10:30:00Z',
                },
                totalStories: {
                  type: 'integer',
                  description: 'Total user stories generated',
                  example: 3,
                },
                testScenarioTitle: {
                  type: 'string',
                  description: 'Source test scenario title',
                  example: 'User Login Authentication',
                },
              },
            },
            id: {
              type: 'string',
              description: 'Database entry ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
          },
        },
        UserStoryEntry: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique entry ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
              example: '2026-01-15T10:30:00Z',
            },
            testScenario: {
              $ref: '#/components/schemas/TestScenario',
            },
            userStories: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserStory',
              },
            },
            provider: {
              type: 'string',
              enum: ['openai', 'github', 'anthropic'],
              description: 'AI provider used',
              example: 'github',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Validation error: Test scenario title is required',
            },
            stack: {
              type: 'string',
              description: 'Stack trace (development only)',
            },
          },
        },
      },
      parameters: {
        AIProvider: {
          name: 'x-ai-provider',
          in: 'header',
          description: 'AI provider to use',
          required: false,
          schema: {
            type: 'string',
            enum: ['openai', 'github', 'anthropic'],
            default: 'openai',
          },
        },
        UserStoryId: {
          name: 'id',
          in: 'query',
          description: 'User story ID to retrieve',
          required: false,
          schema: {
            type: 'string',
          },
        },
      },
    },
  },
  apis: ['./api/*.js', './src/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
