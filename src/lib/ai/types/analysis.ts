export interface ScriptMetrics {
  // Readability metrics
  fleschReadingEase?: number;
  fleschKincaidGrade?: number;
  smogIndex?: number;
  averageWordLength?: number;
  averageSentenceLength?: number;
  
  // Structure metrics
  sceneCount?: number;
  pageCount?: number;
  dialoguePercentage?: number;
  actionPercentage?: number;
  
  // Character analysis
  characterCount?: number;
  mainCharacters?: Array<{
    name: string;
    dialogueCount: number;
    wordCount: number;
    scenes: number[];
  }>;
  
  // Dialogue analysis
  averageDialogueLength?: number;
  dialogueDiversity?: number;
  
  // Sentiment analysis
  overallSentiment?: {
    score: number;
    comparative: number;
    positive: number;
    negative: number;
  };
  
  // Format compliance
  formatErrors?: Array<{
    type: 'dialogue' | 'action' | 'scene_heading' | 'character' | 'parenthetical' | 'transition';
    message: string;
    lineNumber: number;
    context: string;
  }>;
  
  // Genre-specific metrics
  genreMetrics?: Record<string, any>;
}

export interface ScriptAnalysisResult {
  scriptId: string;
  metrics: ScriptMetrics;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ScriptAnalysisOptions {
  analyzeStructure?: boolean;
  analyzeDialogue?: boolean;
  analyzeCharacters?: boolean;
  analyzeSentiment?: boolean;
  checkFormatting?: boolean;
  genre?: string;
  targetAudience?: string;
  comparisonScripts?: string[];
  customMetrics?: Record<string, any>;
}
