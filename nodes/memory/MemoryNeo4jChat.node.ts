import { Neo4jChatMessageHistory } from '@langchain/community/stores/message/neo4j';
import { BufferWindowMemory } from 'langchain/memory';
//import { BaseChatMemory, BufferMemory, BufferWindowMemory } from 'langchain/memory';
// import { getSessionId } from '@utils/helpers';
// import { logWrapper } from '@utils/logWrapper';
import type { ISupplyDataFunctions, INodeType, INodeTypeDescription, SupplyData } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
import { getSessionId } from '../utils/utils';
import { Neo4jCredentials } from '../../credentials/Neo4jCredentialsApi.credentials';
// import neo4j from 'neo4j-driver';
import {name} from '../../common-utils';
// import neo4j from 'neo4j-driver';


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
			{
				displayName: 'Session Key',
				name: 'sessionKey',
				type: 'string',
				default: 'default',
			},
			{
				displayName: 'Context Window Length',
				name: 'contextWindowLength',
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

		// // const driver = neo4j.driver( "bolt://localhost:7687", 
		// const driver = neo4j.driver(
		// 	"bolt://127.0.0.1:7687",
		// 	neo4j.auth.basic("neo4j", "apoc12345"),
		// 	{ encrypted: false }
		//   );
		// // const driver = neo4j.driver(
		// // 	credentials.url,
		// // 	neo4j.auth.basic(credentials?.username ?? 'neo4j', credentials.password),
		// // 	{ encrypted: 'ENCRYPTION_OFF' }
		// // );
		// // console.debug('driver', driver.session());

		// console.log('driver closed1 ');
		// try {
		// 	await driver.session().run('CREATE (n:CICCIO) RETURN n');
		// } catch (error) {
		// 	console.error('Error creating node:', error);
		// }
		

		// console.log('driver closed2 ');
		// await driver.close();

		// console.log('driver closed3');

		// return {
		// 	response: null,
		// };
		
		console.log('supplyDataaa..');
		console.log('supplyData', this.getNode().typeVersion);
		const credentials = await this.getCredentials<Neo4jCredentials>(name);
		console.debug('credenzialiiii', credentials);
		console.debug('itemIndex', itemIndex);
		// console.debug('this', this);
		const sessionId = getSessionId(this, itemIndex);
		console.debug('sessionId', sessionId);
		const contextWindowLength = this.getNodeParameter('contextWindowLength', itemIndex) as number;
		console.debug('contextWindowLength', contextWindowLength);
		// const driver = neo4j.driver(
		// 	credentials.boltUrl,
		// 	neo4j.auth.basic(credentials.username, credentials.password),
		// );

		// todo - write https://github.com/vga91/n8n-neo4j-nodes/issues/1
		const url = credentials.url.replace('localhost', '127.0.0.1');
		const chatHistory = new Neo4jChatMessageHistory({
			sessionId,
			// todo - how to change it?
			sessionNodeLabel,//: 'Session',
			// todo - how to change it?
			messageNodeLabel,//: 'Message',
			url,//: url,
			// TODO - check it
			username: credentials?.username ?? 'neo4j',
			password: credentials.password,
			windowSize: contextWindowLength,
		});

		console.log("credentials.url", credentials.url);
		console.log("credentials.username", credentials?.username ?? 'neo4j');
		console.log("credentials.password", credentials.password);


		chatHistory.verifyConnectivity().then((res) => {
			console.debug('verifyConnectivity', res);
		}).catch((err) => {	
			console.debug('verifyConnectivity error', err);
		}
		);

		// console.debug('chatHistory', chatHistory);

		// TODO - DECOMMENT
		// const memClass = this.getNode().typeVersion < 1.1 ? BufferMemory : BufferWindowMemory;
		// const kOptions =
		// 	this.getNode().typeVersion < 1.1
		// 		? {}
		// 		: { k: this.getNodeParameter('contextWindowLength', itemIndex) };

		const memory = new BufferWindowMemory({
			memoryKey: 'chat_history',
			chatHistory,
			returnMessages: true,
			inputKey: 'input',
			outputKey: 'output',
			// ...kOptions,
		});

		// console.debug('memory', memory);

		return {
			response: memory,// logWrapper(memory, this),
		};
	}
}
