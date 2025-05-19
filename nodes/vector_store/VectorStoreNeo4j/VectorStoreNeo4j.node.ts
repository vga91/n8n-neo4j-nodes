import { Neo4jVectorStore }  from "@langchain/community/vectorstores/neo4j_vector";

import { createVectorStoreNode } from "../../n8n-utils/vector_store/createVectorStoreNode";
import { name } from "../../../common-utils";
import { getNeo4jCommonParameters, insertFields, loadFields, retievalQueryDefault, retrievalQueryName, sharedFields } from "./vector-utils";



export class VectorStoreNeo4j extends createVectorStoreNode<Neo4jVectorStore>({
	meta: {
		displayName: 'Neo4j Vector Store',
		name: 'vectorStoreNeo4j',
		description: 'Work with your data in Neo4j Vector Store',
		icon: 'file:neo4j-logo.svg',
		docsUrl:
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
	loadFields,
	retrieveFields: sharedFields,
	// TODO --> retrieveAsToolFields: sharedFields,
	updateFields: insertFields,

	methods: {
		listSearch: {
			// Optional: implement search listing support if needed
		},
	},
	async getVectorStoreClient(context, _filter, embeddings, itemIndex): Promise<Neo4jVectorStore> {
		console.log('init getVectorStoreClient');

		const params = await getNeo4jCommonParameters(context, itemIndex);

		const retrievalQuery = context.getNodeParameter(retrievalQueryName, itemIndex, retievalQueryDefault) as string;

		const store = await Neo4jVectorStore.initialize(embeddings,
			{...params, retrievalQuery}
		)



		
		// await store._initializeDriver(params.credentials);

		// console.log('retrievalQuery...', store['retrievalQuery']);
	
		// store['indexName'] = params.indexName;
		// store['nodeLabel'] = params.label;
		// store['textNodeProperty'] = params.textNodeProperty;
		// //store['username'] = params.credentials.username;
		// //store['password'] = params.credentials.password;
		// store['database'] = params.credentials.database;
		// store['embeddingNodeProperty'] = params.embeddingFieldName;
		// store['embeddingDimension'] = 1536;

		// await store['retrievalQuery'];

		// Neo4jVectorStoreExtended.initialize()
		// store.
		// console.log('store1...', store['retrievalQuery']);

		//store.asRetriever().sear
		// await console.log('session......', await store['driver']);// = Neo4jVectorStoreExtended.prototype._initializeDriver(params.credentials).session({
		return await store;
	},

	async populateVectorStore(context, embeddings, documents, itemIndex): Promise<void> {
		console.log('init populateVectorStore');
		//console.log('embeddings', embeddings);
		
		// const index = context.getNodeParameter('pineconeIndex', itemIndex, '', {
		// 	extractValue: true,
		// }) as string;

		// const embeddingFieldName = context.getNodeParameter('embedding', itemIndex, '', {
		// 	extractValue: true,
		// }) as string;

		// const credentials = await context.getCredentials<{
		// 	url: string;
		// 	username: string;
		// 	password: string;
		// 	database: string;// = 'neo4j';
		// }>(name);

		// credentials.url = credentials.url.replace('localhost', '127.0.0.1');
		

		const params = await getNeo4jCommonParameters(context, itemIndex);


		console.log('documents', documents);
		const documentsSerialized = documents.map((doc) => {
			const meta = doc.metadata || {};
			const metaSerialized = Object.fromEntries(
				Object.entries(meta).map(([key, value]) => {
					if (value instanceof String || value instanceof Number || value instanceof Boolean) {
						return [key, value];
					}
					return [key, JSON.stringify(value)];
				}));
			return {...doc, metadata: metaSerialized};
		});


		//console.log('documentsSerialized', documentsSerialized);
		console.log('params', params);

		// console.log('documents loc', documents.map((doc) => {
		// 	if (doc instanceof String || doc instanceof Number || doc instanceof Boolean) {
		// 		return doc;
		// 	}
		// 	// if (typeof doc === 'string') {
		// 	// const metadata = doc.metadata.loc as { lines: any } ;
		// 	// console.log('metadata', metadata instanceof Map);
		// 	// console.log('metadata', typeof metadata);
			
		// 	return JSON.stringify(doc);
		// }));

		// await Neo4jVectorStoreExtended.fromDocuments(documents.map((doc) => {return {pageContent: doc.pageContent, metadata: {}}}), 
		await Neo4jVectorStore.fromDocuments(documentsSerialized, 
			embeddings, 
			params
			// {...params.credentials,
			// indexName: params.indexName,//'index_name', // optionally customizable via a node parameter
			// nodeLabel: params.label,//'Document',
			// textNodeProperty: params.textNodeProperty,//'text',
			// embeddingNodeProperty: params.embeddingFieldName,
			// // embeddingDimension: 1536,
		);

		await console.log('finish');
	},
}) {}


