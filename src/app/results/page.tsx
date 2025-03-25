'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { GraphData } from '@/types/graph';
import GraphVisualization from '@/components/visualization/GraphVisualization';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const [query, setQuery] = useState(searchParams.get('query') || '');

  useEffect(() => {
    const queryParam = searchParams.get('query');
    if (!queryParam) {
      setError('No query provided');
      setLoading(false);
      return;
    }

    setQuery(queryParam);
    fetchData(queryParam);
  }, [searchParams]);

  const fetchData = async (queryText: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/graph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: queryText }),
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

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/results?query=${encodeURIComponent(query.trim())}`);
    }
  };

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
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
          <form onSubmit={handleQuerySubmit} className="flex items-center gap-4 w-full max-w-2xl">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 px-4 py-2 bg-black-800 text-white rounded-md border border-white-700"
              placeholder="Enter your Neo4j query..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </form>
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
        <div className="flex-1 transition-all duration-300 ease-in-out">
          {data ? (
            <GraphVisualization 
              data={data} 
              searchQuery={query}
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