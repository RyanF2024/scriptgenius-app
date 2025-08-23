import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  text: string;
  included: boolean;
}

interface PlanCardProps {
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: Feature[];
  isPopular?: boolean;
  isCurrentPlan?: boolean;
  onSelect: (billingInterval: 'month' | 'year') => void;
  isLoading?: boolean;
  billingInterval?: 'month' | 'year';
}

export function PlanCard({
  name,
  description,
  priceMonthly,
  priceYearly,
  features,
  isPopular = false,
  isCurrentPlan = false,
  onSelect,
  isLoading = false,
  billingInterval = 'month',
}: PlanCardProps) {
  const price = billingInterval === 'year' ? priceYearly : priceMonthly;
  const isFree = price === 0;

  return (
    <div
      className={cn(
        'relative flex flex-col p-6 bg-white rounded-lg border border-gray-200 shadow-sm',
        isPopular && 'border-2 border-primary shadow-md',
        isCurrentPlan && 'ring-2 ring-primary'
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>

        <div className="mt-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">
              {isFree ? 'Free' : `$${price}`}
            </span>
            {!isFree && (
              <span className="ml-1 text-lg font-medium text-gray-500">
                /{billingInterval === 'year' ? 'year' : 'month'}
              </span>
            )}
          </div>
          {!isFree && billingInterval === 'year' && (
            <p className="mt-1 text-sm text-gray-500">
              Billed annually (save {Math.round((1 - priceYearly / (priceMonthly * 12)) * 100)}%)
            </p>
          )}
        </div>

        <ul className="mt-6 space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              {feature.included ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <span className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0">•</span>
              )}
              <span
                className={cn(
                  'text-sm',
                  feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
                )}
              >
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8">
        <Button
          onClick={() => onSelect(billingInterval)}
          className={cn(
            'w-full',
            isCurrentPlan
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : isPopular
              ? 'bg-primary hover:bg-primary/90'
              : 'bg-gray-900 hover:bg-gray-800'
          )}
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : isCurrentPlan
            ? 'Current Plan'
            : isFree
            ? 'Get Started'
            : 'Subscribe'}
        </Button>
      </div>
    </div>
  );
}
