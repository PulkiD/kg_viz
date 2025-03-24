import { SimulationNodeDatum } from 'd3';

export interface Evolution {
    [year: string]: number;
}

export interface NodeProperties {
    id: string;
    type: string;
    name: string;
    description?: string;
    url?: string;
    score?: number;
}

export interface Node extends SimulationNodeDatum {
    id: string;
    name: string;
    type: string;
    properties?: Record<string, string | number | boolean>;
}

export interface Relationship {
    source: string;
    target: string;
    relation: string;
    weightage: number;
    properties?: Record<string, string | number | boolean>;
    evolution?: Evolution;
    isActive?: boolean;
}

export interface GraphData {
    nodes: Node[];
    relationships: Relationship[];
}

export interface GraphResponse {
    success: boolean;
    data?: GraphData;
    error?: string;
}

export interface GraphQuery {
    query: string;
    parameters?: Record<string, string | number | boolean | null>;
} 