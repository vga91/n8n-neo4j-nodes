import { IExecuteFunctions, ISupplyDataFunctions } from "n8n-workflow";
import { IndexType, SearchType } from "@langchain/community/vectorstores/neo4j_vector";

export const name = 'neo4j';

export interface Neo4jVectorStoreArgs {
    url: string;
    username: string;
    password: string;
    database?: string;
    preDeleteCollection?: boolean;
    textNodeProperty?: string;
    textNodeProperties?: string[];
    embeddingNodeProperty?: string;
    keywordIndexName?: string;
    indexName?: string;
    searchType?: SearchType;
    indexType?: IndexType;
    retrievalQuery?: string;
    nodeLabel?: string;
    createIdIndex?: boolean;
}

/**
 * Replace if present "localhost" with "127.0.0.1" since with "localhost" we have the following error:
 * Failed to connect to server. Please ensure that your database is listening on the correct host and port and that you have compatible encryption settings both on Neo4j server and driver. 
 * Note that the default encryption setting has changed in Neo4j 4.0.
 * Caused by: connect ECONNREFUSED ::1:7687',
 */
export const getNeo4jCredentials = async (context: IExecuteFunctions | ISupplyDataFunctions): Promise<Neo4jVectorStoreArgs> => {
    const credentials = await context.getCredentials<Neo4jVectorStoreArgs>(name);
    credentials.url = credentials.url.replace('localhost', '127.0.0.1');
    return credentials;
}