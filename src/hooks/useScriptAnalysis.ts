import { useState } from 'react';
import { ScriptAnalysisOptions, ScriptAnalysisResult } from '@/lib/ai/types/analysis';

export const useScriptAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScriptAnalysisResult | null>(null);

  const analyzeScript = async (
    script: string, 
    options: ScriptAnalysisOptions = {},
    reportType?: string,
    persona?: string,
    title?: string,
    genre?: string,
    targetAudience?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          reportType,
          persona,
          title,
          genre,
          targetAudience,
          options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze script');
      }

      const data = await response.json();
      setResult(data);
      return data;
    } catch (err: any) {
      console.error('Script analysis error:', err);
      setError(err.message || 'An error occurred during script analysis');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    analyzeScript,
    isLoading,
    error,
    result,
    reset: () => {
      setError(null);
      setResult(null);
    },
  };
};

export default useScriptAnalysis;
