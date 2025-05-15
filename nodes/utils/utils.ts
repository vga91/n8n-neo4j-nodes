import { AiEvent, BINARY_ENCODING, IBinaryData, IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodePropertyOptions, ISupplyDataFunctions, IWebhookFunctions, jsonStringify, NodeConnectionType } from 'n8n-workflow';
//import { DEFAULT_OPERATION_MODES, OPERATION_MODE_DESCRIPTIONS } from './constants';
//import type { NodeOperationMode, VectorStoreNodeConstructorArgs } from './types';
import type { VectorStore } from '@langchain/core/vectorstores';
import { NodeOperationMode, VectorStoreNodeConstructorArgs } from '../vector_store/VectorStoreNeo4j/types';
import type { TextSplitter } from '@langchain/textsplitters';
import { Document } from '@langchain/core/documents';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { NodeOperationError } from 'n8n-workflow';

import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { createWriteStream } from 'fs';
import { file as tmpFile, type DirectoryResult } from 'tmp-promise';
import { pipeline } from 'stream/promises';

// helpers
export function getSessionId(
	ctx: ISupplyDataFunctions | IWebhookFunctions,
	itemIndex: number,
	selectorKey = 'sessionIdType',
	autoSelect = 'fromInput',
	customKey = 'sessionKey',
) {
	// TODO - restore 

	// let sessionId = '';
	// const selectorType = ctx.getNodeParameter(selectorKey, itemIndex) as string;

	// if (selectorType === autoSelect) {
	// 	// If memory node is used in webhook like node(like chat trigger node), it doesn't have access to evaluateExpression
	// 	// so we try to extract sessionId from the bodyData
	// 	if ('getBodyData' in ctx) {
	// 		const bodyData = ctx.getBodyData() ?? {};
	// 		sessionId = bodyData.sessionId as string;
	// 	} else {
	// 		sessionId = ctx.evaluateExpression('{{ $json.sessionId }}', itemIndex) as string;
	// 	}

	// 	if (sessionId === '' || sessionId === undefined) {
	// 		throw new NodeOperationError(ctx.getNode(), 'No session ID found', {
	// 			description:
	// 				"Expected to find the session ID in an input field called 'sessionId' (this is what the chat trigger node outputs). To use something else, change the 'Session ID' parameter",
	// 			itemIndex,
	// 		});
	// 	}
	// } else {
	// 	sessionId = ctx.getNodeParameter(customKey, itemIndex, '') as string;
	// 	if (sessionId === '' || sessionId === undefined) {
	// 		throw new NodeOperationError(ctx.getNode(), 'Key parameter is empty', {
	// 			description:
	// 				"Provide a key to use as session ID in the 'Key' parameter or use the 'Connected Chat Trigger Node' option to use the session ID from your Chat Trigger",
	// 			itemIndex,
	// 		});
	// 	}
	// }

	return 'sessionId';
}

export function logAiEvent(
	executeFunctions: IExecuteFunctions | ISupplyDataFunctions,
	event: AiEvent,
	data?: IDataObject,
) {
	try {
		executeFunctions.logAiEvent(event, data ? jsonStringify(data) : undefined);
	} catch (error) {
		executeFunctions.logger.debug(`Error logging AI event: ${event}`);
	}
}

export function getMetadataFiltersValues(
	ctx: IExecuteFunctions | ISupplyDataFunctions,
	itemIndex: number,
): Record<string, never> | undefined {
	const options = ctx.getNodeParameter('options', itemIndex, {});

	if (options.metadata) {
		const { metadataValues: metadata } = options.metadata as {
			metadataValues: Array<{
				name: string;
				value: string;
			}>;
		};
		if (metadata.length > 0) {
			return metadata.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
		}
	}

	if (options.searchFilterJson) {
		return ctx.getNodeParameter('options.searchFilterJson', itemIndex, '', {
			ensureType: 'object',
		}) as Record<string, never>;
	}

	return undefined;
}

// N8nJsonLoader
export class N8nJsonLoader {
	constructor(
		private context: IExecuteFunctions | ISupplyDataFunctions,
		private optionsPrefix = '',
		private textSplitter?: TextSplitter,
	) {}

