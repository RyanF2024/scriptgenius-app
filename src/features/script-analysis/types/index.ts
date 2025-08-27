export interface ScriptAnalysisOptions {
  analyzeStructure: boolean;
  analyzeDialogue: boolean;
  analyzeCharacters: boolean;
  analyzeSentiment: boolean;
  checkFormatting: boolean;
}

export interface CharacterAnalysis {
  name: string;
  dialogueCount: number;
  wordCount: number;
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
  };
}

export interface DialogueAnalysis {
  averageLength: number;
  longestScene: {
    scene: string;
    wordCount: number;
  };
  sentiment: {
    overall: number;
    byCharacter: Record<string, number>;
  };
}

export interface StructureAnalysis {
  sceneCount: number;
  actBreaks: number[];
  sceneLocations: string[];
  timeOfDay: Record<string, number>;
}

export interface FormattingIssue {
  type: 'parenthetical' | 'dialogue' | 'action' | 'scene' | 'character';
  message: string;
  line: number;
  context: string;
}

export interface AnalysisResult {
  structure?: StructureAnalysis;
  dialogue?: DialogueAnalysis;
  characters?: CharacterAnalysis[];
  sentiment?: {
    overall: number;
    byScene: Array<{
      scene: number;
      score: number;
    }>;
  };
  formatting?: {
    issues: FormattingIssue[];
    score: number;
  };
  summary: string;
  score: number;
  timestamp: string;
  metadata: {
    title: string;
    author: string;
    pageCount: number;
    wordCount: number;
  };
}
