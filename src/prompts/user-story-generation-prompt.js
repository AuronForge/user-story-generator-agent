export function generateUserStoryPrompt(testScenario) {
  return `
You are an expert Product Owner and Agile coach. Generate comprehensive user stories from the following test scenario.

**Test Scenario Details:**
- Title: ${testScenario.title}
- Type: ${testScenario.type}
- Description: ${testScenario.description}
- Priority: ${testScenario.priority || 'medium'}

${
  testScenario.preconditions && testScenario.preconditions.length > 0
    ? `
**Preconditions:**
${testScenario.preconditions.map((p, i) => `${i + 1}. ${p}`).join('\n')}
`
    : ''
}

${
  testScenario.steps && testScenario.steps.length > 0
    ? `
**Test Steps:**
${testScenario.steps.map((step, i) => `${i + 1}. ${step.action} → Expected: ${step.expectedResult}`).join('\n')}
`
    : ''
}

${
  testScenario.expectedOutcome
    ? `
**Expected Outcome:**
${testScenario.expectedOutcome}
`
    : ''
}

${
  testScenario.tags && testScenario.tags.length > 0
    ? `
**Tags:**
${testScenario.tags.join(', ')}
`
    : ''
}

**Your Task:**
1. Analyze the test scenario and identify the user needs and business value
2. Create user stories that cover the functionality being tested
3. Each story should follow the format: "As a [role], I want [feature], so that [benefit]"
4. Define clear acceptance criteria in Given-When-Then format
5. Estimate story points using Fibonacci sequence (1, 2, 3, 5, 8, 13, 21, 34)
6. Assign appropriate team (Frontend, Backend, User Experience, Quality Assurance)
7. Set priority based on business value and dependencies
8. Identify any dependencies between stories
9. Provide technical notes when relevant

**Important Guidelines:**
- Break down complex scenarios into multiple smaller, independent stories when possible
- Each story should deliver value independently
- Prioritize stories based on business value and technical dependencies
- Use clear, non-technical language for the story narrative
- Be specific and measurable in acceptance criteria
- Consider edge cases and error scenarios

**Output Format (JSON):**
{
  "userStories": [
    {
      "id": "US-001",
      "title": "Brief descriptive title",
      "description": "Detailed description of what needs to be done",
      "story": "As a [role], I want [feature], so that [benefit]",
      "priority": "high",
      "dependsOn": [],
      "acceptanceCriteria": [
        {
          "criterion": "Given I am on the login page, when I enter valid credentials, then I am logged in successfully"
        },
        {
          "criterion": "Given I am logged in, when I click logout, then I am redirected to the home page"
        }
      ],
      "businessValue": "Clear explanation of business value",
      "estimatedPoints": "3",
      "team": "Backend",
      "technicalNotes": "Technical implementation notes if needed",
      "tags": ["authentication", "security"]
    }
  ]
}

**IMPORTANT**: All user stories MUST include:
- id, title, description, priority, acceptanceCriteria (at least 1), team, and estimatedPoints
- The "story" field should follow the format "As a [role], I want [feature], so that [benefit]"
- Use Fibonacci sequence for estimatedPoints: "1", "2", "3", "5", "8", "13", "21", or "34"
- Team must be exactly one of: "Frontend", "Backend", "User Experience", "Quality Assurance"
- Priority must be exactly one of: "high", "medium", "low"
- Each acceptanceCriteria object needs only a "criterion" field with the acceptance text
- DO NOT include "type" field in acceptanceCriteria - it's optional

Generate the user stories now, ensuring they are well-structured and provide clear value to the development team.
`;
}