	async processAll(items?: INodeExecutionData[]): Promise<Document[]> {
		const docs: Document[] = [];

		if (!items) return [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const processedDocuments = await this.processItem(items[itemIndex], itemIndex);

			docs.push(...processedDocuments);
		}

		return docs;
	}

	async processItem(item: INodeExecutionData, itemIndex: number): Promise<Document[]> {
		const mode = this.context.getNodeParameter('jsonMode', itemIndex, 'allInputData') as
			| 'allInputData'
			| 'expressionData';

		const pointers = this.context.getNodeParameter(
			`${this.optionsPrefix}pointers`,
			itemIndex,
			'',
		) as string;
		const pointersArray = pointers.split(',').map((pointer) => pointer.trim());
		const metadata = getMetadataFiltersValues(this.context, itemIndex) ?? [];

		if (!item) return [];

		let documentLoader: JSONLoader | TextLoader | null = null;

		if (mode === 'allInputData') {
			const itemString = JSON.stringify(item.json);
			const itemBlob = new Blob([itemString], { type: 'application/json' });
			documentLoader = new JSONLoader(itemBlob, pointersArray);
		}

		if (mode === 'expressionData') {
			const dataString = this.context.getNodeParameter('jsonData', itemIndex) as string | object;
			if (typeof dataString === 'object') {
				const itemBlob = new Blob([JSON.stringify(dataString)], { type: 'application/json' });
				documentLoader = new JSONLoader(itemBlob, pointersArray);
			}

			if (typeof dataString === 'string') {
				const itemBlob = new Blob([dataString], { type: 'text/plain' });
				documentLoader = new TextLoader(itemBlob);
			}
		}

		if (documentLoader === null) {
			// This should never happen
			throw new NodeOperationError(this.context.getNode(), 'Document loader is not initialized');
		}

		const docs = this.textSplitter
			? await this.textSplitter.splitDocuments(await documentLoader.load())
			: await documentLoader.load();

		if (metadata) {
			docs.forEach((doc) => {
				doc.metadata = {
					...doc.metadata,
					...metadata,
				};
			});
		}
		return docs;
	}
}


// N8nBinaryLoader

const SUPPORTED_MIME_TYPES = {
	auto: ['*/*'],
	pdfLoader: ['application/pdf'],
	csvLoader: ['text/csv'],
	epubLoader: ['application/epub+zip'],
	docxLoader: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
	textLoader: ['text/plain', 'text/mdx', 'text/md'],
	jsonLoader: ['application/json'],
};

export class N8nBinaryLoader {
	constructor(
		private context: IExecuteFunctions | ISupplyDataFunctions,
		private optionsPrefix = '',
		private binaryDataKey = '',
		private textSplitter?: TextSplitter,
	) {}

	async processAll(items?: INodeExecutionData[]): Promise<Document[]> {
		const docs: Document[] = [];

		if (!items) return [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const processedDocuments = await this.processItem(items[itemIndex], itemIndex);

			docs.push(...processedDocuments);
		}

		return docs;
	}

	private async validateMimeType(
		mimeType: string,
		selectedLoader: keyof typeof SUPPORTED_MIME_TYPES,
	): Promise<void> {
		// Check if loader matches the mime-type of the data
		if (selectedLoader !== 'auto' && !SUPPORTED_MIME_TYPES[selectedLoader].includes(mimeType)) {
			const neededLoader = Object.keys(SUPPORTED_MIME_TYPES).find((loader) =>
				SUPPORTED_MIME_TYPES[loader as keyof typeof SUPPORTED_MIME_TYPES].includes(mimeType),
			);

			throw new NodeOperationError(
				this.context.getNode(),
				`Mime type doesn't match selected loader. Please select under "Loader Type": ${neededLoader}`,
			);
		}

		if (!Object.values(SUPPORTED_MIME_TYPES).flat().includes(mimeType)) {
			throw new NodeOperationError(this.context.getNode(), `Unsupported mime type: ${mimeType}`);
		}

		if (
			!SUPPORTED_MIME_TYPES[selectedLoader].includes(mimeType) &&
			selectedLoader !== 'textLoader' &&
			selectedLoader !== 'auto'
		) {
			throw new NodeOperationError(
				this.context.getNode(),
				`Unsupported mime type: ${mimeType} for selected loader: ${selectedLoader}`,
			);
		}
	}

