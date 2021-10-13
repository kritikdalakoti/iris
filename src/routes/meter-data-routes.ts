import { companyIdAnduserIdAndCustomReportsIdInParamsValidationObj,companyIdAndCustomReportsIdInParamsValidationObj } from './../validations/custom-reports-validation';
import { usnInParamsValidationObj, customAnalysisQueryParams, customReportAnalyticsQueryParams } from './../validations/meter-data-validations';
import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { createMeterDataParameterValidationObj, companyIdValidationObj } from "../validations/meter-data-validations";
import MeterDataController from '../controllers/meter-data-controller';
import { companyIdAndUserIdInParams } from '../validations/users-management-validations';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new MeterDataController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = '/meter-data';
    let baseUrl = "/companies/{companyId}/companyMeters/{companyMeterId}";
    // let id="/{meterId}"

    server.route([
        {
            method: 'POST',
            path: '/' + version +  resourceName,
            options: {
                handler: controller.handleCreateEntryInInflux,
                description: 'Create MeterData Entry',
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
            path: '/' + version + "/companies/{companyId}/custom-analysis",
            options: {
                handler: controller.handleGetCustomAnalysisEntries,
                description: 'Create MeterData Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: customAnalysisQueryParams,
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


        {
            method: 'GET',
            path: '/' + version + "/companies/{companyId}/custom-reports/{customReportId}/analytics",
            options: {
                handler: controller.handleGetCustomReportsAnalytics,
                description: 'Create MeterData Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: customReportAnalyticsQueryParams,
                    params: companyIdAndCustomReportsIdInParamsValidationObj,
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
            path: '/' + version + "/upload-dummy-data",
            options: {
                handler: controller.handleCreateEntryInInfluxByCsv,
                description: 'Create MeterData Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    // params: companyIdAndMeterIdInParamsValidationObj,
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
            path: '/' + version + "/companies/{companyId}/dashboard",
            options: {
                handler: controller.handleGetDashboardEntries,
                description: 'Get Single Entry for MeterData',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: customReportAnalyticsQueryParams,
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
        {
            method: 'GET',
            path: '/' + version + "/companies/{companyId}/users/{userId}/custom-reports/{customReportId}/analytics",
            options: {
                handler: controller.handleGetCustomReportsAnalyticsForShared,
                description: 'Create MeterData Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: customReportAnalyticsQueryParams,
                    params: companyIdAnduserIdAndCustomReportsIdInParamsValidationObj,
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
        
        // {
        //     method: 'GET',
        //     path: '/' + version + baseUrl + resourceName,
        //     options: {
        //         handler: controller.handleGetEntry,
        //         description: 'Get Single Entry for MeterData',
        //         tags: ['api'], // ADD THIS TAG
        //         auth: isAuthRequired,
        //         validate: {
        //             params: companyIdAndMeterIdInParamsValidationObj,
        //             query: getAllMeterDataParams,

        //             failAction: async (request, h, err) => {

        //                 if (err) {
        //                     let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
        //                     return h.response(response).code(response.getStatusCode()).takeover();
        //                 }

        //                 return h.continue;
        //             }
        //         },
        //         plugins: {
        //             'hapi-swagger': {
        //                 responses: {
        //                     '201': [],
        //                     '406': {
        //                         'description': 'Validation Error.'
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // },

        // {
        //     method: 'GET',
        //     path: '/' + version + baseUrl + resourceName + "/aggregators",
        //     options: {
        //         handler: controller.handleGetAllEntry,
        //         description: 'Get Single Entry for MeterData',
        //         tags: ['api'], // ADD THIS TAG
        //         auth: isAuthRequired,
        //         validate: {
        //             params: companyIdAndMeterIdInParamsValidationObj,
        //             query: getAllMeterDataParamsWithMinMax,
        //             failAction: async (request, h, err) => {

        //                 if (err) {
        //                     let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
        //                     return h.response(response).code(response.getStatusCode()).takeover();
        //                 }

        //                 return h.continue;
        //             }
        //         },
        //         plugins: {
        //             'hapi-swagger': {
        //                 responses: {
        //                     '201': [],
        //                     '406': {
        //                         'description': 'Validation Error.'
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // },


    ]);
}