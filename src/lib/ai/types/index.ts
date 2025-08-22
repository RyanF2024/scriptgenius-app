// Supported AI providers
export type AIProvider = 'openai' | 'anthropic' | 'google';

// Analysis persona types
export type AnalysisPersona = 'general' | 'hollywood' | 'independent' | 'character';

// Report types
export type ReportType = 'coverage' | 'character' | 'structure' | 'dialogue' | 'market';

// Base message interface
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// AI model configuration
export interface AIModelConfig {
  provider: AIProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

// AI request options
export interface AIRequestOptions {
  messages: AIMessage[];
  modelConfig: AIModelConfig;
  stream?: boolean;
  timeout?: number;
}

// AI response format
export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

// Chunking options
export interface ChunkingOptions {
  maxChunkSize: number;
  overlap?: number;
  separator?: string;
}

// Script analysis context
export interface ScriptAnalysisContext {
  scriptTitle: string;
  genre?: string;
  tone?: string;
  targetAudience?: string;
  analysisFocus?: string[];
}

// Report template interface
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPrompt: string;
  requiredContext?: string[];
  outputFormat?: 'markdown' | 'json' | 'html';
}

// Error types
export class AIError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AIError';
  }
}
