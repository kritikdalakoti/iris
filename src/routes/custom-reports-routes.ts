import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { companyIdAndUserIdInParamsValidtaionObj,companyIdAnduserIdAndCustomReportsIdInParamsValidationObj,getAllCustomReportsParams, companyIdAndCustomReportsIdInParamsValidationObj, companyIdInParamsValidtaionObj, createCustomReportsModelValidationObj, updateCustomReportsModelValidationObj } from '../validations/custom-reports-validation';
import CustomReportController from '../controllers/custom-report-controller';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0";
    const version2 = "v2.0.0"

    const controller = new CustomReportController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'custom-reports';
    let baseUrl = "/companies/{companyId}/";
    let id = "/{customReportId}";
    let user = "users/{userId}/";

    server.route([

        {
            method: 'POST',
            path: '/' + version + baseUrl + resourceName,
            options: {
                handler: controller.CreateCustomReportEntry,
                description: 'Create CustomeReport Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParamsValidtaionObj,
                    payload: createCustomReportsModelValidationObj,
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
            path: '/' + version + baseUrl + resourceName,
            options: {
                handler: controller.handleGetAllEntries,
                description: 'Get All Entries for CustomeReport',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParamsValidtaionObj,
                    query: getAllCustomReportsParams,
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
            path: '/' + version + baseUrl + resourceName + id,
            options: {
                handler: controller.handleUpdateEntry,
                description: 'update Single Entry of CustomeReport',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndCustomReportsIdInParamsValidationObj,
                    payload: updateCustomReportsModelValidationObj,
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
                description: 'Delete Single Entry of CustomeReport',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
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



        // {
        //     method: 'GET',
        //     path: '/' + version + baseUrl+resourceName + id,
        //     options: {
        //         handler: controller.handleGetSingleEntryForNormalFields,
        //         description: 'Get Single Entry for CustomeReport',
        //         tags: ['api'], // ADD THIS TAG
        //         auth: isAuthRequired,
        //         validate: {
        //             params: companyIdAndCustomReportsIdInParamsValidationObj,
        //             query: getAllCustomReportsParams,

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

        {
            method: 'POST',
            path: '/' + version2 + baseUrl +user+ resourceName,
            options: {
                handler: controller.CreateCustomReportEntry,
                description: 'Create CustomeReport Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndUserIdInParamsValidtaionObj,
                    payload: createCustomReportsModelValidationObj,
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
            path: '/' + version2 + baseUrl + user +resourceName,
            options: {
                handler: controller.handleGetAllSharedEntries,
                description: 'Get All Entries for CustomeReport',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndUserIdInParamsValidtaionObj,
                    query: getAllCustomReportsParams,
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
            path: '/' + version2 + baseUrl + user +resourceName + id,
            options: {
                handler: controller.handleUpdateEntry,
                description: 'update Single Entry of CustomeReport',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAnduserIdAndCustomReportsIdInParamsValidationObj,
                    payload: updateCustomReportsModelValidationObj,
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
            path: '/' + version2 + baseUrl + user+ resourceName + id,
            options: {
                handler: controller.hanldeDeleteEntry,
                description: 'Delete Single Entry of CustomeReport',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
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



    ]);
}