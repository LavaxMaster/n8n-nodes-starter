import type {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

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
        // Fixed connection types using string literals
        inputs: ['main'],
        outputs: ['main'],
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
                displayName: 'Additional Options',
                name: 'additionalOptions',
                type: 'collection',
                placeholder: 'Add Option',
                default: {},
                options: [
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
                ],
            },
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];

        for (let i = 0; i < items.length; i++) {
            try {
                // Retrieve node parameters
                const modelName = this.getNodeParameter('modelName', i) as string;
                const prompt = this.getNodeParameter('prompt', i) as string;
                const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
                    secret?: string;
                    actingUserEmail?: string;
                    language?: string;
                    historyPeriod?: string;
                };

                // Get credentials
                const credentials = await this.getCredentials('understandTechApi');
                const baseUrl = credentials.baseUrl as string;
                
                // Validate credentials
                if (!baseUrl) {
                    throw new NodeOperationError(this.getNode(), 'Base URL is required');
                }

                try {
                    new URL(baseUrl);
                } catch {
                    throw new NodeOperationError(this.getNode(), 'Base URL must be a valid URL');
                }

                // Map language to language_pref
                const language = additionalOptions.language || 'en-US';
                const languagePrefMap: { [key in 'en-US' | 'fr-FR']: string } = {
                    'en-US': ' English',
                    'fr-FR': ' French',
                };
                const languagePref = languagePrefMap[language as 'en-US' | 'fr-FR'] || language;

                // Construct the payload
                const payload = {
                    acting_user_email: additionalOptions.actingUserEmail || undefined,
                    history: [
                        {
                            messages: [],
                            model: modelName,
                        },
                    ],
                    history_period: additionalOptions.historyPeriod || 'Today',
                    language_pref: languagePref,
                    prompt,
                    secret: additionalOptions.secret || undefined,
                    selected_models: [modelName],
                };

                // Make the API request using authenticated helper
                const response = await this.helpers.httpRequestWithAuthentication.call(
                    this,
                    'understandTechApi',
                    {
                        method: 'POST',
                        url: `${baseUrl}/api/v1/chat`,
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': language,
                        },
                        body: payload,
                        json: true,
                    }
                );

                // Add response to return data
                returnData.push({ json: response });
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                            details: error.response?.data || 'No details provided',
                        },
                    });
                    continue;
                }
                throw new NodeOperationError(this.getNode(), error);
            }
        }

        return [returnData];
    }
}