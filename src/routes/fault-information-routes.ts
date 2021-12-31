import { getAllParams,companyIdInParams,createFaultInfoValidationObj,updateFaultInfoModelValidationObj } from './../validations/fault-information-validations';
import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { createMeterDataParameterValidationObj, companyIdValidationObj } from "../validations/meter-data-validations";
import FaultInformationController from '../controllers/fault-information-controller';
import { companyIdAndUserIdInParams } from '../validations/users-management-validations';
import { headerValidationModel } from "../validations/common-validations";
import { getAllCompanyParams } from '../validations/companies-validations';

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new FaultInformationController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = '/fault-information';
    let baseUrl = "/companies/{companyId}";

    server.route([
        {
            method: 'POST',
            path: '/' + version +  resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create fault info Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    //params: usnInParamsValidationObj,
                    payload: createMeterDataParameterValidationObj,
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
            method: 'GET',
            path: '/' + version + baseUrl+resourceName,
            options: {
                handler: controller.handleGetAllEntries,
                description: 'Create fault info Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: getAllCompanyParams,
                    params: companyIdValidationObj,
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
       
    ]);
}