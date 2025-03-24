export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Knowledge Graph Explorer
        </h1>
        
        <div className="bg-white/5 p-8 rounded-lg backdrop-blur-2xl">
          <form 
            className="space-y-4"
            action="/results"
            method="GET"
          >
            <div className="space-y-2">
              <label htmlFor="query" className="block text-sm font-medium">
                Enter your Cypher query
              </label>
              <textarea
                id="query"
                name="query"
                rows={4}
                className="w-full rounded-md border border-gray-300 bg-white/5 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                placeholder="MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 10"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Explore Graph
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Visualize and explore your Neo4j knowledge graph</p>
          </div>
        </div>
      </div>
    </main>
  );
}
