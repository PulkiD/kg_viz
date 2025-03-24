import { useState, useEffect } from 'react';

interface EvolutionControlProps {
  minYear: number;
  maxYear: number;
  onYearChange: (year: number | null) => void;
}

export default function EvolutionControl({ minYear, maxYear, onYearChange }: EvolutionControlProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [selectedYear, setSelectedYear] = useState(maxYear);

  // When evolution is disabled, set year to null
  useEffect(() => {
    if (!isEnabled) {
      onYearChange(null);
    } else {
      onYearChange(selectedYear);
    }
  }, [isEnabled, selectedYear, onYearChange]);

  const handleYearChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    if (isEnabled) {
      onYearChange(year);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsEnabled(!isEnabled)}
        className={`w-full px-4 py-2 rounded-md transition-colors flex items-center justify-between font-medium
          ${isEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
      >
        <span className="text-white">Evolution View</span>
        <span className={`px-2 py-1 rounded text-sm ${isEnabled ? 'bg-blue-700' : 'bg-gray-600'}`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </span>
      </button>

      {isEnabled && (
        <div className="space-y-3 px-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Year: {selectedYear}</span>
            <button 
              onClick={() => {
                setSelectedYear(maxYear);
                onYearChange(maxYear);
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Reset
            </button>
          </div>
          
          <input
            type="range"
            min={minYear}
            max={maxYear}
            value={selectedYear}
            onChange={handleYearChange}
            className="w-full accent-blue-600 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>{minYear}</span>
            <span>{maxYear}</span>
          </div>
        </div>
      )}
    </div>
  );
} 