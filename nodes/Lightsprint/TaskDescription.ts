import type { INodeProperties } from 'n8n-workflow';

const resource: INodeProperties['displayOptions'] = {
	show: { resource: ['task'] },
};

export const taskOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: resource,
	options: [
		{
			name: 'Create',
			value: 'create',
			action: 'Create a task',
		},
		{
			name: 'Delete',
			value: 'delete',
			action: 'Delete a task',
		},
		{
			name: 'Get',
			value: 'get',
			action: 'Get a task',
		},
		{
			name: 'Get Many',
			value: 'getAll',
			action: 'Get many tasks',
		},
		{
			name: 'Update',
			value: 'update',
			action: 'Update a task',
		},
		{
			name: 'Claim',
			value: 'claim',
			action: 'Claim a task',
		},
	],
	default: 'getAll',
};

const show = (ops: string[]) => ({
	show: { resource: ['task'], operation: ops },
});

export const taskFields: INodeProperties[] = [
	// ------ Get / Delete / Update / Claim: taskId ------
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['get', 'delete', 'update', 'claim']),
		description: 'The ID of the task',
	},

	// ------ Create: required fields ------
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		default: '',
		displayOptions: show(['create']),
		description: 'Title of the task (max 500 chars)',
	},

	// ------ Create: optional fields ------
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(['create']),
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				description: 'Task description in markdown (max 50,000 chars)',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Backlog', value: 'backlog' },
					{ name: 'Todo', value: 'todo' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'In Review', value: 'in_review' },
					{ name: 'Done', value: 'done' },
				],
				default: 'backlog',
			},
			{
				displayName: 'Complexity',
				name: 'complexity',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
				],
				default: 'medium',
			},
			{
				displayName: 'Dependency Task IDs',
				name: 'dependencyTaskIds',
				type: 'string',
				default: '',
				description: 'Comma-separated task IDs this task depends on',
			},
		],
	},

	// ------ Update: fields ------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: show(['update']),
		options: [
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Backlog', value: 'backlog' },
					{ name: 'Todo', value: 'todo' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'In Review', value: 'in_review' },
					{ name: 'Done', value: 'done' },
				],
				default: 'backlog',
			},
			{
				displayName: 'Complexity',
				name: 'complexity',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
				],
				default: 'medium',
			},
			{
				displayName: 'Assignee',
				name: 'assignee',
				type: 'string',
				default: '',
				description: 'Team member name to assign',
			},
		],
	},

	// ------ Get Many: filters ------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: show(['getAll']),
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: { minValue: 1, maxValue: 100 },
		default: 30,
		displayOptions: {
			show: { resource: ['task'], operation: ['getAll'], returnAll: [false] },
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: show(['getAll']),
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Backlog', value: 'backlog' },
					{ name: 'Todo', value: 'todo' },
					{ name: 'In Progress', value: 'in_progress' },
					{ name: 'In Review', value: 'in_review' },
					{ name: 'Done', value: 'done' },
				],
				default: 'todo',
			},
			{
				displayName: 'Complexity',
				name: 'complexity',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
				],
				default: 'medium',
			},
			{
				displayName: 'Assignee',
				name: 'assignee',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Project',
				name: 'project',
				type: 'string',
				default: '',
				description: 'Project ID to filter by',
			},
			{
				displayName: 'Unassigned Only',
				name: 'unassigned',
				type: 'boolean',
				default: false,
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Newest First', value: 'newest' },
					{ name: 'Oldest First', value: 'oldest' },
				],
				default: 'newest',
			},
		],
	},
];
