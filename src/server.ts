import * as Hapi from '@hapi/hapi';
import { ServerConfigurationInterface } from './interfaces/server-configuration-interface';
import { AppGlobalVariableInterface } from './interfaces/app-global-variables-interface';
import * as Routes from './routes';
import { StatusCodes } from './classes/status-codes';
import CommonCrudServiceImpl from './services/common-crud-serviceImpl';
import { Response } from './classes/response';
import { CustomMessages } from './classes/custom-messages';

export async function init(
	serverConfig: ServerConfigurationInterface,
	globalVariables: AppGlobalVariableInterface,
	myHost: string
): Promise<Hapi.Server> {
	try {
		const port = serverConfig.port;

		const server = new Hapi.Server({
			host: 'localhost',
			port: '3000',
			router: {
				stripTrailingSlash: true,
			},
			routes: {
				cors: {
					origin: ['*'],
					credentials: true,
				},
			},
			state: {
				strictHeader: false,
			},
		});

		server.app['globalVariables'] = globalVariables;

		if (serverConfig.routePrefix) {
			server.realm.modifiers.route.prefix = serverConfig.routePrefix;
		}

		let hostString = myHost + ':' + port;

		const swaggeredPluginOptions = {
			info: {
				title: 'Array Pointer Iris Backend',
				description: 'Iris APIs',
				version: '1.0.0',
			},
			swaggerUI: true,
			documentationPage: true,
			host: hostString,
			documentationPath: '/docs',
		};

		console.log('Swagger options', swaggeredPluginOptions);
		await server.register([
			require('inert'),
			require('vision'),
			{
				plugin: require('hapi-swagger'),
				options: swaggeredPluginOptions,
			},
		]);

		const scheme = function (server, options) {
			return {
				// api: {
				//     settings: {
				//         x: 5
				//     }
				// },
				authenticate: async function (request, h) {
					const authorization = request.headers.authorization;
					console.log('Authorization', authorization);
					if (!request.headers.authorization) {
						let response = new Response(
							false,
							StatusCodes.UNAUTHORIZED,
							CustomMessages.MISSING_AUTH_HEADER,
							{}
						);
						return h
							.response(response)
							.code(response.getStatusCode())
							.takeover();
					} else {
						let serviceImpl = new CommonCrudServiceImpl(
							globalVariables.postgres,
							't_tokens',
							't_tokens'
						);
						let userServiceImpl = new CommonCrudServiceImpl(
							globalVariables.postgres,
							't_users',
							't_users'
						);

						let condition = {};
						condition['token'] = authorization;

						let userData: any = await serviceImpl.getSingleEntry(condition);
						console.log('authorization', authorization, 'userData', userData);

						if (userData.getIsSuccess() == true) {
							let data = userData.getResult();
							console.log(data);

							let userCondition = {};

							userCondition['userId'] = data['userId'];
							let tempToken: any = (
								await serviceImpl.getAllEntries(
									userCondition,
									10000,
									0,
									'token_id DESC',
									'true',
									'true'
								)
							).getResult()['list'][0];

							//  console.log("temptoken",tempToken['token'] )
							if (tempToken['token'] == authorization) {
								let condition = {};
								condition['userId'] = data['userId'];
								let userResponse = await userServiceImpl.getSingleEntry(
									condition
								);
								let companyId = userResponse.getResult()['companyId'];
								// console.log(companyId,request.params['companyId'])

								console.log(
									"request.params['companyId']",
									request.params['companyId'],
									'companyId',
									companyId
								);
								if (request.params['companyId'] != undefined) {
									if (companyId != request.params['companyId']) {
										let response = new Response(
											false,
											StatusCodes.UNAUTHORIZED,
											'UNAUTHORIZED USER',
											{}
										);
										return h
											.response(response)
											.code(response.getStatusCode())
											.takeover();
									}
								}
								return h.authenticated({ credentials: { id: data['userId'] } });
							} else {
								let response = new Response(
									false,
									StatusCodes.UNAUTHORIZED,
									CustomMessages.INVALID_AUTH_HEADER,
									{}
								);
								return h
									.response(response)
									.code(response.getStatusCode())
									.takeover();
							}
						} else {
							let response = new Response(
								false,
								StatusCodes.UNAUTHORIZED,
								CustomMessages.INVALID_AUTH_HEADER,
								{}
							);
							return h
								.response(response)
								.code(response.getStatusCode())
								.takeover();
						}
					}
					//  return h.authenticated({ credentials: { user: 'john' } });
				},
			};
		};

		server.auth.scheme('custom', scheme);
		server.auth.strategy('default', 'custom');
		server.auth.default('default');

		console.log('Register Routes');
		await Routes.init(server);

		// const validate = async function (decoded, request, h) {

		//     console.log("Decoded Data", decoded);
		//     return { isValid: true };

		//     // do your checks to see if the person is valid
		//     // if (!people[decoded.id]) {
		//     //     return { isValid: false };
		//     // }
		//     // else {
		//     //     return { isValid: true };
		//     // }
		// };

		//   await server.register(require('hapi-auth-jwt2'));

		// server.auth.strategy('jwt', 'jwt',
		//     {
		//         key: 'SecretKeyForJwtAuthentication',          // Never Share your secret key
		//         validate: validate,            // validate function defined above
		//         verifyOptions: { algorithms: ['HS256'] }, // pick a strong algorithm
		//     });

		// server.auth.default('jwt');

		console.log('Routes registered sucessfully.');
		return server;
	} catch (err) {
		console.log('Error starting server: ', err);
		throw err;
	}
}
