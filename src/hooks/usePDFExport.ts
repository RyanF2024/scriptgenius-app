import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

export const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = ({
    document,
    fileName = 'report.pdf',
    buttonText = 'Download PDF',
    className = ''
  }: {
    document: React.ReactElement;
    fileName?: string;
    buttonText?: string;
    className?: string;
  }) => {
    return (
      <PDFDownloadLink
        document={document}
        fileName={fileName}
        className="w-full"
      >
        {({ blob, url, loading, error }) => {
          if (loading) {
            return (
              <Button disabled className={className}>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing PDF...
              </Button>
            );
          }
          
          return (
            <Button className={className}>
              <Download className="mr-2 h-4 w-4" />
              {buttonText}
            </Button>
          );
        }}
      </PDFDownloadLink>
    );
  };

  const previewPDF = (document: React.ReactElement) => {
    return (
      <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
        <PDFViewer width="100%" height="100%">
          {document}
        </PDFViewer>
      </div>
    );
  };

  return {
    generatePDF,
    previewPDF,
    isGenerating,
  };
};

export default usePDFExport;
