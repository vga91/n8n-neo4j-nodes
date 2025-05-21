import { Neo4jChatMessageHistory } from '@langchain/community/stores/message/neo4j';
import { BufferMemory, BufferWindowMemory } from 'langchain/memory';
import type { ISupplyDataFunctions, INodeType, INodeTypeDescription, SupplyData } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { getSessionId } from '../n8n-utils/utils';
import { getNeo4jCredentials } from '../../common-utils';
import { getConnectionHintNoticeField } from '../n8n-utils/vector_store/sharedFields';

import {
	sessionIdOption,
	sessionKeyProperty,
	expressionSessionKeyProperty,
} from '../n8n-utils/descriptions';

export class MemoryNeo4jChat implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Neo4j Chat Memory',
		name: 'memoryNeo4jChat',
		icon: 'file:neo4j-logo.svg',
		group: ['transform'],
		version: [1],
		description: 'Stores the chat history in Neo4j.',
		defaults: {
			name: 'Neo4j Chat Memory',
		},
		credentials: [
			{
				name: 'neo4j',
				required: true,
			},
		],
		inputs: [],
		outputs: [NodeConnectionType.AiMemory],
		outputNames: ['Memory'],
		properties: [
			getConnectionHintNoticeField([NodeConnectionType.AiAgent]),
			sessionIdOption,
			expressionSessionKeyProperty(1.2),
			sessionKeyProperty,
			{
				displayName: 'Session Key',
				name: 'sessionKey',
				type: 'string',
				default: 'default',
			},
			{
				displayName: 'Window Length',
				name: 'windowLength',
				type: 'number',
				default: 5,
			},
			{
				displayName: 'Session node label',
				name: 'sessionNodeLabel',
				type: 'string',
				default: 'Session',
				description:
					'The label of the node that stores the session. The default is "Session".',
			},
			{
				displayName: 'Message node label',
				name: 'messageNodeLabel',
				type: 'string',
				default: 'Message',
				description:
					'The label of the node that stores the message. The default is "Message".',
			}
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		console.log('driver opening');

		const sessionNodeLabel = this.getNodeParameter('sessionNodeLabel', itemIndex, 'Session') as string;
		const messageNodeLabel = this.getNodeParameter('messageNodeLabel', itemIndex, 'Message') as string;

		const credentials = await getNeo4jCredentials(this);

		const sessionId = getSessionId(this, itemIndex);
		const windowLength = this.getNodeParameter('windowLength', itemIndex) as number;

		const chatHistory = new Neo4jChatMessageHistory({
			sessionId,
			sessionNodeLabel,
			messageNodeLabel,
			url: credentials.url,
			username: credentials.username,
			password: credentials.password,
			windowSize: windowLength,
		});

		const memClass = this.getNode().typeVersion < 1.1 ? BufferMemory : BufferWindowMemory;
		const kOptions =
			this.getNode().typeVersion < 1.1
				? {}
				: { k: windowLength };

		const memory = new memClass({
			memoryKey: 'chat_history',
			chatHistory,
			returnMessages: true,
			inputKey: 'input',
			outputKey: 'output',
			...kOptions,
		});

		return {
			// TODO: it should be `response: logWrapper(memory, this)`
			response: memory,
		};
	}
}