	private async getFilePathOrBlob(
		binaryData: IBinaryData,
		mimeType: string,
	): Promise<string | Blob> {
		if (binaryData.id) {
			const binaryBuffer = await this.context.helpers.binaryToBuffer(
				await this.context.helpers.getBinaryStream(binaryData.id),
			);
			return new Blob([binaryBuffer], {
				type: mimeType,
			});
		} else {
			return new Blob([Buffer.from(binaryData.data, BINARY_ENCODING)], {
				type: mimeType,
			});
		}
	}

	private async getLoader(
		mimeType: string,
		filePathOrBlob: string | Blob,
		itemIndex: number,
	): Promise<PDFLoader | CSVLoader | EPubLoader | DocxLoader | TextLoader | JSONLoader> {
		switch (mimeType) {
			case 'application/pdf':
				const splitPages = this.context.getNodeParameter(
					`${this.optionsPrefix}splitPages`,
					itemIndex,
					false,
				) as boolean;
				return new PDFLoader(filePathOrBlob, { splitPages });
			case 'text/csv':
				const column = this.context.getNodeParameter(
					`${this.optionsPrefix}column`,
					itemIndex,
					null,
				) as string;
				const separator = this.context.getNodeParameter(
					`${this.optionsPrefix}separator`,
					itemIndex,
					',',
				) as string;
				return new CSVLoader(filePathOrBlob, { column: column ?? undefined, separator });
			case 'application/epub+zip':
				// EPubLoader currently does not accept Blobs https://github.com/langchain-ai/langchainjs/issues/1623
				let filePath: string;
				if (filePathOrBlob instanceof Blob) {
					const tmpFileData = await tmpFile({ prefix: 'epub-loader-' });
					const bufferData = await filePathOrBlob.arrayBuffer();
					await pipeline([new Uint8Array(bufferData)], createWriteStream(tmpFileData.path));
					return new EPubLoader(tmpFileData.path);
				} else {
					filePath = filePathOrBlob;
				}
				return new EPubLoader(filePath);
			case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
				return new DocxLoader(filePathOrBlob);
			case 'text/plain':
				return new TextLoader(filePathOrBlob);
			case 'application/json':
				const pointers = this.context.getNodeParameter(
					`${this.optionsPrefix}pointers`,
					itemIndex,
					'',
				) as string;
				const pointersArray = pointers.split(',').map((pointer) => pointer.trim());
				return new JSONLoader(filePathOrBlob, pointersArray);
			default:
				return new TextLoader(filePathOrBlob);
		}
	}

	private async loadDocuments(
		loader: PDFLoader | CSVLoader | EPubLoader | DocxLoader | TextLoader | JSONLoader,
	): Promise<Document[]> {
		return this.textSplitter
			? await this.textSplitter.splitDocuments(await loader.load())
			: await loader.load();
	}

	private async cleanupTmpFileIfNeeded(
		cleanupTmpFile: DirectoryResult['cleanup'] | undefined,
	): Promise<void> {
		if (cleanupTmpFile) {
			await cleanupTmpFile();
		}
	}

	async processItem(item: INodeExecutionData, itemIndex: number): Promise<Document[]> {
		const docs: Document[] = [];
		const binaryMode = this.context.getNodeParameter('binaryMode', itemIndex, 'allInputData');
		if (binaryMode === 'allInputData') {
			const binaryData = this.context.getInputData();

			for (const data of binaryData) {
				if (data.binary) {
					const binaryDataKeys = Object.keys(data.binary);

					for (const fileKey of binaryDataKeys) {
						const processedDocuments = await this.processItemByKey(item, itemIndex, fileKey);
						docs.push(...processedDocuments);
					}
				}
			}
		} else {
			const processedDocuments = await this.processItemByKey(item, itemIndex, this.binaryDataKey);
			docs.push(...processedDocuments);
		}

		return docs;
	}

