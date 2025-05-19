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
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'string',
				default: 'https://developer.understand.tech',
				required: true,
				typeOptions: {
					validation: [
						{
							regex: '^(https?://).+',
							error: 'Must be a valid URL starting with http:// or https://',
						},
					],
				},
				description: 'The base URL of the UnderstandTech API',
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
				description: 'Your secret for the chat session (optional)',
			},
			{
				displayName: 'Language Preference',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'En-US', value: 'en-US' },
					{ name: 'Fr-FR', value: 'fr-FR' },
				],
				default: 'en-US',
				description: 'Select the language header (Accept-Language)',
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
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const baseUrl = this.getNodeParameter('baseUrl', i) as string;
			const modelName = this.getNodeParameter('modelName', i) as string;
			const prompt = this.getNodeParameter('prompt', i) as string;
			const secret = this.getNodeParameter('secret', i) as string;
			const language = this.getNodeParameter('language', i) as string;
			const historyPeriod = this.getNodeParameter('historyPeriod', i) as string;

			const credentials = await this.getCredentials('understandTechApi');
			const apiKey = credentials.apiKey as string;

			if (!apiKey) {
				throw new NodeOperationError(this.getNode(), 'API Key is required');
			}

			try {
				new URL(baseUrl);
			} catch {
				throw new NodeOperationError(this.getNode(), 'Base URL must be a valid URL');
			}

			const payload = {
				history: [
					{
						messages: [],
						model: modelName,
					},
				],
				history_period: historyPeriod,
				prompt,
				secret,
				selected_models: [modelName],
			};

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

			if (
				typeof response !== 'object' ||
				!Array.isArray((response as any).reponses)
			) {
				throw new NodeOperationError(
					this.getNode(),
					'Unexpected response structure: missing `reponses` array',
				);
			}

			returnData.push({ json: response });
		}

		return [returnData];
	}
}
