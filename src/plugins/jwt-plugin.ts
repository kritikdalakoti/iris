import { Response } from '../classes/response'
import { StatusCodes } from '../classes/status-codes';
import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import { resolve } from 'path';

export default async function (server: Hapi.server) {
    let globalVariables: AppGlobalVariableInterface = server.settings.app;


    const validate = async function (decoded, request, h) {

        return { isValid: true };
    };

    const responseFunc = async function (request, h) {

        console.log("Success Request", request);

        // if (err) {
        //     let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
        //     return h.response(response).code(response.getStatusCode()).takeover();
        // }

        // return h.continue;

    }


    const errorFunc = async function (request, h) {
        return request;
    }


    await server.register(require('hapi-auth-jwt2'));


    server.auth.strategy('jwt', 'jwt',
        {
            key: globalVariables.jwtConfig['secretKey'], // Never Share your secret key
            validate: validate,  // validate function defined above
            // responseFunc: responseFunc,
            // errorFunc: errorFunc
        });

    // server.register(require('hapi-auth-jwt2'), (err) => {

    //     // We're giving the strategy both a name
    //     // and scheme of 'jwt'
    //     server.auth.strategy('jwt', 'jwt', {
    //         key: globalVariables.jwtConfig['secretKey'],
    //         verifyOptions: {
    //             algorithms: ['HS256']
    //         },
    //         validate: validate,
    //     });
    // })


    server.auth.default('jwt');

}
