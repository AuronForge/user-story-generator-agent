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
        TestScenario: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: {
              type: 'string',
              description: 'Test scenario title',
              example: 'Login with valid credentials',
            },
            description: {
              type: 'string',
              description: 'Detailed test scenario description',
              example: 'Verify that user can login with valid email and password',
            },
            type: {
              type: 'string',
              enum: ['functional', 'non-functional', 'integration', 'e2e', 'unit'],
              description: 'Test type',
              example: 'functional',
            },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: {
                    type: 'string',
                    example: 'Navigate to login page',
                  },
                  expectedResult: {
                    type: 'string',
                    example: 'Login page is displayed',
                  },
                },
              },
              description: 'Test steps',
            },
          },
        },
        UserStory: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique story identifier',
              example: 'US-001',
            },
            title: {
              type: 'string',
              description: 'User story title',
              example: 'User Login Authentication',
            },
            story: {
              type: 'string',
              description: 'User story in standard format',
              example:
                'As a registered user, I want to login with my credentials so that I can access my account',
            },
            acceptanceCriteria: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of acceptance criteria',
              example: [
                'Given I am on the login page',
                'When I enter valid credentials',
                'Then I should be redirected to dashboard',
              ],
            },
            businessValue: {
              type: 'string',
              description: 'Business value description',
              example: 'Enables secure user authentication and access control',
            },
            priority: {
              type: 'string',
              enum: ['high', 'medium', 'low'],
              description: 'Story priority',
              example: 'high',
            },
            estimatedPoints: {
              type: 'integer',
              description: 'Story points estimation',
              example: 3,
            },
            technicalNotes: {
              type: 'string',
              description: 'Technical implementation notes',
              example: 'Use JWT for session management, bcrypt for password hashing',
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
