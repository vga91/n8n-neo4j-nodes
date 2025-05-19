import {
	IAuthenticateGeneric,
	// ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

import {name} from '../common-utils';


export class Neo4jCredentialsApi implements ICredentialType {
	name = name;
	displayName = 'Neo4j Credentials API';
	documentationUrl = 'https://neo4j.com/docs/api/javascript-driver/current/';

	properties: INodeProperties[] = [
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

}
