/**
 * Example: Using GitHub Copilot (GitHub Models) to generate user stories
 *
 * This example demonstrates how to use the user-story-generator-agent
 * with GitHub Models API (part of GitHub Copilot).
 *
 * Prerequisites:
 * 1. GitHub Personal Access Token in .env as GITHUB_TOKEN
 * 2. npm install (dependencies installed)
 *
 * Run: node examples/github-integration-example.js
 */

import dotenv from 'dotenv';
import * as userStoryService from '../src/services/user-story.service.js';
import { StoryGeneratorAgent } from '../src/agents/story-generator-agent.js';

// Load environment variables
dotenv.config();

// Example test scenarios
const testScenarios = [
  {
    title: 'User Login Authentication',
    description: 'Verify that users can login with valid credentials and access their dashboard',
    type: 'functional',
    priority: 'high',
    preconditions: ['User has registered account', 'User is on login page'],
    steps: [
      {
        action: 'Navigate to login page',
        expectedResult: 'Login form is displayed with email and password fields',
      },
      {
        action: 'Enter valid email address',
        expectedResult: 'Email is accepted and validated',
      },
      {
        action: 'Enter correct password',
        expectedResult: 'Password field accepts input (masked)',
      },
      {
        action: 'Click "Login" button',
        expectedResult: 'User is authenticated and redirected to dashboard',
      },
    ],
    expectedOutcome: 'User successfully logs in and sees personalized dashboard',
    tags: ['authentication', 'security', 'login'],
  },
  {
    title: 'Shopping Cart - Add Items',
    description: 'Test adding products to shopping cart from product listing',
    type: 'e2e',
    priority: 'high',
    steps: [
      {
        action: 'Browse product catalog',
        expectedResult: 'Products are displayed with prices and images',
      },
      {
        action: 'Click "Add to Cart" on a product',
        expectedResult: 'Product is added to cart, cart counter updates',
      },
      {
        action: 'View shopping cart',
        expectedResult: 'Cart shows added items with correct details',
      },
    ],
    tags: ['e-commerce', 'cart', 'shopping'],
  },
];

/**
 * Example 1: Generate user stories for a single scenario
 */
