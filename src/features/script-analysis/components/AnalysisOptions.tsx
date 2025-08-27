import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScriptAnalysisOptions } from '@/features/script-analysis/types';

type AnalysisOptionsProps = {
  options: ScriptAnalysisOptions;
  onOptionsChange: (options: ScriptAnalysisOptions) => void;
};

export function AnalysisOptions({ options, onOptionsChange }: AnalysisOptionsProps) {
  const handleOptionChange = (key: keyof ScriptAnalysisOptions) => {
    onOptionsChange({
      ...options,
      [key]: !options[key],
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Analysis Options</h3>
      <div className="space-y-2">
        {Object.entries(options).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2">
            <Checkbox
              id={key}
              checked={value as boolean}
              onCheckedChange={() => handleOptionChange(key as keyof ScriptAnalysisOptions)}
            />
            <Label htmlFor={key} className="capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
