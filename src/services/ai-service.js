import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export class AIService {
  constructor(provider = 'openai') {
    this.provider = provider;

    if (provider === 'openai') {
      this.client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    } else if (provider === 'github') {
      this.client = new OpenAI({
        apiKey: process.env.GITHUB_TOKEN,
        baseURL: 'https://models.inference.ai.azure.com',
      });
      this.model = process.env.GITHUB_MODEL || 'gpt-4o';
    } else if (provider === 'anthropic') {
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    }
  }

  async generateCompletion(prompt, options = {}) {
    try {
      if (this.provider === 'openai' || this.provider === 'github') {
        return await this.generateOpenAICompletion(prompt, options);
      } else if (this.provider === 'anthropic') {
        return await this.generateAnthropicCompletion(prompt, options);
      }
    } catch (error) {
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

  async generateOpenAICompletion(prompt, options) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert Product Owner and Agile coach specialized in creating high-quality user stories from test scenarios.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.7,
      response_format: { type: 'json_object' },
    });

    return response.choices[0].message.content;
  }

  async generateAnthropicCompletion(prompt, options) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens || 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system:
        'You are an expert Product Owner and Agile coach specialized in creating high-quality user stories from test scenarios. Always respond with valid JSON.',
    });

    return response.content[0].text;
  }
}
