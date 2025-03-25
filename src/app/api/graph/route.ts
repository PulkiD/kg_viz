import { NextResponse } from 'next/server';
import type { GraphResponse } from '@/types/graph';

export async function POST(request: Request) {
    try {
        const { query } = await request.json();
        
        if (!query) {
            return NextResponse.json(
                { success: false, error: 'Query is required' },
                { status: 400 }
            );
        }

        // Step 1: Send query to FastAPI backend
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
            throw new Error('Backend URL not configured');
        }

        const queryResponse = await fetch(`${backendUrl}/api/v1/query/read`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!queryResponse.ok) {
            throw new Error(`Backend query failed: ${queryResponse.statusText}`);
        }

        const queryResult = await queryResponse.json();

        // Step 2: Transform the results using the transformation API
        const transformResponse = await fetch(`${backendUrl}/api/v1/transform/pxlsviz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input_json: queryResult.results,
                parameters: {
                    source_node_tag: "start",
                    target_node_tag: "end",
                    relationship_type_tag: "type"
                }
            }),
        });

        if (!transformResponse.ok) {
            throw new Error(`Transformation failed: ${transformResponse.statusText}`);
        }

        const transformedData = await transformResponse.json();

        const response: GraphResponse = {
            success: true,
            data: transformedData
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error processing graph query:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error instanceof Error ? error.message : 'Internal server error' 
            },
            { status: 500 }
        );
    }
} 