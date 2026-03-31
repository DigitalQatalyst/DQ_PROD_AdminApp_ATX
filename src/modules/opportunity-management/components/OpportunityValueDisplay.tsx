import React from 'react';

interface OpportunityValueDisplayProps {
  value: number;
  currency?: string;
  compact?: boolean;
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  AED: 'AED ',
  EUR: '€',
  GBP: '£',
};

export const OpportunityValueDisplay: React.FC<OpportunityValueDisplayProps> = ({
  value,
  currency = 'USD',
  compact = false,
}) => {
  const symbol = currencySymbols[currency] ?? currency + ' ';

  if (compact) {
    const k = value / 1000;
    return <span>{symbol}{k % 1 === 0 ? k : k.toFixed(1)}k</span>;
  }

  return <span>{symbol}{value.toLocaleString()}</span>;
};
