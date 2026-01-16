# User Story Generator Agent

[![CI/CD Pipeline](https://github.com/AuronForge/user-story-generator-agent/actions/workflows/deploy.yml/badge.svg)](https://github.com/AuronForge/user-story-generator-agent/actions/workflows/deploy.yml)
[![codecov](https://codecov.io/gh/AuronForge/user-story-generator-agent/branch/main/graph/badge.svg)](https://codecov.io/gh/AuronForge/user-story-generator-agent)

🤖 Agent responsible for receiving test scenarios (functional or business) and converting them into one or more Agile user stories. Produces clear, value-driven stories with acceptance criteria, ready for backlog refinement and team execution.

## Overview

This agent specializes in transforming test scenarios into well-structured Agile user stories. It analyzes functional and business test cases and generates user stories following best practices, complete with acceptance criteria, business value, and technical considerations.

## Features

- ✅ **Smart AI-powered conversion** - Automatically transforms test scenarios into Agile user stories
- ✅ Generates clear, value-driven user stories with acceptance criteria
- ✅ Extracts business value and technical requirements from test cases
- ✅ Schema validation for inputs and outputs
- ✅ Multiple AI provider support (OpenAI, GitHub Models, Anthropic)
- ✅ **GitHub Models integration (Free!)** - Use GPT-4o via GitHub API
- ✅ Produces backlog-ready stories for team execution
- ✅ RESTful API with **Swagger documentation**
- ✅ Auto-save to database

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o

# GitHub Models Configuration (Free! Recommended)
GITHUB_TOKEN=your_github_personal_access_token
GITHUB_MODEL=gpt-4o

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_key
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Environment
NODE_ENV=development
```

### GitHub Models Setup (Recommended)

1. Generate a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `read:packages`
   - Copy the generated token

2. Add to `.env`:

   ```env
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_MODEL=gpt-4o
   ```

3. **Benefits**: Free access to GPT-4o with generous rate limits!

## Usage

### Run GitHub Integration Example

```bash
npm run example:github
```

This will demonstrate:

- Basic user story generation with GitHub Models
- Batch processing multiple scenarios
- Direct agent usage
- Provider comparison
- Error handling and retry logic

### Local Development

```bash
npm run dev
```

The server will start at `http://localhost:3000`

**Access the API Documentation:** `http://localhost:3000/docs`

### API Examples

#### Generate User Stories (using GitHub Models)

```bash
curl -X POST http://localhost:3000/api/generate-user-stories \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: github" \
  -d '{
    "title": "User Login Authentication",
    "description": "Verify that users can login with valid credentials",
    "type": "functional",
    "steps": [
      {
        "action": "Navigate to login page",
        "expectedResult": "Login page is displayed"
      },
      {
        "action": "Enter valid credentials",
        "expectedResult": "User is authenticated"
      }
    ]
  }'
```

#### List Generated User Stories

```bash
curl http://localhost:3000/api/user-stories
```

#### Get Specific User Story by ID

```bash
curl http://localhost:3000/api/user-stories?id=your-uuid-here
```

### Testing

```bash
npm test                  # Run all tests
npm run test:coverage     # Run tests with coverage
npm run test:watch        # Watch mode
```

## � CI/CD Pipeline

This project uses GitHub Actions for automated testing and deployment to Vercel.

### Pipeline Features

- ✅ Automated testing on every push and PR
- ✅ Code coverage validation (minimum 95% average)
- ✅ Automatic deployment to Vercel on main branch
- ✅ Lint and format validation
- ✅ Coverage reports uploaded to Codecov

### Setting up CI/CD

1. Configure GitHub Secrets:
   - `VERCEL_TOKEN` - Your Vercel deployment token
   - `VERCEL_ORG_ID` - Your Vercel organization ID
   - `VERCEL_PROJECT_ID` - Your Vercel project ID
   - `CODECOV_TOKEN` - (Optional) Codecov token for coverage reports

2. Run the setup helper script:

```bash
bash scripts/setup-github-secrets.sh
```

3. For detailed instructions, see: [.github/DEPLOY.md](./.github/DEPLOY.md)

**Note:** The pipeline will **block deployment** if test coverage average is below 95%.

## 📚 Documentation

- [CI/CD Setup Guide](./.github/DEPLOY.md) - GitHub Actions and Vercel deployment
- [GitHub Integration Guide](./docs/GITHUB_INTEGRATION.md) - Complete guide for using GitHub Models
- [API Documentation](./src/controllers/README.md) - REST API reference
- [Swagger/OpenAPI](http://localhost:3000/docs) - Interactive API documentation

## License

MIT
