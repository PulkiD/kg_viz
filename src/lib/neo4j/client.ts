import neo4j, { Driver } from 'neo4j-driver';

let driver: Driver | null = null;

export const initializeNeo4j = () => {
    try {
        if (!process.env.NEO4J_URI || !process.env.NEO4J_USER || !process.env.NEO4J_PASSWORD) {
            throw new Error('Neo4j environment variables are not set');
        }

        driver = neo4j.driver(
            process.env.NEO4J_URI,
            neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
        );

        return driver;
    } catch (error) {
        console.error('Error initializing Neo4j:', error);
        throw error;
    }
};

export const getDriver = () => {
    if (!driver) {
        return initializeNeo4j();
    }
    return driver;
};

export const closeDriver = async () => {
    if (driver) {
        await driver.close();
        driver = null;
    }
}; 