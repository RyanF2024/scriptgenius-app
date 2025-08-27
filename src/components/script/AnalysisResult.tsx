'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

type AnalysisResultProps = {
  result: any; // Replace with your actual result type
  scriptContent: string;
  fileName: string;
  onExportPDF?: () => void;
};

export function AnalysisResult({ 
  result, 
  scriptContent, 
  fileName, 
  onExportPDF 
}: AnalysisResultProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Analysis Results</CardTitle>
        {onExportPDF && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onExportPDF}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {result.structure && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Structure Analysis</h3>
              <div className="rounded-md border p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result.structure, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {result.dialogue && (
            <div>
              <h3 className="mb-2 text-lg font-semibold">Dialogue Analysis</h3>
              <div className="rounded-md border p-4">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result.dialogue, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Add more result sections as needed */}
        </div>
      </CardContent>
    </Card>
  );
}
