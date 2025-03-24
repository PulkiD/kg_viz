# Knowledge Graph Visualizer

A modern web application built with Next.js 14 for visualizing Neo4j knowledge graphs with interactive network exploration capabilities.

## Features

- **Interactive Graph Visualization**: D3.js-powered network graph with zoom, pan, and drag capabilities
- **Neo4j Database Integration**: Seamless connection with Neo4j graph databases
- **Cypher Query Interface**: Search and query your knowledge graph using Cypher
- **Network Exploration**: Click on nodes to view properties and expand connections
- **Evolution Timeline**: Visualize how relationships evolve over time with a year slider
  - Filtered relationships appear as grey edges rather than disappearing completely
  - Active relationships remain white while inactive ones turn dark grey
- **Advanced Filtering**:
  - Filter by node types to focus on specific entities
  - Filter relationships by year using the evolution control
  - Visual indicators for active vs inactive relationships
- **Interactive Properties**: View detailed properties of nodes and relationships by clicking
- **Stats Dashboard**: Real-time statistics about visible nodes and relationships
- **Responsive Design**: Modern UI that works across different screen sizes

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Visualization**: D3.js for interactive graph rendering
- **Database**: Neo4j Driver for graph database connectivity
- **State Management**: Zustand for efficient app-wide state
- **UI Components**: Radix UI for accessible interface elements
- **Styling**: Tailwind CSS with custom dark theme

## Prerequisites

- Node.js 18.17 or later
- Neo4j Database instance (local or cloud)
- npm or yarn

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd kg-viz
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEO4J_URI=your-neo4j-uri
NEO4J_USER=your-neo4j-user
NEO4J_PASSWORD=your-neo4j-password
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

## Usage Guide

1. **Home Page**: Start by entering a Cypher query or selecting a preset query
2. **Results Page**: View the visualization of your query results
   - Use the zoom and pan controls to navigate the graph
   - Click on nodes to view their properties
   - Click on edges to view relationship details
   - Use the node type filters to show/hide specific node types
   - Use the evolution slider to see how relationships evolve over time
   - Grey edges indicate relationships filtered out by the evolution control
3. **Explorer**: Navigate through your knowledge graph by expanding nodes

## Project Structure

```
src/
├── app/                    # App router pages
│   ├── page.tsx           # Landing page
│   ├── results/           # Results page
│   └── explorer/          # Network explorer page
├── components/            # Reusable components
│   ├── common/           # Common UI components
│   │   └── EvolutionControl.tsx  # Year range slider for evolution filtering
│   ├── layout/           # Layout components
│   └── visualization/    # D3.js visualization components
│       └── GraphVisualization.tsx  # Main graph rendering component
├── lib/                  # Utility functions and configurations
│   ├── neo4j/           # Neo4j database connection and utilities
│   └── utils/           # General utility functions
├── services/            # Business logic and API services
│   ├── graph/          # Graph data processing services
│   └── api/            # API related services
├── types/              # TypeScript type definitions
│   └── graph.ts       # Graph data structure types
└── styles/            # Global styles and theme configurations
```

## Key Components

### GraphVisualization

The core visualization component that renders the knowledge graph using D3.js. Features include:

- Interactive node and edge rendering
- Color-coding of different node types
- Evolution filtering with visual indicators for inactive relationships
- Properties display for selected nodes and edges
- Zoom, pan, and drag interactions
- Real-time statistics about visible data

### Graph Data Model

The application uses the following data structures:

- **Node**: Represents entities in the knowledge graph with properties
- **Relationship**: Connections between nodes with optional evolution data
- **Evolution**: Year-based weightage data for relationships
- **GraphData**: Contains collections of nodes and relationships

## Development

- Follow the TypeScript strict mode guidelines
- Use ESLint for code linting
- Follow the component-driven development approach
- Implement proper error handling
- Write clean, maintainable, and reusable code

### Working with Evolution Data

The evolution system allows relationships to show changes over time:

1. Relationships can have an optional `evolution` property
2. The evolution object maps years to weight values
3. When filtering by year with the evolution control:
   - Relationships with evolution data up to the selected year remain active (white)
   - Filtered relationships appear as dark grey instead of disappearing
   - The stats panel updates to show active vs. total relationship counts

## Production Deployment

1. Build the application:
```bash
npm run build
# or
yarn build
```

2. Start the production server:
```bash
npm start
# or
yarn start
```

## Troubleshooting

- If the visualization isn't rendering, check browser console for errors
- Verify Neo4j credentials in the `.env.local` file
- Ensure your Cypher queries return data in the expected format
- Check that Node.js version is 18.17 or higher

## License

[MIT](LICENSE)
