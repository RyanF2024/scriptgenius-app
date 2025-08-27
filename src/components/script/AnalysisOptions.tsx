'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

type AnalysisOptionsProps = {
  options: {
    analyzeStructure: boolean;
    analyzeDialogue: boolean;
    analyzeCharacters: boolean;
    analyzeSentiment: boolean;
    checkFormatting: boolean;
  };
  onOptionsChange: (options: AnalysisOptionsProps['options']) => void;
  disabled?: boolean;
};

export function AnalysisOptions({ 
  options, 
  onOptionsChange, 
  disabled = false 
}: AnalysisOptionsProps) {
  const handleOptionChange = (key: keyof typeof options) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Analysis Options</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.entries(options).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={value as boolean}
              onCheckedChange={() => handleOptionChange(key as keyof typeof options)}
              disabled={disabled}
              className="h-4 w-4"
            />
            <Label 
              htmlFor={key}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
