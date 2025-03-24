'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { GraphData } from '@/types/graph';
import GraphVisualization from '@/components/visualization/GraphVisualization';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  useEffect(() => {
    const query = searchParams.get('query');
    if (!query) {
      setError('No query provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch('/api/graph', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch graph data');
        }

        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-sm text-gray-400">Fetching graph data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-400">Error</h2>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Navbar */}
      <nav className="h-16 bg-black-900 border-b border-black-800 flex justify-center px-7 p-5">
        {/* Left: Logo */}
        <div className="flex items-center">
          <span className="text-white font-bold text-xl items-center">PhoenixLS - KG</span>
        </div>

        {/* Center: Search Section */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="sflex items-center gap-4">
          <input 
                type="text" 
                value={searchParams.get('query') || ''} 
                readOnly
                className="flex-1 px-4 py-2 bg-black-800 text-white rounded-md border border-white-700"
                placeholder="Search query..."
              />
          </div>
        </div>

        {/* Right: Navigation */}
        <div className="flex items-center">
          <div className="flex items-center gap-6">
            <a
              href="/"
              className="text-white hover:text-gray-300 transition-colors px-3 py-2"
            >
              Home
            </a>
            <a
              href="/about"
              className="text-white hover:text-gray-300 transition-colors px-3 py-2"
            >
              About
            </a>
          </div>
        </div>
      </nav>
      

      {/* Main Content Area */}
      <div className="flex-1 flex relative">
        

        {/* Center - Graph Visualization */}
        <div className={`flex-1 transition-all duration-300 ease-in-out`}>
          {data ? (
            <GraphVisualization 
              data={data} 
              searchQuery={searchParams.get('query') || undefined}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-gray-400">No data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Loading...</h2>
          <p className="text-sm text-gray-500">Initializing...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
} 