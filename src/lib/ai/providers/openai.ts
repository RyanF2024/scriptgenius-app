import { AIRequestOptions, AIResponse, AIError } from '../types';

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    if (!this.apiKey) {
      throw new AIError(
        'OpenAI API key not configured',
        'MISSING_API_KEY',
        400
      );
    }
  }

  public async generateText(options: AIRequestOptions): Promise<AIResponse> {
    const { messages, modelConfig, stream = false, timeout = 30000 } = options;
    const { model, temperature = 0.7, maxTokens = 2000 } = modelConfig;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          errorData.error?.message || 'Failed to generate text',
          errorData.error?.code || 'OPENAI_API_ERROR',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      const completion = data.choices[0]?.message?.content || '';

      return {
        content: completion,
        model: data.model,
        usage: data.usage && {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        metadata: {
          id: data.id,
          created: data.created,
          finishReason: data.choices[0]?.finish_reason,
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

  // Add support for streaming responses
  public async *generateStream(options: AIRequestOptions) {
    const { messages, modelConfig } = options;
    const { model, temperature = 0.7, maxTokens = 2000 } = modelConfig;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          errorData.error?.message || 'Failed to generate stream',
          errorData.error?.code || 'OPENAI_API_ERROR',
          response.status,
          errorData
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new AIError(
          'Failed to read response stream',
          'STREAM_ERROR',
          500
        );
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === 'data: [DONE]') {
            return;
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const chunk = data.choices[0]?.delta?.content || '';
              if (chunk) {
                yield chunk;
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in generateStream:', error);
      throw error;
    }
  }
}
