import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import {getMeterParametersValidationObj,meterIdValidationObj,meterIdInParamsValidtaionObj,meterIdAndMeterParameterIdInParamsValidationObj,createMeterParametersModelParamsValidationObj, updateMeterParametersModelParamsValidationObj } from "../validations/meter-parameters-validations";
import MeterParametersController from '../controllers/meter-parameters-controller';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new MeterParametersController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'parameters';
    let baseUrl="/meters/{meterId}/";
    let id="/{meterParameterId}"
    server.route([

        {
            method: 'POST',
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create MeterParameters Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: meterIdInParamsValidtaionObj,
                    payload: createMeterParametersModelParamsValidationObj,
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
                description: 'Get All Entries for MeterParameters',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: meterIdInParamsValidtaionObj,
                    query: getMeterParametersValidationObj,
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
                description: 'Get Single Entry for MeterParameters',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: meterIdAndMeterParameterIdInParamsValidationObj,
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
                description: 'update Single Entry of MeterParameters',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: meterIdAndMeterParameterIdInParamsValidationObj,
                    payload: updateMeterParametersModelParamsValidationObj,
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
                description: 'Delete Single Entry of MeterParameters',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: meterIdAndMeterParameterIdInParamsValidationObj,
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
            method: 'POST',
            path: '/' + version + "/meter-id/{meterId}/upload-parameter-csv",
            options: {
                handler: controller.handleUploadFile,
                description: 'Create Meter Parameter Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                payload: {
                    output: 'stream',
                    parse: true,
                    allow: 'multipart/form-data',
                    multipart: true
                },
                validate: {
                    headers: headerValidationModel,
                    params: meterIdValidationObj,
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