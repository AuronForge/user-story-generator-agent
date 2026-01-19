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
- ✅ **API Versioning** - All endpoints under /api/v1
- ✅ **Health Check** - Monitor API status
- ✅ **Postman Collection** - Ready-to-use API testing

## 📚 API Documentation

Access the interactive Swagger documentation:

- **Local**: http://localhost:3001/api/v1/api-docs
- **Production**: https://user-story-generator-agent.vercel.app/api/v1/api-docs

**Legacy endpoints** (redirected to v1):

- http://localhost:3001/docs → /api/v1/api-docs
- http://localhost:3001/ → /api/v1/api-docs

The Swagger UI provides:

- Complete API reference with OpenAPI 3.0
- Interactive request/response testing
- Request/response examples
- Schema definitions with Zod validation
- Try-it-out functionality
- Multiple AI provider support

### API Versioning

All endpoints are versioned under `/api/v1` for stability and backward compatibility. Legacy non-versioned endpoints are automatically redirected to v1.

### Postman Collection

Import the complete API collection: [postman-collection.json](postman-collection.json)

The collection includes:

- All API endpoints with examples
- Environment variables for local/production
- Pre-configured headers and authentication
- Test scenarios for error cases
- 6 organized folders with 16+ requests

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
npm start
```

The server will start at `http://localhost:3001` using Vercel Dev

**Access the API Documentation:** `http://localhost:3001/api/v1/api-docs`

### API Endpoints

#### Health Check

```bash
curl http://localhost:3001/api/v1/health
```

Returns API status, version, and available endpoints:

```json
{
  "status": "ok",
  "service": "user-story-generator-agent",
  "version": "1.0.0",
  "apiVersion": "v1",
  "timestamp": "2026-01-19T10:30:00.000Z",
  "endpoints": {
    "generateUserStories": "/api/v1/generate-user-stories",
    "userStories": "/api/v1/user-stories",
    "swagger": "/api/v1/swagger",
    "docs": "/api/v1/api-docs"
  }
}
```

### API Examples

#### Generate User Stories (using GitHub Models - Free!)

```bash
curl -X POST http://localhost:3001/api/v1/generate-user-stories \
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

#### Using OpenAI

```bash
curl -X POST http://localhost:3001/api/v1/generate-user-stories \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: openai" \
  -d '{...}'
```

#### Using Anthropic Claude

```bash
curl -X POST http://localhost:3001/api/v1/generate-user-stories \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: anthropic" \
  -d '{...}'
```

#### List Generated User Stories

```bash
curl http://localhost:3001/api/v1/user-stories
```

#### Get Specific User Story by ID

```bash
curl "http://localhost:3001/api/v1/user-stories?id=your-uuid-here"
```

#### View API Documentation

```bash
# Open in browser
open http://localhost:3001/api/v1/api-docs
```

**Legacy Endpoints**: All non-versioned endpoints (e.g., `/api/generate-user-stories`) are automatically redirected to `/api/v1/*`

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

- [API Documentation (Swagger UI)](http://localhost:3001/api/v1/api-docs) - Interactive API documentation
- [OpenAPI Specification](http://localhost:3001/api/v1/swagger) - OpenAPI 3.0 JSON spec
- [Postman Collection](./postman-collection.json) - Import into Postman for testing
- [CI/CD Setup Guide](./.github/DEPLOY.md) - GitHub Actions and Vercel deployment
- [GitHub Integration Guide](./docs/GITHUB_INTEGRATION.md) - Complete guide for using GitHub Models
- [API Reference](./src/controllers/README.md) - REST API technical reference

### Quick Links

- **Production API**: https://user-story-generator-agent.vercel.app/api/v1/api-docs
- **Health Check**: GET /api/v1/health
- **Generate User Stories**: POST /api/v1/generate-user-stories
- **List User Stories**: GET /api/v1/user-stories

## License

MIT
