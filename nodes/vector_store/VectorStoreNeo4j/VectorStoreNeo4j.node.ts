// todo ---> "@langchain/qdrant": "0.1.1",

import * as Neo4jModule  from "@langchain/community/vectorstores/neo4j_vector";
import { IExecuteFunctions, INodeProperties, ISupplyDataFunctions } from "n8n-workflow";

import { createVectorStoreNode } from "./createVectorStoreNode";
import { name } from "../../../common-utils";
//import { Document } from "@langchain/core/documents";
//import { Neo4jCredentials } from "../../../credentials/Neo4jCredentialsApi.credentials";

// console.log(Neo4jModule);


const embeddingField: INodeProperties = {
	displayName: 'Embedding',
	name: 'embedding',
	type: 'string',
	default: 'embedding',
	description: 'The field with the embedding array',
	required: true,
};

const labelField: INodeProperties = {
	displayName: 'Label',
	name: 'label',
	type: 'string',
	default: 'Document',
	description: 'The label of the node to store the embedding',
	placeholder: 'Document',
}

const textField: INodeProperties = {
	displayName: 'Text',
	name: 'text',
	type: 'string',
	default: 'embedding',
	description: 'The field with the text to store',
	placeholder: 'embedding',
}

const indexNameField: INodeProperties = {
	displayName: 'Index Name',
	name: 'indexName',
	type: 'string',
	default: 'vector',
	description: 'The name of the index to use',
	placeholder: 'vector',
}

// TODO - check if correct
// todo - CHECK if more fields are needed
const sharedFields: INodeProperties[] = [
	labelField,
	textField,
	indexNameField,
	// {
	// 	displayName: 'Label name',
	// 	name: 'labelName',
	// 	type: 'string',
	// 	default: 'Document',
	// 	description:
	// 		'The table name to store the vectors in. If table does not exist, it will be created.',
	// },
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


const getNeo4jCredential = async (context: IExecuteFunctions | ISupplyDataFunctions): Promise<Neo4jVectorStoreArgs> => {
	const credentials = await context.getCredentials<Neo4jVectorStoreArgs>(name);
	credentials.url = credentials.url.replace('localhost', '127.0.0.1');
	return credentials;
}

const getNeo4jCommonParameters = async (context: IExecuteFunctions | ISupplyDataFunctions, itemIndex: number): Promise<any> => {

	const credentials = await getNeo4jCredential(context);// context.getCredentials<Neo4jVectorStoreArgs>(name);
	//credentials.url = credentials.url.replace('localhost', '127.0.0.1');
	// return credentials;

	const embeddingFieldName = context.getNodeParameter('embedding', itemIndex, 'embedding') as string;

	const label = context.getNodeParameter('labelName', itemIndex, 'Document') as string;

	const textNodeProperty = context.getNodeParameter('textNodeProperty', itemIndex, 'text') as string;

	const indexName = context.getNodeParameter('indexName', itemIndex, 'vector') as string;

	return {credentials, embeddingFieldName, label, textNodeProperty, indexName};
}

export class Neo4jVectorStoreExtended extends Neo4jModule.Neo4jVectorStore {
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
	async getVectorStoreClient(context, _filter, embeddings, itemIndex): Promise<Neo4jModule.Neo4jVectorStore> {
		// const credentials = await context.getCredentials<{
		// 	url: string;
		// 	username: string;
		// 	password: string;
        //     database: string;// = 'neo4j';
		// }>(name);

		console.log('context..');

		const params = await getNeo4jCommonParameters(context, itemIndex);
		console.log(params.credentials, 'params.credentials');
		// const credentials = await context.getCredentials<Neo4jVectorStoreArgs>(name);

		// const options =
		// (context.getNodeParameter('options', itemIndex) as {
		// 	embeddingDimensions?: number;
		// }) || {};

		// TODO - common
		// credentials.url = credentials.url.replace('localhost', '127.0.0.1');
		// console.log('credentials', credentials);
/* 		const embeddingFieldName = context.getNodeParameter('embedding', itemIndex, '', {
			extractValue: true,
		}) as string; */

		// const driver = Neo4jVectorStoreExtended.prototype._initializeDriver(credentials);


		// const store = await new Neo4jModule.Neo4jVectorStore(embeddings,
		// 	{...params.credentials,
		// 	indexName: params.indexName,//'n8n_index', // optionally customizable via a node parameter
		// 	nodeLabel: params.label,//'Document', // default label
		// 	textNodeProperty: params.textNodeProperty,//'text',
		// 	embeddingNodeProperty: params.embeddingFieldName,
		// 	// TODO
		// 	retrievalQuery: 'RETURN 1',
		// 	//driver: Neo4jVectorStoreExtended.prototype._initializeDriver(params.credentials),
		// 	//embeddingDimension: options.embeddingDimensions ?? 1536,
		// })
		// console.log('store...');


		const store = await Neo4jModule.Neo4jVectorStore.initialize(embeddings,
			{...params.credentials,
			indexName: params.indexName,//'n8n_index', // optionally customizable via a node parameter
			nodeLabel: params.label,//'Document', // default label
			textNodeProperty: params.textNodeProperty,//'text',
			embeddingNodeProperty: params.embeddingFieldName,
			// TODO
			// retrievalQuery: 'RETURN 1',
			//driver: Neo4jVectorStoreExtended.prototype._initializeDriver(params.credentials),
			//embeddingDimension: options.embeddingDimensions ?? 1536,
		})

		
		await store._initializeDriver(params.credentials);

		// store['retrievalQuery'] = 'RETURN 1';
		// store['indexName'] = params.indexName;
		// store['nodeLabel'] = params.label;
		// store['textNodeProperty'] = params.textNodeProperty;
		// //store['username'] = params.credentials.username;
		// //store['password'] = params.credentials.password;
		// store['database'] = params.credentials.database;
		// store['embeddingNodeProperty'] = params.embeddingFieldName;
		// store['embeddingDimension'] = 1536;

		await store['retrievalQuery'];

		// Neo4jVectorStoreExtended.initialize()
		// store.
		console.log('store1...', store['retrievalQuery']);

		//store.asRetriever().sear
		// await console.log('session......', await store['driver']);// = Neo4jVectorStoreExtended.prototype._initializeDriver(params.credentials).session({
		return await store;
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


