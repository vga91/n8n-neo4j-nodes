import {
	IAuthenticateGeneric,
	// ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import {name} from '../common-utils';

export interface Neo4jCredentials {
	username?: string;// = 'neo4j';
	password: string;
	url: string; // e.g. bolt://localhost:7687
	database?: string; // e.g. neo4j


	// constructor(data: Partial<Neo4jCredentials>) {
	// 	Object.assign(this, data);
	// 	if (!this.boltUrl) {
	// 		throw new Error('boltUrl is required');
	// 	}
	// }
}

export class Neo4jCredentialsApi implements ICredentialType {
	name = name;
	displayName = 'Neo4j Credentials API';

	// TODO - change to Neo4j
	documentationUrl = 'https://your-docs-url';

	properties: INodeProperties[] = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'Bolt URL',
			name: 'url',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			default: 'neo4j',
		},
		{
			displayName: 'User name',
			name: 'username',
			type: 'string',
			default: 'neo4j',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			required: true,
			typeOptions: {
				password: true,
			},
			default: '',
		}
	];

	// This credential is currently not used by any node directly
	// but the HTTP Request node can use it to make requests.
	// The credential is also testable due to the `test` property below
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{ $credentials.username }}',
				password: '={{ $credentials.password }}',
			},
			qs: {
				// Send this as part of the query string
				n8n: 'rocks',
			},
		},
	};

	// The block below tells how this credential can be tested
	// test: ICredentialTestRequest = {
	// 	request: {
	// 		// baseURL: 'https://example.com/',
	// 		url: 'bolt://localhost:7687',
	// 	},
	// };
}
