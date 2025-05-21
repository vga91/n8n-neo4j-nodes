import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";

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
		operationModes: ['load', 'insert', 'update', 'retrieve', 'retrieve-as-tool'],
	},
	sharedFields,
	insertFields,
	loadFields,
	retrieveFields: loadFields,
	updateFields: loadFields,

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
			{ ...params, retrievalQuery }
		)
		return await store;
	},

	async populateVectorStore(context, embeddings, documents, itemIndex): Promise<void> {
		const params = await getNeo4jCommonParameters(context, itemIndex);

		const documentsSerialized = documents.map((doc) => {
			const meta = doc.metadata || {};
			const metaSerialized = Object.fromEntries(
				Object.entries(meta).map(([key, value]) => {
					if (value instanceof String || value instanceof Number || value instanceof Boolean) {
						return [key, value];
					}
					return [key, JSON.stringify(value)];
				}));
			return { ...doc, metadata: metaSerialized };
		});

		await Neo4jVectorStore.fromDocuments(documentsSerialized,
			embeddings,
			params
		);
	},
}) { }


