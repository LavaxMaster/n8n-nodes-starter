import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class UnderstandTechApi implements ICredentialType {
	name = 'understandTechApi';
	displayName = 'Understand Tech API';
	// Test to validate the API Key on the credentials page
	test?: {
		 request: {
			method: 'GET';
			url: string;
			headers?: {
				Authorization: string;
			};
		};
		} = {
		request: {
			method: 'GET',
			url: '={{$credentials.baseUrl}}/api/v1/auth',
			headers: { Authorization: 'Bearer {{$credentials.apiKey}}' },
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: { password: true },
			description: 'API Key used to authenticate requests',
		},
	];
}
