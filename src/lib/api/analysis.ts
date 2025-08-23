import { AnalysisRequest, AnalysisResponse, ScriptAnalysis } from '@/types/analysis';

const API_BASE_URL = '/api';

export async function uploadScript(file: File): Promise<ScriptAnalysis> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload script');
  }

  return response.json();
}

export async function analyzeScript(request: AnalysisRequest): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze script');
  }

  return response.json();
}

export async function getScriptAnalysis(scriptId: string): Promise<ScriptAnalysis> {
  const response = await fetch(`${API_BASE_URL}/analysis?scriptId=${scriptId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch analysis');
  }

  return response.json();
}

export async function getScriptAnalyses(): Promise<ScriptAnalysis[]> {
  const response = await fetch(`${API_BASE_URL}/analyses`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch analyses');
  }

  return response.json();
}

export async function deleteAnalysis(analysisId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete analysis');
  }
}

export async function exportAnalysis(analysisId: string, format: 'pdf' | 'docx' = 'pdf'): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/export?format=${format}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to export analysis');
  }

  return response.blob();
}
