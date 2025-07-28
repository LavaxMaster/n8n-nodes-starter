import type { 
    ICredentialType, 
    INodeProperties,
    ICredentialTestRequest,
    IAuthenticateGeneric,
} from 'n8n-workflow';

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

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            method: 'GET',
            url: '={{$credentials.baseUrl}}/api/v1/account/verify-apikey',
        },
    };
}