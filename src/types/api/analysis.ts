import type { ApiResponse } from './index';

export interface AnalysisResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  error: string | null;
  metrics: {
    totalScenes: number;
    totalPages: number;
    totalCharacters: number;
    totalDialogue: number;
    totalAction: number;
    totalParentheticals: number;
    totalTransitions: number;
    totalShots: number;
    totalLocations: number;
    totalCharactersWithDialogue: number;
    averageSceneLength: number;
    averagePageLength: number;
    averageDialoguePerCharacter: number;
    averageScenesPerPage: number;
  };
  characters: Array<{
    id: string;
    name: string;
    description: string | null;
    isLead: boolean;
    isSupporting: boolean;
    isMinor: boolean;
    gender: 'male' | 'female' | 'non-binary' | 'unknown' | null;
    age: string | null;
    ethnicity: string | null;
    dialogueCount: number;
    sceneCount: number;
    firstAppearance: string | null;
    lastAppearance: string | null;
  }>;
  scenes: Array<{
    id: string;
    sceneNumber: number;
    pageNumber: number;
    location: string;
    timeOfDay: string;
    description: string;
    characters: string[];
    length: number;
    isActionHeavy: boolean;
    isDialogueHeavy: boolean;
    mood: string;
    tension: number;
  }>;
  locations: Array<{
    id: string;
    name: string;
    description: string | null;
    sceneCount: number;
    isInterior: boolean;
    isExterior: boolean;
    timeOfDay: string | null;
  }>;
  themes: Array<{
    id: string;
    name: string;
    description: string;
    relevance: number;
    keywords: string[];
  }>;
  structure: {
    act1: {
      start: number;
      end: number;
      percentage: number;
    };
    act2: {
      start: number;
      end: number;
      percentage: number;
    };
    act3: {
      start: number;
      end: number;
      percentage: number;
    };
    midpoint: number;
    climax: number;
  };
  pacing: Array<{
    page: number;
    tension: number;
    dialogueDensity: number;
    actionDensity: number;
    sceneChanges: number;
  }>;
  dialogueAnalysis: {
    totalWords: number;
    averageWordsPerCharacter: number;
    longestSpeech: {
      character: string;
      wordCount: number;
      scene: number;
    };
    mostTalkativeCharacter: {
      character: string;
      wordCount: number;
      percentage: number;
    };
  };
  scriptMetadata: {
    title: string;
    author: string;
    contact: string | null;
    draftDate: string | null;
    copyright: string | null;
    notes: string | null;
  };
}

export interface UploadScriptRequest {
  file: File;
  title?: string;
  author?: string;
  isPrivate?: boolean;
  tags?: string[];
}

export interface UploadScriptResponse extends ApiResponse<{
  id: string;
  status: 'uploaded' | 'processing' | 'completed' | 'failed';
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}> {}

export interface AnalyzeScriptRequest {
  scriptId: string;
  options?: {
    analyzeStructure?: boolean;
    analyzeCharacters?: boolean;
    analyzeDialogue?: boolean;
    analyzeThemes?: boolean;
    analyzePacing?: boolean;
    generateSummary?: boolean;
  };
}

export interface AnalyzeScriptResponse extends ApiResponse<{
  analysisId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTimeRemaining: number | null;
  createdAt: string;
  updatedAt: string;
  result: AnalysisResult | null;
}> {}

export interface GetAnalysisResponse extends ApiResponse<AnalysisResult> {}

export interface ListAnalysesResponse extends ApiResponse<{
  items: Array<{
    id: string;
    scriptId: string;
    scriptTitle: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    updatedAt: string;
    metrics?: {
      totalScenes: number;
      totalPages: number;
      totalCharacters: number;
    };
  }>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {}

export interface DeleteAnalysisResponse extends ApiResponse<{ success: boolean }> {}
