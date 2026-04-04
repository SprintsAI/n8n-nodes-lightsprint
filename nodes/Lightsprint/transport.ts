import type {
	IExecuteFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const BASE_URL = 'https://lightsprint.ai';

/**
 * Resolve the repoId from the OAuth token by calling /api/repo-key/info.
 * Cached per-execution via static data.
 */
export async function getRepoId(ctx: IExecuteFunctions): Promise<string> {
	const staticData = ctx.getWorkflowStaticData('node');
	if (staticData.repoId) {
		return staticData.repoId as string;
	}

	const response = await lightsprintApiRequest.call(ctx, 'GET', '/api/repo-key/info');
	const repoId = response.repo?.id as string;
	if (!repoId) {
		throw new NodeApiError(ctx.getNode(), response as JsonObject, {
			message: 'Could not resolve repoId from OAuth token',
		});
	}

	staticData.repoId = repoId;
	return repoId;
}

/**
 * Make an authenticated request to the Lightsprint API.
 */
export async function lightsprintApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: object,
	query?: Record<string, string | number | boolean>,
): Promise<any> {
	const options: IRequestOptions = {
		method,
		uri: `${BASE_URL}${endpoint}`,
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		return await this.helpers.requestWithAuthentication.call(
			this,
			'lightsprintOAuth2Api',
			options,
		);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
