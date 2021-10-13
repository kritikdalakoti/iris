import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import { resolve } from 'path';

export default async function (server: Hapi.server) {
    let globalVariables: AppGlobalVariableInterface = server.settings.app;

    console.log("I am in swagger");

    const swaggeredPluginOptions = {
        info: {
            title: 'Business Details Api',
            description: 'All Business Details API service',
            version: '1.0',
        },
        grouping: 'tags',
        swaggerUI: true,
        documentationPage: true,
        host: globalVariables.swaggerConfig.hostString,
        documentationPath: globalVariables.swaggerConfig.documentationPath,
        schemes: globalVariables.swaggerConfig.SwaggerSchemes,
        // basePath: globalVariables.swaggerConfig.swaggerBasePath,
        templates: resolve('public', 'templates'),
    }

    console.log(swaggeredPluginOptions);

    await server.register([
        require('@hapi/inert'),
        require('@hapi/vision'),
        {
            plugin: require('hapi-swagger'),
            options: swaggeredPluginOptions
        }
    ])

    console.log("Plugin register successfully");


}