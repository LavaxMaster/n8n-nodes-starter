import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class UnderstandTechApiCredentialsApi implements ICredentialType {
	name = 'understandTechApi';
	displayName = 'Understand Tech API';
	documentationUrl = 'https://developer.understand.tech/api/v1/docs';

	// Test the credential
	test = {
		request: {
			method: 'GET' as const,
			url: 'https://developer.understand.tech/api/v1/account/verify-apikey',
			headers: {
				Authorization: '={{ "Bearer " + $credentials.apiKey }}',
				Accept: 'application/json',
			},
		},
	};

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			default: '',
			required: true,
			typeOptions: {
				password: true,
			},
			description: 'Your Understand Tech API Key',
		},
	];
}
