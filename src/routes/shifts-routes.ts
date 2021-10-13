import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { getAllShiftParams,companyIdAndShiftIdInParamsValidationObj, companyIdInParamsValidtaionObj, createShiftModelValidationObj,updateShiftModelValidationObj } from '../validations/shifts-validations'
import ShiftsController from '../controllers/shifts-controller';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new ShiftsController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'shifts';
    let baseUrl="/companies/{companyId}/";
    let id="/{shiftId}"
    server.route([

        {
            method: 'POST',
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Shift Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParamsValidtaionObj,
                    payload: createShiftModelValidationObj,
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
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleGetAllEntries,
                description: 'Get All Entries for Shift',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParamsValidtaionObj,
                    query: getAllShiftParams,
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
            path: '/' + version + baseUrl+resourceName + id,
            options: {
                handler: controller.handleGetSingleEntry,
                description: 'Get Single Entry for Shift',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndShiftIdInParamsValidationObj,
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
            path: '/' + version + baseUrl+ resourceName + id,
            options: {
                handler: controller.handleUpdateEntry,
                description: 'update Single Entry of Shift',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndShiftIdInParamsValidationObj,
                    payload: updateShiftModelValidationObj,
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


        {
            method: 'DELETE',
            path: '/' + version + baseUrl + resourceName + id,
            options: {
                handler: controller.hanldeDeleteEntry,
                description: 'Delete Single Entry of Shift',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndShiftIdInParamsValidationObj,
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