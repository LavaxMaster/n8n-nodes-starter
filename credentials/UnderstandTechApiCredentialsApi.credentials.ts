import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class UnderstandTechApiCredentialsApi implements ICredentialType {
    name = 'understandTechApi';
    displayName = 'Understand Tech API';
    documentationUrl = 'https://developer.understand.tech/api/v1/docs';

    properties: INodeProperties[] = [
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://developer.understand.tech',
            required: true,
            description: 'The base URL of the UnderstandTech API',
        },
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

    test = {
        request: {
            method: 'GET' as const,
            url: '={{ $credentials.baseUrl + "/api/v1/account/verify-apikey" }}',
            headers: {
                Authorization: '={{ "Bearer " + $credentials.apiKey }}',
                Accept: 'application/json',
            },
        },
    };
}