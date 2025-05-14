// todo ---> "@langchain/qdrant": "0.1.1",

import * as Neo4jModule  from "@langchain/community/vectorstores/neo4j_vector";
import { INodeProperties } from "n8n-workflow";

import { createVectorStoreNode } from "./createVectorStoreNode";

console.log(Neo4jModule);

// TODO - check if correct
// todo - CHECK if more fields are needed
const sharedFields: INodeProperties[] = [
	{
		displayName: 'Table Name',
		name: 'tableName',
		type: 'string',
		default: 'n8n_vectors',
		description:
			'The table name to store the vectors in. If table does not exist, it will be created.',
	},
];

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

export class VectorStoreNeo4j extends createVectorStoreNode<Neo4jVectorStoreExtended>({
	meta: {
		displayName: 'Neo4j Vector Store',
		name: 'vectorStoreNeo4j',
		description: 'Work with your data in Neo4j Vector Store',
		icon: { light: 'file:neo4j-icon-black.svg', dark: 'file:neo4j-icon-white.svg' },
		docsUrl:
			'https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/neo4j',
		credentials: [
			{
				name: 'neo4jApi',
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
		const credentials = await context.getCredentials<{
			url: string;
			username: string;
			password: string;
            database: string;// = 'neo4j';
		}>('neo4jApi');

		// const driver = Neo4jVectorStoreExtended.prototype._initializeDriver(credentials);

		return new Neo4jVectorStoreExtended(embeddings,
			{...credentials,
			indexName: 'n8n_index', // optionally customizable via a node parameter
			nodeLabel: 'Document', // default label
			textNodeProperty: 'text',
		});
	},

	async populateVectorStore(context, embeddings, documents, itemIndex): Promise<void> {
		// TODO - context
		
		const index = context.getNodeParameter('pineconeIndex', itemIndex, '', {
			extractValue: true,
		}) as string;
		const credentials = await context.getCredentials<{
			url: string;
			username: string;
			password: string;
			database: string;// = 'neo4j';
		}>('neo4jApi');

		// const driver = Neo4jVectorStore.prototype._initializeDriver(credentials);

		await Neo4jVectorStoreExtended.fromDocuments(documents, 
			embeddings, 
			{...credentials,
			indexName: index,
			nodeLabel: 'Document',
			textNodeProperty: 'text',
		});
	},
}) {}


