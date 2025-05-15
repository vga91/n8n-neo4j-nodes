import type { Embeddings } from '@langchain/core/embeddings';
// import type { VectorStore } from '@langchain/core/vectorstores';
import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';


import type { VectorStoreNodeConstructorArgs } from '../vector_store/VectorStoreNeo4j/types';
import { getMetadataFiltersValues, logAiEvent } from '../utils/utils';
import { Neo4jVectorStore } from '@langchain/community/vectorstores/neo4j_vector';
import { Neo4jVectorStoreExtended } from '../vector_store/VectorStoreNeo4j/VectorStoreNeo4j.node';

/**
 * Handles the 'load' operation mode
 * Searches the vector store for documents similar to a query
 */
export async function handleLoadOperation(
	context: IExecuteFunctions,
	args: VectorStoreNodeConstructorArgs<Neo4jVectorStore>,
	embeddings: Embeddings,
	itemIndex: number,
): Promise<INodeExecutionData[]> {
	console.log('Load operation started');
	const filter = await getMetadataFiltersValues(context, itemIndex);
	console.log('Filter:', filter);
	const vectorStore = await args.getVectorStoreClient(
		context,
		// We'll pass filter to similaritySearchVectorWithScore instead of getVectorStoreClient
		undefined,
		embeddings,
		itemIndex,
	);

	try {
		// Get the search parameters from the node
		const prompt = context.getNodeParameter('prompt', itemIndex) as string;
		const topK = context.getNodeParameter('topK', itemIndex, 4) as number;
		const includeDocumentMetadata = context.getNodeParameter(
			'includeDocumentMetadata',
			itemIndex,
			true,
		) as boolean;

		// Embed the prompt to prepare for vector similarity search
		const embeddedPrompt = await embeddings.embedQuery(prompt);

		console.log('Load operation started1', embeddedPrompt);

		console.log('vectorStore.driver', (vectorStore as unknown as Neo4jVectorStoreExtended));
		// Get the most similar documents to the embedded prompt
		//const docs = await vectorStore.similaritySearchVectorWithScore(embeddedPrompt, topK, filter ? JSON.stringify(filter) : '{}');
		const docs = await vectorStore.similaritySearchWithScore(prompt, topK);

		console.log('Retrieved documents:', docs);

		// Format the documents for the output
		const serializedDocs = docs.map(([doc, score]) => {
			const document = {
				pageContent: doc.pageContent,
				...(includeDocumentMetadata ? { metadata: doc.metadata } : {}),
			};

			return {
				json: { document, score },
				pairedItem: {
					item: itemIndex,
				},
			};
		});

		console.log('Serialized documents:', serializedDocs);

		// Log the AI event for analytics
		logAiEvent(context, 'ai-vector-store-searched', { query: prompt });

		return serializedDocs;
	} finally {
		// Release the vector store client if a release method was provided
		args.releaseVectorStoreClient?.(vectorStore);
	}
}
