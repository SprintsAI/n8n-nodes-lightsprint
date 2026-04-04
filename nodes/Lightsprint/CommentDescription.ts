import type { INodeProperties } from 'n8n-workflow';

const resource: INodeProperties['displayOptions'] = {
	show: { resource: ['comment'] },
};

export const commentOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: resource,
	options: [
		{
			name: 'Create',
			value: 'create',
			action: 'Create a comment',
		},
		{
			name: 'Delete',
			value: 'delete',
			action: 'Delete a comment',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			action: 'Get many comments',
		},
		{
			name: 'Update',
			value: 'update',
			action: 'Update a comment',
		},
	],
	default: 'getAll',
};

const show = (ops: string[]) => ({
	show: { resource: ['comment'], operation: ops },
});

export const commentFields: INodeProperties[] = [
	// ------ Task ID for create / getAll ------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['create', 'getAll']),
		description: 'The task to add the comment to',
	},

	// ------ Comment ID for update / delete ------
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['update', 'delete']),
		description: 'The ID of the comment',
	},

	// ------ Create / Update: body ------
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		displayOptions: show(['create', 'update']),
		description: 'Comment text (max 10,000 chars)',
	},
];
