import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { userIdInParams, createDataModelValidationObj } from '../validations/previous-custom-analysis-validations';
import PreviousCustomAnalysisController from '../controllers/previous-custom-analysis-controller';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new PreviousCustomAnalysisController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'previous-custom-analysis';
    let baseUrl="/user/{userId}/";
   // let id="/{previousCustomAnalysisId}";

    server.route([
        {
            method: 'GET',
            path: '/' + version + baseUrl+resourceName ,
            options: {
                handler: controller.handleGetSingleEntry,
                description: 'Get Single Entry for Meter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: userIdInParams,
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


        {
            method: 'PUT',
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleCreateAndUpdateEntry,
                description: 'update Single Entry of Meter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: userIdInParams,
                    payload: createDataModelValidationObj,
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
                        },
                        
                    }
                }
            }
        },



    ]);
}