async function example1_BasicGeneration() {
  console.log('\n🚀 Example 1: Basic User Story Generation with GitHub Models\n');

  const testScenario = testScenarios[0];

  console.log('📋 Test Scenario:', testScenario.title);
  console.log('🤖 Using Provider: GitHub Models (gpt-4o)\n');

  try {
    const result = await userStoryService.generateUserStories(testScenario, 'github');

    if (result.success) {
      console.log('✅ Success! Generated', result.data.length, 'user stories\n');
      console.log('📝 Saved to database with ID:', result.id);
      console.log('⏰ Generated at:', result.metadata.generatedAt);

      console.log('\n📖 User Stories:\n');
      result.data.forEach((story, index) => {
        console.log(`${index + 1}. ${story.id}: ${story.title}`);
        console.log(
          `   Priority: ${story.priority} | Points: ${story.estimatedPoints} | Team: ${story.team}`
        );
        console.log(`   Story: ${story.story}`);
        console.log(`   Business Value: ${story.businessValue}`);
        console.log(`   Acceptance Criteria: ${story.acceptanceCriteria.length} criteria`);
        console.log('');
      });
    } else {
      console.error('❌ Generation failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

/**
 * Example 2: Batch processing multiple scenarios
 */
async function example2_BatchProcessing() {
  console.log('\n🚀 Example 2: Batch Processing Multiple Scenarios\n');

  console.log(`Processing ${testScenarios.length} test scenarios...\n`);

  try {
    const results = await Promise.all(
      testScenarios.map(scenario => userStoryService.generateUserStories(scenario, 'github'))
    );

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);

    console.log('\n📊 Summary:\n');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(
          `${index + 1}. ${testScenarios[index].title}: ${result.data.length} stories generated (ID: ${result.id})`
        );
      } else {
        console.log(`${index + 1}. ${testScenarios[index].title}: Failed - ${result.error}`);
      }
    });
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

/**
 * Example 3: Using the Agent directly
 */
async function example3_DirectAgentUsage() {
  console.log('\n🚀 Example 3: Direct Agent Usage\n');

  const agent = new StoryGeneratorAgent('github');

  console.log('Agent:', agent.agentName);
  console.log('Version:', agent.version);
  console.log('Provider: GitHub Models\n');

  try {
    const result = await agent.generateUserStories(testScenarios[1]);

    if (result.success) {
      console.log('✅ Generated', result.data.length, 'user stories');

      // Analyze the stories
      const analysis = await agent.analyzeUserStories(result.data);

      console.log('\n📊 Analysis:');
      console.log('- Total Stories:', analysis.total);
      console.log('- High Priority:', analysis.byPriority.high);
      console.log('- Medium Priority:', analysis.byPriority.medium);
      console.log('- Low Priority:', analysis.byPriority.low);
      console.log('- Total Story Points:', analysis.totalPoints);
      console.log('- Stories with Dependencies:', analysis.dependencies);
    } else {
      console.error('❌ Generation failed:', result.error);
    }
  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

/**
 * Example 4: Provider comparison
 */
async function example4_ProviderComparison() {
  console.log('\n🚀 Example 4: Provider Comparison\n');

  const testScenario = {
    title: 'Quick Test',
    description: 'Simple test for comparison',
    type: 'functional',
  };

  const providers = ['github'];

  // Check which providers are configured
  if (process.env.OPENAI_API_KEY) {
    providers.push('openai');
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push('anthropic');
  }

  console.log(`Testing with ${providers.length} provider(s): ${providers.join(', ')}\n`);

  const comparisons = [];

  for (const provider of providers) {
    console.log(`Testing ${provider}...`);
    const startTime = Date.now();

    try {
      const result = await userStoryService.generateUserStories(testScenario, provider);
      const duration = Date.now() - startTime;

      comparisons.push({
        provider,
        success: result.success,
        stories: result.data?.length || 0,
        duration: `${duration}ms`,
        model: process.env[`${provider.toUpperCase()}_MODEL`] || 'default',
      });

      console.log(`  ✅ Success (${duration}ms)`);
    } catch (error) {
      comparisons.push({
        provider,
        success: false,
        error: error.message,
        duration: 'N/A',
      });

      console.log(`  ❌ Failed: ${error.message}`);
    }
  }

  console.log('\n📊 Comparison Results:\n');
  console.table(comparisons);
}

/**
 * Example 5: Error handling and retry
 */
async function example5_ErrorHandling() {
  console.log('\n🚀 Example 5: Error Handling and Retry Logic\n');

  const testScenario = {
    title: 'Test Scenario',
    description: 'Testing error handling',
    type: 'functional',
  };

  async function generateWithRetry(scenario, provider, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Attempt ${attempt}/${maxRetries}...`);

      try {
        const result = await userStoryService.generateUserStories(scenario, provider);

        if (result.success) {
          console.log(`✅ Success on attempt ${attempt}`);
          return result;
        } else {
          console.log(`⚠️ Generation failed: ${result.error}`);

          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      } catch (error) {
        console.error(`❌ Error on attempt ${attempt}:`, error.message);

        if (attempt === maxRetries) {
          throw error;
        }

        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Max retries exceeded');
  }

  try {
    const result = await generateWithRetry(testScenario, 'github');
    console.log('\n✅ Final result:', result.success);
  } catch (error) {
    console.error('\n💥 All retries failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║  User Story Generator - GitHub Copilot Integration Examples     ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  // Check if GitHub token is configured
  if (!process.env.GITHUB_TOKEN) {
    console.error('\n❌ GITHUB_TOKEN not found in environment variables!');
    console.log('\nPlease:');
    console.log('1. Copy .env.example to .env');
    console.log('2. Add your GitHub Personal Access Token to GITHUB_TOKEN');
    console.log('3. Get token at: https://github.com/settings/tokens\n');
    process.exit(1);
  }

  console.log('\n✅ GitHub Token configured');
  console.log(`📦 Model: ${process.env.GITHUB_MODEL || 'gpt-4o (default)'}`);

  try {
    // Run all examples
    await example1_BasicGeneration();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay between examples

    await example2_BatchProcessing();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example3_DirectAgentUsage();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example4_ProviderComparison();
    await new Promise(resolve => setTimeout(resolve, 1000));

    await example5_ErrorHandling();

    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  All examples completed successfully! 🎉                         ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Export for use in other modules
export {
  example1_BasicGeneration,
  example2_BatchProcessing,
  example3_DirectAgentUsage,
  example4_ProviderComparison,
  example5_ErrorHandling,
};
