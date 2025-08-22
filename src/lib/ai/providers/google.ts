import { AIRequestOptions, AIResponse, AIError } from '../types';

export class GoogleAIProvider {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_KEY || '';
    if (!this.apiKey) {
      throw new AIError(
        'Google AI API key not configured',
        'MISSING_API_KEY',
        400
      );
    }
  }

  public async generateText(options: AIRequestOptions): Promise<AIResponse> {
    const { messages, modelConfig, timeout = 30000 } = options;
    const { model = 'gemini-pro', temperature = 0.7, maxTokens = 2000 } = modelConfig;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Convert messages to Google's format
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const response = await fetch(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          errorData.error?.message || 'Failed to generate text',
          errorData.error?.code || 'GOOGLE_AI_ERROR',
          response.status,
          errorData
        );
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = data.usageMetadata;

      return {
        content,
        model: model,
        usage: usage && {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
        },
        metadata: {
          safetyRatings: data.candidates?.[0]?.safetyRatings,
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
}
