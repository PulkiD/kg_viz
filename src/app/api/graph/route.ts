import { NextResponse } from 'next/server';
import type { GraphResponse } from '@/types/graph';
import sampleData from '@/lib/sample_kg_output.json';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        
        if (!query) {
            return NextResponse.json(
                { success: false, error: 'Query is required' },
                { status: 400 }
            );
        }

        // For development, return sample data regardless of the query
        const response: GraphResponse = {
            success: true,
            data: sampleData
        };

        return NextResponse.json(response);

        /* Commented out Neo4j connection code for development
        const driver = getDriver();
        const session = driver.session();

        try {
            const result = await session.run(query, parameters);
            
            // Transform Neo4j results to our GraphData format
            const nodes = new Map();
            const relationships = new Map();

            result.records.forEach(record => {
                record.forEach(value => {
                    if (value.constructor.name === 'Node') {
                        const node = value;
                        nodes.set(node.identity.toString(), {
                            id: node.identity.toString(),
                            type: node.labels[0],
                            name: node.properties.name,
                            ...node.properties
                        });
                    } else if (value.constructor.name === 'Relationship') {
                        const rel = value;
                        relationships.set(rel.identity.toString(), {
                            id: rel.identity.toString(),
                            source: rel.start.toString(),
                            target: rel.end.toString(),
                            relation: rel.type,
                            weightage: rel.properties.weightage || 1,
                            evolution: rel.properties.evolution || []
                        });
                    }
                });
            });

            const response: GraphResponse = {
                success: true,
                data: {
                    nodes: Array.from(nodes.values()),
                    relationships: Array.from(relationships.values())
                }
            };

            return NextResponse.json(response);
        } finally {
            await session.close();
        }
        */
    } catch (error) {
        console.error('Error executing graph query:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
} 