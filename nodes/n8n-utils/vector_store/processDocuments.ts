import type { Document } from '@langchain/core/documents';
import type { INodeExecutionData } from 'n8n-workflow';
import { N8nBinaryLoader, N8nJsonLoader } from '../utils';


export async function processDocument(
	documentInput: N8nJsonLoader | N8nBinaryLoader | Array<Document<Record<string, unknown>>>,
	inputItem: INodeExecutionData,
	itemIndex: number,
) {
	let processedDocuments: Document[];	

	try {
		const docInputLoader = documentInput as N8nJsonLoader | N8nBinaryLoader;
		processedDocuments = await docInputLoader.processItem(inputItem, itemIndex);
	} catch (error) {
		const docInputArray = documentInput as Array<Document<Record<string, unknown>>>;
		processedDocuments = docInputArray
	}

	const serializedDocuments = processedDocuments.map(({ metadata, pageContent }) => ({
		json: { metadata, pageContent },
		pairedItem: {
			item: itemIndex,
		},
	}));

	return {
		processedDocuments, 
		serializedDocuments,
	};
}
