import { AIRequestOptions, AIResponse, AIError } from '../types';

export class AnthropicProvider {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
    if (!this.apiKey) {
      throw new AIError(
        'Anthropic API key not configured',
        'MISSING_API_KEY',
        400
      );
    }
  }

  public async generateText(options: AIRequestOptions): Promise<AIResponse> {
    const { messages, modelConfig, timeout = 30000 } = options;
    const { model = 'claude-2', temperature = 0.7, maxTokens = 2000 } = modelConfig;

    try {
      // Convert messages to Anthropic's format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          prompt,
          model,
          max_tokens_to_sample: maxTokens,
          temperature,
          stop_sequences: ['\n\nHuman:'],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          errorData.error?.message || 'Failed to generate text',
          errorData.error?.type || 'ANTHROPIC_API_ERROR',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      
      return {
        content: data.completion,
        model: data.model,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
        },
        metadata: {
          stop_reason: data.stop_reason,
        },
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new AIError(
          'Request timed out',
          'REQUEST_TIMEOUT',
          408
        );
      }
      throw error;
    }
  }

  private convertMessagesToPrompt(messages: Array<{role: string, content: string}>): string {
    return messages.map(msg => {
      if (msg.role === 'user') return `Human: ${msg.content}`;
      if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
      return msg.content;
    }).join('\n\n') + '\n\nAssistant:';
  }
}
