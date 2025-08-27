'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload, FileText, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useScriptAnalysis, type ScriptAnalysisOptions } from '../hooks/useScriptAnalysis';

// Dynamically import heavy components
const AnalysisOptions = dynamic(
  () => import('./AnalysisOptions').then(mod => mod.AnalysisOptions),
  { 
    loading: () => <Skeleton className="h-[200px] w-full" />,
    ssr: false 
  }
);

const AnalysisResult = dynamic(
  () => import('./AnalysisResult'),
  { 
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false 
  }
);

export function ScriptAnalysis() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scriptContent, setScriptContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [options, setOptions] = useState<ScriptAnalysisOptions>({
    analyzeStructure: true,
    analyzeDialogue: true,
    analyzeCharacters: true,
    analyzeSentiment: true,
    checkFormatting: true,
  });

  const { analyzeScript, isLoading, error, result } = useScriptAnalysis();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setScriptContent(content);
    };
    
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!scriptContent) return;
    
    try {
      await analyzeScript(
        scriptContent,
        options,
        'comprehensive'
      );
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Script Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".fountain,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {fileName || 'Upload Script'}
            </Button>
            {fileName && (
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-2 h-4 w-4" />
                {fileName}
              </div>
            )}
          </div>

          <AnalysisOptions 
            options={options} 
            onOptionsChange={setOptions} 
          />

          <Button 
            onClick={handleAnalyze} 
            disabled={!scriptContent || isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Script'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : 'An unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <AnalysisResult 
          result={result} 
          scriptContent={scriptContent}
          fileName={fileName}
        />
      )}
    </div>
  );
}
