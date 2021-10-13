import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import MigrationController from '../controllers/migration-controller';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new MigrationController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'migration';
 
    server.route([

        {
            method: 'POST',
            path: '/' + version + "/" + resourceName ,
            options: {
                handler: controller.handleMigration,
                description: 'Send Email user',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    failAction: async (request, h, err) => {

                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }

                        return h.continue;
                    }
                },
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '201': [],
                            '406': {
                                'description': 'Validation Error.'
                            }
                        }
                    }
                }
            }
        },
    
        ]);}  