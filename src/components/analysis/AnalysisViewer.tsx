'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, FileText, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { AnalysisResult, AnalysisStatus } from '@/types/analysis';

interface AnalysisViewerProps {
  scriptId: string;
  initialAnalysis?: AnalysisResult | null;
}

export function AnalysisViewer({ scriptId, initialAnalysis = null }: AnalysisViewerProps) {
  const { data: session } = useSession();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(initialAnalysis);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('coverage');

  // Fetch analysis data if not provided
  useEffect(() => {
    if (!initialAnalysis && scriptId) {
      fetchAnalysis();
    }
  }, [scriptId]);

  const fetchAnalysis = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analysis?scriptId=${scriptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError(err.message || 'Failed to load analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async (type: string) => {
    if (!session?.user?.id || !scriptId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scriptId,
          reportType: type,
          persona: 'general', // Default persona, can be made configurable
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to run analysis');
      }

      const data = await response.json();
      setAnalysis(prev => ({
        ...prev,
        [type]: {
          ...data,
          status: 'completed' as const,
          updatedAt: new Date().toISOString(),
        },
      }));
      
      toast.success('Analysis completed successfully');
    } catch (err) {
      console.error('Error running analysis:', err);
      setError(err.message || 'Failed to run analysis');
      toast.error('Failed to run analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = (status: AnalysisStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center text-green-600">
            <CheckCircle className="mr-1 h-4 w-4" />
            Completed
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center text-red-600">
            <XCircle className="mr-1 h-4 w-4" />
            Failed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center text-blue-600">
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            In Progress
          </span>
        );
      default:
        return 'Not Started';
    }
  };

  const analysisTypes = [
    { id: 'coverage', name: 'Script Coverage', description: 'Comprehensive script analysis' },
    { id: 'structure', name: 'Structure Analysis', description: 'Narrative structure breakdown' },
    { id: 'character', name: 'Character Analysis', description: 'In-depth character evaluation' },
    { id: 'dialogue', name: 'Dialogue Analysis', description: 'Dialogue quality assessment' },
    { id: 'market', name: 'Market Analysis', description: 'Commercial potential evaluation' },
  ];

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analysis</CardTitle>
          <CardDescription>Error loading analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8 text-red-600">
            <AlertCircle className="mr-2 h-5 w-5" />
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={setActiveTab}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          {analysisTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <Button 
          onClick={() => runAnalysis(activeTab)}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : 'Run Analysis'}
        </Button>
      </div>

      {analysisTypes.map(type => (
        <TabsContent key={type.id} value={type.id} className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </div>
                {analysis?.[type.id]?.status && (
                  <div className="text-sm text-muted-foreground">
                    {renderStatus(analysis[type.id].status)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {analysis?.[type.id]?.status === 'completed' ? (
                <div className="prose max-w-none dark:prose-invert">
                  {analysis[type.id].content ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: formatAnalysisContent(analysis[type.id].content) 
                    }} />
                  ) : (
                    <p>No analysis content available.</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-center">
                    No analysis available. Click "Run Analysis" to generate a {type.name.toLowerCase()}.
                  </p>
                </div>
              )}
            </CardContent>
            {analysis?.[type.id]?.updatedAt && (
              <CardFooter className="text-xs text-muted-foreground">
                Last updated: {new Date(analysis[type.id].updatedAt).toLocaleString()}
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Helper function to format markdown content
function formatAnalysisContent(content: string): string {
  // Simple markdown to HTML conversion
  // Consider using a proper markdown library for production
  return content
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>')
    .replace(/^-\s+(.*)$/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>');
}
