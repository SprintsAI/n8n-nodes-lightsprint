import type { INodeProperties } from 'n8n-workflow';

const resource: INodeProperties['displayOptions'] = {
	show: { resource: ['agent'] },
};

export const agentOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: resource,
	options: [
		{
			name: 'Launch',
			value: 'launch',
			action: 'Launch a cloud agent',
		},
		{
			name: 'Stop',
			value: 'stop',
			action: 'Stop a cloud agent',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			action: 'Get agents for a task',
		},
		{
			name: 'Get Settings',
			value: 'getSettings',
			action: 'Get cloud agent settings',
		},
	],
	default: 'launch',
};

const show = (ops: string[]) => ({
	show: { resource: ['agent'], operation: ops },
});

export const agentFields: INodeProperties[] = [
	// ------ Task ID for launch / stop / getAll ------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['launch', 'stop', 'getAll']),
		description: 'The task to launch the agent on',
	},

	// ------ Provider for launch / stop ------
	{
		displayName: 'Provider',
		name: 'provider',
		type: 'options',
		required: true,
		options: [
			{ name: 'Anthropic', value: 'anthropic' },
			{ name: 'Cursor', value: 'cursor' },
			{ name: 'Codex', value: 'codex' },
		],
		default: 'anthropic',
		displayOptions: show(['launch', 'stop']),
	},

	// ------ Launch: optional fields ------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(['launch']),
		options: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: '',
				description: 'Model override (provider-specific)',
			},
			{
				displayName: 'Base Ref',
				name: 'baseRef',
				type: 'string',
				default: '',
				description: 'Git branch to base the agent work on',
			},
			{
				displayName: 'Environment ID',
				name: 'environmentId',
				type: 'string',
				default: '',
				description: 'Environment ID (required for Codex)',
			},
		],
	},
];
