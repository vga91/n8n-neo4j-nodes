// todo ---> "@langchain/qdrant": "0.1.1",

import * as Neo4jModule  from "@langchain/community/vectorstores/neo4j_vector";
import { INodeProperties } from "n8n-workflow";

import { createVectorStoreNode } from "./createVectorStoreNode";
import { name } from "../../../common-utils";
//import { Document } from "@langchain/core/documents";
//import { Neo4jCredentials } from "../../../credentials/Neo4jCredentialsApi.credentials";

console.log(Neo4jModule);


const embeddingField: INodeProperties = {
	displayName: 'Embedding',
	name: 'embedding',
	type: 'string',
	default: 'embedding',
	description: 'The field with the embedding array',
	required: true,
};

// TODO - check if correct
// todo - CHECK if more fields are needed
const sharedFields: INodeProperties[] = [
	{
		displayName: 'Label name',
		name: 'tableName',
		type: 'string',
		default: 'n8n_vectors',
		description:
			'The table name to store the vectors in. If table does not exist, it will be created.',
	},
	embeddingField
];

const embeddingDimensions: INodeProperties = {
	displayName: 'Embedding Dimensions',
	name: 'embeddingDimensions',
	type: 'number',
	default: 1536,
	description: 'The dimension of the embedding',
};

// TODO - check if correct
// todo - CHECK if more fields are needed
const insertFields: INodeProperties[] = [
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		options: [
			embeddingDimensions,
			{
				displayName: 'Clear Collection',
				name: 'clearCollection',
				type: 'boolean',
				default: false,
				description: 'Whether to clear the collection before inserting new data',
			},
		],
	},
];

class Neo4jVectorStoreExtended extends Neo4jModule.Neo4jVectorStore {
     // Define the serializable keys
//   lc_serializable_keys = [
//     'url',
//     'username',
//     'password',
//     'database',
//     'indexName',
//     'nodeLabel',
//     'textNodeProperty',
//     'embeddingNodeProperty',
//   ];
}


// TODO - move in the common-utils
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
	searchType?: Neo4jModule.SearchType;
	indexType?: Neo4jModule.IndexType;
	retrievalQuery?: string;
	nodeLabel?: string;
	createIdIndex?: boolean;
}

export class VectorStoreNeo4j extends createVectorStoreNode<Neo4jVectorStoreExtended>({
	meta: {
		displayName: 'Neo4j Vector Store',
		name: 'vectorStoreNeo4j',
		description: 'Work with your data in Neo4j Vector Store',
		icon: 'file:neo4j-logo.svg',
		docsUrl:
			// TODO
			'https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/neo4j',
		credentials: [
			{
				name: name,
				required: true,
			},
		],
		operationModes: ['load', 'insert', 'retrieve', 'retrieve-as-tool'],
	},
	sharedFields,
	insertFields,
	methods: {
		listSearch: {
			// Optional: implement search listing support if needed
		},
	},
	async getVectorStoreClient(context, _filter, embeddings, itemIndex): Promise<Neo4jVectorStoreExtended> {
		// const credentials = await context.getCredentials<{
		// 	url: string;
		// 	username: string;
		// 	password: string;
        //     database: string;// = 'neo4j';
		// }>(name);

		console.log('context..');
		const credentials = await context.getCredentials<Neo4jVectorStoreArgs>(name);

		// const options =
		// (context.getNodeParameter('options', itemIndex) as {
		// 	embeddingDimensions?: number;
		// }) || {};

		// TODO - common
		credentials.url = credentials.url.replace('localhost', '127.0.0.1');
		console.log('credentials', credentials);
		const embeddingFieldName = context.getNodeParameter('embedding', itemIndex, '', {
			extractValue: true,
		}) as string;

		// const driver = Neo4jVectorStoreExtended.prototype._initializeDriver(credentials);

		return new Neo4jVectorStoreExtended(embeddings,
			{...credentials,
			indexName: 'n8n_index', // optionally customizable via a node parameter
			nodeLabel: 'Document', // default label
			textNodeProperty: 'text',
			embeddingNodeProperty: embeddingFieldName,
			//embeddingDimension: options.embeddingDimensions ?? 1536,
		});
	},

	async populateVectorStore(context, embeddings, documents, itemIndex): Promise<void> {
		// TODO - context
		console.log('context1...');
		//console.log('embeddings', embeddings);
		
		// const index = context.getNodeParameter('pineconeIndex', itemIndex, '', {
		// 	extractValue: true,
		// }) as string;

		const embeddingFieldName = context.getNodeParameter('embedding', itemIndex, '', {
			extractValue: true,
		}) as string;

		const credentials = await context.getCredentials<{
			url: string;
			username: string;
			password: string;
			database: string;// = 'neo4j';
		}>(name);

		credentials.url = credentials.url.replace('localhost', '127.0.0.1');
		console.log('credentials', credentials);
		console.log('documents', documents);
		

		// const driver = Neo4jVectorStore.prototype._initializeDriver(credentials);

		// todo - i metadati hanno problemi!!!
		// todo - i metadati hanno problemi!!!
		// todo - i metadati hanno problemi!!!
		// todo - i metadati hanno problemi!!!
		// todo - i metadati hanno problemi!!!
		await Neo4jVectorStoreExtended.fromDocuments(documents.map((doc) => {return {pageContent: doc.pageContent, metadata: {}}}), 
			embeddings, 
			{...credentials,
			indexName: 'index_name', // optionally customizable via a node parameter
			nodeLabel: 'Document',
			textNodeProperty: 'text',
			embeddingNodeProperty: embeddingFieldName,
			// embeddingDimension: 1536,
		});

		await console.log('finish');
	},
}) {}


