import type { Document } from '@langchain/core/documents';
import type { INodeExecutionData } from 'n8n-workflow';
import { N8nBinaryLoader, N8nJsonLoader } from '../../utils/utils';


// export async function processDocuments(
// 	documentInput: N8nJsonLoader | N8nBinaryLoader | Array<Document<Record<string, unknown>>>,
// 	inputItems: INodeExecutionData[],
// ) {
// 	let processedDocuments: Document[];

// 	if (documentInput instanceof N8nJsonLoader || documentInput instanceof N8nBinaryLoader) {
// 		processedDocuments = await documentInput.processAll(inputItems);
// 	} else {
// 		console.log('documentInput1..', typeof documentInput);
// 		console.log('documentInput type..', documentInput.forEach((doc) => console.log(typeof doc)));
// 		processedDocuments = documentInput;
// 	}

// 	const serializedDocuments = processedDocuments.map(({ metadata, pageContent }) => ({
// 		json: { metadata, pageContent },
// 	}));

// 	return {
// 		processedDocuments,
// 		serializedDocuments,
// 	};
// }
export async function processDocument(
	documentInput: N8nJsonLoader | N8nBinaryLoader,// | Array<Document<Record<string, unknown>>>,
	inputItem: INodeExecutionData,
	itemIndex: number,
) {
	// TODO - decomment this when we have the N8nJsonLoader and N8nBinaryLoader implemented

	let processedDocuments: Document[];

	// todo - fare un try -catch invece di instanceof e rimettere Array<Document<Record<string, unknown>>>,
	// todo - fare un try -catch invece di instanceof e rimettere Array<Document<Record<string, unknown>>>,
	// todo - fare un try -catch invece di instanceof e rimettere Array<Document<Record<string, unknown>>>,
	// todo - fare un try -catch invece di instanceof e rimettere Array<Document<Record<string, unknown>>>,
	// todo - fare un try -catch invece di instanceof e rimettere Array<Document<Record<string, unknown>>>,
	// todo - fare un try -catch invece di instanceof e rimettere Array<Document<Record<string, unknown>>>,
	

	// if (documentInput instanceof N8nJsonLoader || documentInput instanceof N8nBinaryLoader) {
		processedDocuments = await documentInput.processItem(inputItem, itemIndex);
		// console.log('processedDocuments..', processedDocuments);
	// } else {
		// console.log('documentInput2..', typeof documentInput);
		// processedDocuments = documentInput;
	// }

	console.log('processedDocuments', typeof processedDocuments);


	const documents = [
		{ metadata: { source: "file1" }, pageContent: "Text from doc 1" },
		{ metadata: { source: "file2" }, pageContent: "Text from doc 2" },
	  ];
	// TODO - restore with processedDocuments
	const serializedDocuments = documents.map(({ metadata, pageContent }) => ({
		json: { metadata, pageContent },
		pairedItem: {
			item: itemIndex,
		},
	}));

	console.log('serializedDocuments PD', typeof serializedDocuments);

	return {
		processedDocuments, 
		serializedDocuments,
	};
}
