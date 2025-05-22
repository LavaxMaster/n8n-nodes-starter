import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

export class UnderstandTechChat implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Understand Tech Chat',
        name: 'understandTechChat',
        documentationUrl: 'https://developer.understand.tech/api/v1/docs',
        icon: 'file:understandtech_logo.svg',
        group: ['transform'],
        version: 1,
        description: 'Chat with a model in UnderstandTech',
        defaults: {
            name: 'Understand Tech Chat',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'understandTechApi',
                required: true,
            },
        ],
        properties: [
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
				noDataExpression: true,
                options: [
                    {
                        name: 'Chat',
                        value: 'chat',
                    },
                ],
                default: 'chat',
            },
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
				noDataExpression: true,
                displayOptions: {
                    show: {
                        resource: ['chat'],
                    },
                },
                options: [
                    {
                        name: 'Send Message',
                        value: 'sendMessage',
                        description: 'Send a message to the chat model',
						action: 'Send message a chat',
                    },
                ],
                default: 'sendMessage',
            },
            {
                displayName: 'Model Name',
                name: 'modelName',
                type: 'string',
                default: '',
                required: true,
                description: 'The name of the model to chat with',
            },
            {
                displayName: 'Prompt',
                name: 'prompt',
                type: 'string',
                default: '',
                required: true,
                description: 'The prompt or message to send to the model',
            },
            {
                displayName: 'Secret',
                name: 'secret',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'Your secret for the chat session (optional, required for models with secret)',
            },
            {
                displayName: 'Acting User Email',
                name: 'actingUserEmail',
                type: 'string',
                default: '',
                description: 'The email of the user to act on behalf of (optional)',
            },
            {
                displayName: 'Language Preference',
                name: 'language',
                type: 'options',
                options: [
                    { name: 'English (US)', value: 'en-US' },
                    { name: 'French (France)', value: 'fr-FR' },
                ],
                default: 'en-US',
                description: 'Select the language preference for the chat',
            },
            {
                displayName: 'History Period',
                name: 'historyPeriod',
                type: 'options',
                options: [
                    { name: 'Today', value: 'Today' },
                    { name: 'Yesterday', value: 'Yesterday' },
                    { name: 'Last Week', value: 'Last Week' },
                    { name: 'Last 30 Days', value: 'Last 30 Days' },
                ],
                default: 'Today',
                description: 'Timeframe of chat history to include',
            },
            {
                displayName: 'Continue on Fail',
                name: 'continueOnFail',
                type: 'boolean',
                default: false,
                description: 'Whether to continue the workflow even if this node fails',
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            // Retrieve node parameters
            const modelName = this.getNodeParameter('modelName', i) as string;
            const prompt = this.getNodeParameter('prompt', i) as string;
            const secret = this.getNodeParameter('secret', i) as string;
            const actingUserEmail = this.getNodeParameter('actingUserEmail', i) as string;
            const language = this.getNodeParameter('language', i) as string;
            const historyPeriod = this.getNodeParameter('historyPeriod', i) as string;

            // Get credentials
            const credentials = await this.getCredentials('understandTechApi');
            const baseUrl = credentials.baseUrl as string;
            const apiKey = credentials.apiKey as string;

            // Validate credentials
            if (!baseUrl || !apiKey) {
                throw new NodeOperationError(this.getNode(), 'Base URL and API Key are required');
            }

            try {
                new URL(baseUrl);
            } catch {
                throw new NodeOperationError(this.getNode(), 'Base URL must be a valid URL');
            }

            // Map language to language_pref
            const languagePrefMap: { [key in 'en-US' | 'fr-FR']: string } = {
                'en-US': '🇺🇸 English',
                'fr-FR': '🇫🇷 French',
            };
            const languagePref = languagePrefMap[language as 'en-US' | 'fr-FR'] || language;

            // Construct the payload
            const payload = {
                acting_user_email: actingUserEmail || undefined,
                history: [
                    {
                        messages: [],
                        model: modelName,
                    },
                ],
                history_period: historyPeriod,
                language_pref: languagePref,
                prompt,
                secret: secret || undefined,
                selected_models: [modelName],
            };

            // Make the API request
            try {
                const response = await this.helpers.httpRequest({
                    method: 'POST',
                    url: `${baseUrl}/api/v1/chat`,
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'Accept-Language': language,
                    },
                    body: payload,
                    json: true,
                });

                

                // Validate response structure
                if (typeof response !== 'object' || response === null) {
                    throw new NodeOperationError(
                        this.getNode(),
                        `Invalid response: Expected an object, got ${typeof response}`,
                        { description: `Response: ${JSON.stringify(response)}` }
                    );
                }

                // Check if responses array exists, otherwise handle flexibly
                if (!Array.isArray((response as any).responses)) {
                    // If responses array is missing, return the entire response
                    returnData.push({ json: response });
                    continue;
                }

                // Add response to return data
                returnData.push({ json: response });
            } catch (error) {
                if (this.getNodeParameter('continueOnFail', i, false)) {
                    returnData.push({ json: { error: error.message, details: error.response?.data || 'No details provided' } });
                    continue;
                }
                throw new NodeOperationError(
                    this.getNode(),
                    `API Error: ${error.message}`,
                    { description: `Response: ${JSON.stringify(error.response?.data || 'No response data')}` }
                );
            }
        }

        return [returnData];
    }
}