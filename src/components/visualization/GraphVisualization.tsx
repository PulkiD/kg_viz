'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { GraphData, Node, Relationship } from '@/types/graph';
import { SimulationNodeDatum, SimulationLinkDatum } from 'd3';
import EvolutionControl from '@/components/common/EvolutionControl';

interface GraphVisualizationProps {
  data: GraphData;
  searchQuery?: string;
}

// Define color scheme for different node types with brighter colors for dark theme
const nodeColors: { [key: string]: string } = {
  gene: '#FF6B6B',      // bright coral red
  disease: '#4ECDC4',   // bright turquoise
  drug: '#45B7D1',      // bright blue
  pathway: '#96CEB4',   // bright sage green
};

interface NodeInfo {
  node: Node;
  x: number;
  y: number;
}

interface EdgeInfo {
  edge: D3Link;
  x: number;
  y: number;
}

interface D3Node extends Node {
  x: number;
  y: number;
  fx: number | null;
  fy: number | null;
}

interface D3Link extends Omit<Relationship, 'source' | 'target'> {
  source: D3Node;
  target: D3Node;
  isActive?: boolean;
}

export default function GraphVisualization({ data, searchQuery }: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NodeInfo | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EdgeInfo | null>(null);
  
  // Get unique node types for filter options
  const allNodeTypes = Array.from(new Set(data.nodes.map(node => node.type)));
  
  // Initialize nodeTypeFilter with all node types by default (show everything)
  const [nodeTypeFilter, setNodeTypeFilter] = useState<string[]>(allNodeTypes);
  
  // State for evolution filtering
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  
  // Calculate min and max years from evolution data
  const getYearRange = () => {
    // Default range if no evolution data
    let minYear = 2020;
    let maxYear = 2025;
    
    // Extract years from all relationships with evolution data
    const years = new Set<number>();
    data.relationships.forEach(rel => {
      if (rel.evolution) {
        Object.entries(rel.evolution).forEach(([yearStr, weight]) => {
          if (weight > 0) {  // Only consider years with positive weights
            const year = parseInt(yearStr);
            if (!isNaN(year)) {
              years.add(year);
            }
          }
        });
      }
    });
    
    // Update range if years were found
    if (years.size > 0) {
      minYear = Math.min(...years);
      maxYear = Math.max(...years);
    }
    
    return { minYear, maxYear };
  };
  
  // Get year range for the evolution slider
  const { minYear, maxYear } = getYearRange();
  
  // Function to get filtered data
  const getFilteredData = () => {
    if (!data) return { nodes: [], relationships: [] };

    // Start with node type filtering
    let filteredNodes = data.nodes;
    if (nodeTypeFilter.length !== allNodeTypes.length) {
      filteredNodes = data.nodes.filter(node => 
        nodeTypeFilter.includes(node.type)
      );
    }
    
    // Get node IDs for relationship filtering
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Filter relationships by node types
    let filteredRelationships = data.relationships.filter(rel =>
      filteredNodeIds.has(rel.source) && filteredNodeIds.has(rel.target)
    );
    
    // Mark relationships as active or inactive based on evolution filtering
    if (selectedYear !== null) {
      console.log(`Filtering by evolution: year ${selectedYear}`);
      
      // Instead of filtering out relationships, mark them as active or inactive
      filteredRelationships = filteredRelationships.map(rel => {
        // Default to active
        let isActive = true;
        
        // If it has evolution data, check if it's active for the selected year
        if (rel.evolution && Object.keys(rel.evolution).length > 0) {
          isActive = Object.entries(rel.evolution).some(([yearStr, weight]) => {
            const year = parseInt(yearStr);
            return !isNaN(year) && year <= selectedYear && weight > 0;
          });
        }
        
        // Return the relationship with an isActive flag
        return {
          ...rel,
          isActive
        };
      });
    }

    return {
      nodes: filteredNodes,
      relationships: filteredRelationships
    };
  };

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) {
      console.log("No SVG ref or data:", { svgRef: !!svgRef.current, nodeCount: data?.nodes?.length });
      return;
    }
    
    console.log("Rendering graph with data:", { 
      nodes: data.nodes.length, 
      relationships: data.relationships.length,
      filtered: getFilteredData(),
      evolutionYear: selectedYear
    });

    // Clear any existing visualization
    d3.select(svgRef.current).selectAll('*').remove();

    const container = svgRef.current.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create container group for zoom
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Get filtered data
    const filteredData = getFilteredData();
    console.log("Filtered data:", { 
      nodes: filteredData.nodes.length, 
      relationships: filteredData.relationships.length 
    });
    
    // Prepare data for D3
    const nodes = filteredData.nodes.map(node => ({
      ...node,
      x: width / 2 + (Math.random() - 0.5) * 200, // Add some initial random positions
      y: height / 2 + (Math.random() - 0.5) * 200,
      fx: null,
      fy: null
    })) as D3Node[];

    // Create a map for faster node lookup
    const nodeMap = new Map<string, D3Node>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    const links = filteredData.relationships
      .map(rel => {
        const source = nodeMap.get(rel.source);
        const target = nodeMap.get(rel.target);
        if (!source || !target) return null;
        return {
          ...rel,
          source,
          target
        };
      })
      .filter((link): link is D3Link => link !== null);

    console.log("D3 data prepared:", { nodes: nodes.length, links: links.length });

    // Create arrow markers for both active and inactive links
    svg.append('defs').selectAll('marker')
      .data(['end', 'end-inactive'])
      .join('marker')
      .attr('id', d => d === 'end' ? 'arrow' : 'arrow-inactive')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => d === 'end' ? '#999' : '#444');
      
    // Create edge groups
    const linkGroups = g.append('g')
      .attr('class', 'links')
      .selectAll<SVGGElement, D3Link>('g')
      .data(links)
      .join('g')
      .attr('class', 'link-group');

    // Draw links with click handler
    const linkElements = linkGroups
      .append('line')
      .attr('stroke', d => d.isActive !== false ? '#ffffff' : '#444444')  // White for active, dark grey for inactive
      .attr('stroke-opacity', d => d.isActive !== false ? 0.6 : 0.3)  // More transparent for inactive
      .attr('stroke-width', 2)  // Constant width for all edges
      .attr('marker-end', d => d.isActive !== false ? 'url(#arrow)' : 'url(#arrow-inactive)')
      .style('cursor', 'pointer')
      .on('click', (event, d: D3Link) => {
        event.stopPropagation();
        const [x, y] = d3.pointer(event, svg.node());
        setSelectedEdge(prev => prev?.edge === d ? null : { edge: d, x, y });
        setSelectedNode(null);
      });

    // Add relationship labels with different styling based on active status
    const linkLabels = linkGroups
      .append('g')
      .attr('class', 'link-label')
      .style('opacity', d => d.isActive !== false ? 1 : 0.5);  // Fade inactive labels

    // Add background for text
    linkLabels.append('rect')
      .attr('fill', '#1a1a1a')
      .attr('opacity', 0.8)
      .attr('rx', 4)
      .attr('ry', 4);

    // Add the text
    linkLabels.append('text')
      .text(d => d.relation)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#ffffff')
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .each(function(this: SVGTextElement) {
        const bbox = this.getBBox();
        const parent = this.parentElement;
        if (parent) {
          d3.select(parent)
            .select('rect')
            .attr('x', bbox.x - 4)
            .attr('y', bbox.y - 2)
            .attr('width', bbox.width + 8)
            .attr('height', bbox.height + 4);
        }
      });

    // Create node groups
    const nodeElements = g.append('g')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, D3Node>('g')
      .data(nodes)
      .join('g')
      .attr('class', 'node-group');

    // Add circles for nodes
    nodeElements.append('circle')
      .attr('r', 20)
      .attr('fill', d => nodeColors[d.type] || '#999')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add node labels
    nodeElements.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('fill', '#fff')
      .style('font-size', '12px');

    // Add click handler for nodes
    nodeElements.on('click', (event, d) => {
      event.stopPropagation();
      const [x, y] = d3.pointer(event, svg.node());
      setSelectedNode(prev => prev?.node.id === d.id ? null : { node: d, x, y });
      setSelectedEdge(null);
    });

    // Add click handler to svg background to clear selection
    svg.on('click', (event) => {
      if (event.target === svg.node()) {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    });

    // Add drag behavior
    const drag = d3.drag<SVGGElement, D3Node>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag as any);

    // Create force simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links)
        .id(d => d.id)
        .distance(200))
      .force('charge', d3.forceManyBody().strength(-1000))
      .force('collide', d3.forceCollide().radius(50))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      linkLabels.attr('transform', d => {
        return `translate(${(d.source.x + d.target.x) / 2},${(d.source.y + d.target.y) / 2})`;
      });

      nodeElements.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Run simulation a bit to get initial positions
    simulation.alpha(1).restart();

    return () => {
      simulation.stop();
    };
  }, [data, nodeTypeFilter, selectedYear]); // Re-render when data, filters, or selected year change

  return (
    <div className="w-full h-full flex flex-col relative bg-black">
      {/* SVG visualization */}
      <svg ref={svgRef} className="w-full h-full absolute inset-0" />
      
      {/* Overlay boxes */}
      <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-4">
        
        
        {/* Evolution Control */}
        <div className="bg-black p-3 rounded-lg border border-gray-800 shadow-lg w-64">
          <h3 className="text-white font-medium text-sm mb-2">Evolution</h3>
          <EvolutionControl 
            minYear={minYear} 
            maxYear={maxYear} 
            onYearChange={setSelectedYear}
          />
        </div>
        
        {/* Node Types Filter */}
        <div className="bg-black p-3 rounded-lg border border-gray-800 shadow-lg w-64">
          <h3 className="text-white font-medium text-sm mb-2">Node Types</h3>
          <div className="flex flex-wrap gap-2">
            {allNodeTypes.map(type => (
              <label key={type} className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  checked={nodeTypeFilter.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNodeTypeFilter(prev => [...prev, type]);
                    } else {
                      setNodeTypeFilter(prev => prev.filter(t => t !== type));
                    }
                  }}
                  className="form-checkbox h-3 w-3 text-blue-600"
                />
                <span className="text-xs text-white">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Stats Box */}
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-800 shadow-lg w-64">
          <h3 className="text-white font-medium text-sm mb-2">Stats</h3>
          <div className="space-y-1">
            <p className="text-xs text-gray-300">Total Nodes: <span className="text-white">{data.nodes.length}</span></p>
            <p className="text-xs text-gray-300">Total Relationships: <span className="text-white">{data.relationships.length}</span></p>
            <p className="text-xs text-gray-300">Filtered Nodes: <span className="text-white">{getFilteredData().nodes.length}</span></p>
            <p className="text-xs text-gray-300">
              Active Relationships: <span className="text-white">
                {selectedYear === null ? 
                  getFilteredData().relationships.length : 
                  getFilteredData().relationships.filter(rel => rel.isActive !== false).length}
              </span>
            </p>
            {selectedYear !== null && (
              <>
                <p className="text-xs text-gray-300">Evolution Year: <span className="text-white">{selectedYear}</span></p>
                <div className="flex items-center text-xs mt-1">
                  <span className="w-3 h-1 bg-white rounded mr-1"></span>
                  <span className="text-white mr-3">Active</span>
                  <span className="w-3 h-1 bg-gray-600 rounded mr-1"></span>
                  <span className="text-gray-400">Inactive</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Node Properties Box */}
      {selectedNode && (
        <div 
          className="absolute bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg"
          style={{
            left: `${selectedNode.x + 20}px`,
            top: `${selectedNode.y}px`,
            maxWidth: '300px',
            zIndex: 1000
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-2">{selectedNode.node.name}</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Type: <span className="text-white">{selectedNode.node.type}</span></p>
            {Object.entries(selectedNode.node.properties || {}).map(([key, value]) => (
              <p key={key} className="text-sm text-gray-400">
                {key}: <span className="text-white">{value as string}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Edge Properties Box */}
      {selectedEdge && (
        <div 
          className="absolute bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg"
          style={{
            left: `${selectedEdge.x + 20}px`,
            top: `${selectedEdge.y}px`,
            maxWidth: '300px',
            zIndex: 1000
          }}
        >
          <h3 className="text-lg font-semibold text-white mb-2">Relationship</h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">Type: <span className="text-white">{selectedEdge.edge.relation}</span></p>
            <p className="text-sm text-gray-400">From: <span className="text-white">{selectedEdge.edge.source.name}</span></p>
            <p className="text-sm text-gray-400">To: <span className="text-white">{selectedEdge.edge.target.name}</span></p>
            <p className="text-sm text-gray-400">Weight: <span className="text-white">{selectedEdge.edge.weightage}</span></p>
            {Object.entries(selectedEdge.edge.properties || {}).map(([key, value]) => (
              <p key={key} className="text-sm text-gray-400">
                {key}: <span className="text-white">{value as string}</span>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 