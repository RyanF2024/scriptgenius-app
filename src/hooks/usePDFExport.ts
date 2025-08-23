import { useState, ReactElement } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface GeneratePDFProps {
  document: ReactElement;
  fileName?: string;
  buttonText?: string;
  className?: string;
}

interface PDFDownloadLinkRenderProps {
  blob: Blob | null;
  url: string | null;
  loading: boolean;
  error: Error | null;
}

export const usePDFExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = ({
    document,
    fileName = 'report.pdf',
    buttonText = 'Download PDF',
    className = '',
  }: GeneratePDFProps): ReactElement => {
    return (
      <PDFDownloadLink
        document={document}
        fileName={fileName}
        className="w-full"
      >
        {({ loading }: PDFDownloadLinkRenderProps) => (
          <Button className={className} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {buttonText}
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>
    );
  };

  const previewPDF = (document: ReactElement): ReactElement => (
    <div className="w-full h-[80vh] border rounded-lg overflow-hidden">
      <PDFViewer width="100%" height="100%">
        {document}
      </PDFViewer>
    </div>
  );

  return {
    generatePDF,
    previewPDF,
    isGenerating,
    setIsGenerating,
  };
};

export default usePDFExport;
