import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Upload, FileText, Download } from 'lucide-react';
import useScriptAnalysis, { ScriptAnalysisOptions } from '@/hooks/useScriptAnalysis';
import { Button } from '@/components/ui/button';
import PDFReport from '../report/PDFReport';
import usePDFExport from '@/hooks/usePDFExport';

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

  const { analyzeScript, isLoading, error, result, reset } = useScriptAnalysis();
  const { generatePDF } = usePDFExport();
  const [showPDFPreview, setShowPDFPreview] = React.useState(false);

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
        'comprehensive', // Report type
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
            <div 
              className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your script file here, or click to select
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .fountain, .txt
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fountain,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-medium">{fileName}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setScriptContent('');
                    setFileName('');
                    reset();
                  }}
                >
                  Change
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Analysis Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(options).map(([key, value]) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => 
                            handleOptionChange(key as keyof ScriptAnalysisOptions, e.target.checked)
                          }
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Script'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analyzing Script</CardTitle>
            <CardDescription>This may take a moment...</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={50} className="h-2" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowPDFPreview(!showPDFPreview)}
            >
              {showPDFPreview ? 'Hide Preview' : 'Preview PDF'}
            </Button>
            {generatePDF({
              document: (
                <PDFReport 
                  analysis={result} 
                  title={`${fileName || 'Script'} Analysis Report`}
                />
              ),
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
