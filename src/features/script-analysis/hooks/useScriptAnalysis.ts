import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

export interface ScriptAnalysisOptions {
  analyzeStructure: boolean;
  analyzeDialogue: boolean;
  analyzeCharacters: boolean;
  analyzeSentiment: boolean;
  checkFormatting: boolean;
}

export interface AnalysisResult {
  structure?: any;
  dialogue?: any;
  characters?: any;
  sentiment?: any;
  formatting?: any;
  summary?: string;
  score?: number;
  timestamp: string;
}

export function useScriptAnalysis() {
  const queryClient = useQueryClient();

  const analyzeScriptMutation = useMutation(
    async (payload: { content: string; options: ScriptAnalysisOptions; reportType: string }) => {
      const response = await apiClient.post('/api/analyze', payload);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['analysisHistory']);
      },
      onError: (error: Error) => {
        console.error('Analysis failed:', error);
        toast.error('Failed to analyze script. Please try again.');
      },
    }
  );

  return {
    analyzeScript: (
      content: string, 
      options: ScriptAnalysisOptions, 
      reportType: string
    ) => analyzeScriptMutation.mutateAsync({ content, options, reportType }),
    isLoading: analyzeScriptMutation.isLoading,
    error: analyzeScriptMutation.error,
    result: analyzeScriptMutation.data,
    reset: analyzeScriptMutation.reset,
  };
}
