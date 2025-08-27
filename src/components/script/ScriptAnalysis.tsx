'use client';

import { useRef, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const PDFReport = dynamic(
  () => import('../report/PDFReport'),
  { 
    loading: () => <Skeleton className="h-[500px] w-full" />,
    ssr: false 
  }
);

const useScriptAnalysis = dynamic(
  () => import('@/hooks/useScriptAnalysis').then(mod => mod.default),
  { ssr: false }
);

const usePDFExport = dynamic(
  () => import('@/hooks/usePDFExport').then(mod => mod.default),
  { ssr: false }
);

type ScriptAnalysisOptions = {
  analyzeStructure: boolean;
  analyzeDialogue: boolean;
  analyzeCharacters: boolean;
  analyzeSentiment: boolean;
  checkFormatting: boolean;
};

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

  // Lazy load hooks only when needed
  const { analyzeScript, isLoading, error, result, reset } = useScriptAnalysis?.() || {};
  const { generatePDF } = usePDFExport?.() || {};
  const [showPDFPreview, setShowPDFPreview] = useState(false);

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
    if (!scriptContent || !analyzeScript) return;
    
    try {
      await analyzeScript(
        scriptContent,
        options,
        'comprehensive'
        'professional',   // Persona
        fileName || 'Untitled Script',
        'drama',          // Default genre
        'general'         // Default audience
      );
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const handleOptionChange = (key: keyof ScriptAnalysisOptions, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Script Analysis</CardTitle>
          <CardDescription>
            Upload your script to receive a detailed analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!scriptContent ? (
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

          <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
            <AnalysisOptions 
              options={options} 
              onOptionsChange={setOptions} 
              disabled={isLoading}
            />
          </Suspense>

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
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <AnalysisResult 
            result={result} 
            scriptContent={scriptContent}
            fileName={fileName}
            onExportPDF={generatePDF ? () => setShowPDFPreview(true) : undefined}
          />
        </Suspense>
      )}
              fileName: `${fileName || 'script-analysis'}-${new Date().toISOString().split('T')[0]}.pdf`,
              buttonText: 'Download PDF',
              className: 'h-9 px-4 py-2'
            })}
          </div>

          {showPDFPreview && (
            <div className="border rounded-lg overflow-hidden">
              <PDFViewer width="100%" height="600px">
                <PDFReport 
                  analysis={result} 
                  title={`${fileName || 'Script'} Analysis Report`}
                />
              </PDFViewer>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>Summary of script analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.summary || 'No summary available'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Scene Count</h4>
                    <p className="text-2xl font-bold">{result.metrics.sceneCount || 0}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Characters</h4>
                    <p className="text-2xl font-bold">{result.metrics.characterCount || 0}</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Avg. Dialogue Length</h4>
                    <p className="text-2xl font-bold">
                      {result.metrics.averageDialogueLength?.toFixed(1) || 'N/A'} words
                    </p>
                  </div>
                </div>

                {result.metrics.formatErrors && result.metrics.formatErrors.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Formatting Issues</h3>
                    <div className="space-y-2">
                      {result.metrics.formatErrors.slice(0, 5).map((error, index) => (
                        <Alert key={index} variant="destructive" className="text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle className="text-sm">
                            Line {error.lineNumber}: {error.message}
                          </AlertTitle>
                          <AlertDescription className="text-xs">
                            {error.context}
                          </AlertDescription>
                        </Alert>
                      ))}
                      {result.metrics.formatErrors.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          +{result.metrics.formatErrors.length - 5} more issues found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ScriptAnalysis;
