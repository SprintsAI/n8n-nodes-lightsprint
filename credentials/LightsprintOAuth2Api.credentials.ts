import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';

export class LightsprintOAuth2Api implements ICredentialType {
	name = 'lightsprintOAuth2Api';
	extends = ['oAuth2Api'];
	displayName = 'Lightsprint OAuth2 API';
	documentationUrl = 'https://lightsprint.ai';
	icon: Icon = 'file:../nodes/Lightsprint/lightsprint.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: 'https://lightsprint.ai/oauth/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: 'https://lightsprint.ai/oauth/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default:
				'tasks:read tasks:write kanban:read comments:write agents:write plans:read plans:write',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://lightsprint.ai',
			url: '/api/repo-key/info',
			method: 'GET',
		},
	};
}
