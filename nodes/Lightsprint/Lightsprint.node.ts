import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getRepoId, lightsprintApiRequest } from './transport';
import { taskOperations, taskFields } from './TaskDescription';
import { commentOperations, commentFields } from './CommentDescription';
import { agentOperations, agentFields } from './AgentDescription';

export class Lightsprint implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Lightsprint',
		name: 'lightsprint',
		icon: 'file:lightsprint.svg',
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Manage tasks, comments, and AI agents on Lightsprint',
		defaults: { name: 'Lightsprint' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'lightsprintOAuth2Api',
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
					{ name: 'Task', value: 'task' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Cloud Agent', value: 'agent' },
				],
				default: 'task',
			},
			taskOperations,
			...taskFields,
			commentOperations,
			...commentFields,
			agentOperations,
			...agentFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				let response: any;

				if (resource === 'task') {
					response = await executeTask.call(this, operation, i);
				} else if (resource === 'comment') {
					response = await executeComment.call(this, operation, i);
				} else if (resource === 'agent') {
					response = await executeAgent.call(this, operation, i);
				}

				if (Array.isArray(response)) {
					returnData.push(...response.map((item: any) => ({ json: item })));
				} else if (response !== undefined) {
					returnData.push({ json: response });
				} else {
					returnData.push({ json: { success: true } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}

// ─── Task operations ────────────────────────────────────────────────

async function executeTask(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	const repoId = await getRepoId(this);

	if (operation === 'create') {
		const title = this.getNodeParameter('title', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as {
			description?: string;
			status?: string;
			complexity?: string;
			dependencyTaskIds?: string;
		};

		const body: Record<string, any> = { title };
		if (additionalFields.description) body.description = additionalFields.description;
		if (additionalFields.status) body.status = additionalFields.status;
		if (additionalFields.complexity) body.complexity = additionalFields.complexity;
		if (additionalFields.dependencyTaskIds) {
			body.dependencyTaskIds = additionalFields.dependencyTaskIds
				.split(',')
				.map((id) => id.trim())
				.filter(Boolean);
		}

		return lightsprintApiRequest.call(this, 'POST', `/api/repos/${repoId}/tasks`, body);
	}

	if (operation === 'get') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		return lightsprintApiRequest.call(this, 'GET', `/api/tasks/${taskId}`);
	}

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', i) as boolean;
		const filters = this.getNodeParameter('filters', i) as Record<string, any>;
		const query: Record<string, any> = {};

		if (filters.status) query.status = filters.status;
		if (filters.complexity) query.complexity = filters.complexity;
		if (filters.assignee) query.assignee = filters.assignee;
		if (filters.project) query.project = filters.project;
		if (filters.unassigned) query.unassigned = 'true';
		if (filters.sort) query.sort = filters.sort;

		if (returnAll) {
			const results: any[] = [];
			let offset = 0;
			const limit = 100;
			let hasMore = true;

			while (hasMore) {
				const response = await lightsprintApiRequest.call(
					this,
					'GET',
					`/api/repos/${repoId}/tasks`,
					undefined,
					{ ...query, limit, offset },
				);

				const tasks = response.tasks || [];
				results.push(...tasks);
				offset += limit;
				hasMore = tasks.length === limit;
			}

			return results;
		}

		const limit = this.getNodeParameter('limit', i) as number;
		const response = await lightsprintApiRequest.call(
			this,
			'GET',
			`/api/repos/${repoId}/tasks`,
			undefined,
			{ ...query, limit },
		);
		return response.tasks || [];
	}

	if (operation === 'update') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		const updateFields = this.getNodeParameter('updateFields', i) as Record<string, any>;

		if (Object.keys(updateFields).length === 0) {
			throw new NodeOperationError(this.getNode(), 'No update fields provided', {
				itemIndex: i,
			});
		}

		return lightsprintApiRequest.call(this, 'PATCH', `/api/tasks/${taskId}`, updateFields);
	}

	if (operation === 'delete') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		await lightsprintApiRequest.call(this, 'DELETE', `/api/tasks/${taskId}`);
		return { deleted: true, taskId };
	}

	if (operation === 'claim') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		return lightsprintApiRequest.call(this, 'POST', `/api/tasks/${taskId}/claim`);
	}
}

// ─── Comment operations ─────────────────────────────────────────────

async function executeComment(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'create') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		const body = this.getNodeParameter('body', i) as string;
		return lightsprintApiRequest.call(this, 'POST', `/api/tasks/${taskId}/comments`, { body });
	}

	if (operation === 'getAll') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		const response = await lightsprintApiRequest.call(
			this,
			'GET',
			`/api/tasks/${taskId}/comments`,
		);
		return response.comments || response;
	}

	if (operation === 'update') {
		const commentId = this.getNodeParameter('commentId', i) as string;
		const body = this.getNodeParameter('body', i) as string;
		return lightsprintApiRequest.call(this, 'PATCH', `/api/comments/${commentId}`, { body });
	}

	if (operation === 'delete') {
		const commentId = this.getNodeParameter('commentId', i) as string;
		await lightsprintApiRequest.call(this, 'DELETE', `/api/comments/${commentId}`);
		return { deleted: true, commentId };
	}
}

// ─── Agent operations ───────────────────────────────────────────────

async function executeAgent(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<any> {
	if (operation === 'launch') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		const provider = this.getNodeParameter('provider', i) as string;
		const additionalFields = this.getNodeParameter('additionalFields', i) as {
			model?: string;
			baseRef?: string;
			environmentId?: string;
		};

		const body: Record<string, any> = {};
		if (additionalFields.model) body.model = additionalFields.model;
		if (additionalFields.baseRef) body.baseRef = additionalFields.baseRef;
		if (additionalFields.environmentId) body.environmentId = additionalFields.environmentId;

		return lightsprintApiRequest.call(
			this,
			'POST',
			`/api/tasks/${taskId}/cloud-agents/${provider}`,
			body,
		);
	}

	if (operation === 'stop') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		const provider = this.getNodeParameter('provider', i) as string;
		await lightsprintApiRequest.call(
			this,
			'DELETE',
			`/api/tasks/${taskId}/cloud-agents/${provider}`,
		);
		return { stopped: true, taskId, provider };
	}

	if (operation === 'getAll') {
		const taskId = this.getNodeParameter('taskId', i) as string;
		return lightsprintApiRequest.call(this, 'GET', `/api/tasks/${taskId}/cloud-agents`);
	}

	if (operation === 'getSettings') {
		return lightsprintApiRequest.call(this, 'GET', '/api/cloud-agents/settings');
	}
}
