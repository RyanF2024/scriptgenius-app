export type AnalysisStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface AnalysisResult {
  [key: string]: {
    id: string;
    scriptId: string;
    userId: string;
    type: string;
    status: AnalysisStatus;
    content?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    creditsUsed: number;
  };
}

export interface ScriptAnalysis {
  id: string;
  userId: string;
  title: string;
  content: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  wordCount: number;
  analyses: AnalysisResult;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisRequest {
  scriptId: string;
  reportType: string;
  persona?: string;
  options?: Record<string, any>;
}

export interface AnalysisResponse {
  id: string;
  status: AnalysisStatus;
  content?: string;
  metadata?: Record<string, any>;
  creditsUsed: number;
  estimatedTime?: number;
}