	async processItemByKey(
		item: INodeExecutionData,
		itemIndex: number,
		binaryKey: string,
	): Promise<Document[]> {
		const selectedLoader: keyof typeof SUPPORTED_MIME_TYPES = this.context.getNodeParameter(
			'loader',
			itemIndex,
			'auto',
		) as keyof typeof SUPPORTED_MIME_TYPES;

		const docs: Document[] = [];
		const metadata = getMetadataFiltersValues(this.context, itemIndex);

		if (!item) return [];

		const binaryData = this.context.helpers.assertBinaryData(itemIndex, binaryKey);
		const { mimeType } = binaryData;

		await this.validateMimeType(mimeType, selectedLoader);

		const filePathOrBlob = await this.getFilePathOrBlob(binaryData, mimeType);
		const cleanupTmpFile: DirectoryResult['cleanup'] | undefined = undefined;
		const loader = await this.getLoader(mimeType, filePathOrBlob, itemIndex);
		const loadedDoc = await this.loadDocuments(loader);

		docs.push(...loadedDoc);

		if (metadata) {
			docs.forEach((document) => {
				document.metadata = {
					...document.metadata,
					...metadata,
				};
			});
		}

		await this.cleanupTmpFileIfNeeded(cleanupTmpFile);

		return docs;
	}
}



export const DEFAULT_OPERATION_MODES: NodeOperationMode[] = [
	'load',
	'insert',
	'retrieve',
	'retrieve-as-tool',
];

export const OPERATION_MODE_DESCRIPTIONS: INodePropertyOptions[] = [
	{
		name: 'Get Many',
		value: 'load',
		description: 'Get many ranked documents from vector store for query',
		action: 'Get ranked documents from vector store',
	},
	{
		name: 'Insert Documents',
		value: 'insert',
		description: 'Insert documents into vector store',
		action: 'Add documents to vector store',
	},
	{
		name: 'Retrieve Documents (As Vector Store for Chain/Tool)',
		value: 'retrieve',
		description: 'Retrieve documents from vector store to be used as vector store with AI nodes',
		action: 'Retrieve documents for Chain/Tool as Vector Store',
		outputConnectionType: NodeConnectionType.AiVectorStore,
	},
	{
		name: 'Retrieve Documents (As Tool for AI Agent)',
		value: 'retrieve-as-tool',
		description: 'Retrieve documents from vector store to be used as tool with AI nodes',
		action: 'Retrieve documents for AI Agent as Tool',
		outputConnectionType: NodeConnectionType.AiTool,
	},
	{
		name: 'Update Documents',
		value: 'update',
		description: 'Update documents in vector store by ID',
		action: 'Update vector store documents',
	},
];


/**
 * Checks if the update operation is supported for a specific vector store
 * A vector store supports updates if it explicitly includes 'update' in its operationModes
 */
export function isUpdateSupported<T extends VectorStore>(
	args: VectorStoreNodeConstructorArgs<T>,
): boolean {
	return args.meta.operationModes?.includes('update') ?? false;
}

export function transformDescriptionForOperationMode(
	fields: INodeProperties[],
	mode: NodeOperationMode | NodeOperationMode[],
): INodeProperties[] {
	return fields.map((field) => ({
		...field,
		displayOptions: { show: { mode: Array.isArray(mode) ? mode : [mode] } },
	}));
}

export function getOperationModeOptions<T extends VectorStore>(
	args: VectorStoreNodeConstructorArgs<T>,
): INodePropertyOptions[] {
	const enabledOperationModes = args.meta.operationModes ?? DEFAULT_OPERATION_MODES;

    return OPERATION_MODE_DESCRIPTIONS.filter(({ value }) =>
		enabledOperationModes.includes(value as NodeOperationMode),
	);
	// return OPERATION_MODE_DESCRIPTIONS.filter(({ value }: { value: string }) =>
	// 	enabledOperationModes.includes(value as NodeOperationMode),
	// );
}