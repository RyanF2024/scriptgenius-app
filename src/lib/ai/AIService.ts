import { AIProvider, AIRequestOptions, AIResponse, AIError } from './types';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { GoogleAIProvider } from './providers/google';

export class AIService {
  private static instance: AIService;
  private providers: Map<AIProvider, any> = new Map();
  private defaultProvider: AIProvider = 'openai';

  private constructor() {
    // Initialize all providers
    this.initializeProviders();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeProviders() {
    try {
      if (process.env.OPENAI_API_KEY) {
        this.providers.set('openai', new OpenAIProvider());
      }
      
      if (process.env.ANTHROPIC_API_KEY) {
        this.providers.set('anthropic', new AnthropicProvider());
      }
      
      if (process.env.GOOGLE_AI_KEY) {
        this.providers.set('google', new GoogleAIProvider());
      }
    } catch (error) {
      console.error('Failed to initialize AI providers:', error);
      throw new AIError(
        'Failed to initialize AI providers', 
        'PROVIDER_INIT_ERROR',
        500,
        { error }
      );
    }
  }

  public async generateText(
    options: AIRequestOptions,
    provider?: AIProvider
  ): Promise<AIResponse> {
    const selectedProvider = provider || this.defaultProvider;
    const providerInstance = this.providers.get(selectedProvider);

    if (!providerInstance) {
      throw new AIError(
        `Provider ${selectedProvider} is not available or not configured`, 
        'PROVIDER_NOT_AVAILABLE',
        400
      );
    }

    try {
      return await providerInstance.generateText(options);
    } catch (error) {
      console.error(`Error generating text with ${selectedProvider}:`, error);
      throw new AIError(
        error.message || 'Failed to generate text',
        error.code || 'GENERATION_ERROR',
        error.statusCode || 500,
        error.details
      );
    }
  }

  public setDefaultProvider(provider: AIProvider): void {
    if (!this.providers.has(provider)) {
      throw new AIError(
        `Provider ${provider} is not available`, 
        'PROVIDER_NOT_AVAILABLE',
        400
      );
    }
    this.defaultProvider = provider;
  }

  public getAvailableProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  public isProviderAvailable(provider: AIProvider): boolean {
    return this.providers.has(provider);
  }
}
