import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class UnderstandTechApiCredentials implements ICredentialType {
  name = 'understandTechApi';
  displayName = 'Understand Tech API';

  // <-- no "?" here
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
      typeOptions: { password: true },
      description: 'Your Understand Tech API Key',
    },
  ];
}
