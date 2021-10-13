import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { getAllCompanyParams, companyIdInParams, createCompanyModelValidationObj,updateCompanyModelValidationObj, createCompanyAndUserModelValidationObj } from '../validations/companies-validations'
import CompaniesController from '../controllers/companies-controller';
import { headerValidationModel } from "../validations/common-validations"
export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new CompaniesController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'companies';
    let baseUrl="/";
    let id="/{companyId}"
    server.route([

        {
            method: 'POST',
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Company Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    payload: createCompanyModelValidationObj,
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
                description: 'Get All Entries for Company',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: getAllCompanyParams,
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
                description: 'Get Single Entry for Company',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParams,
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
                description: 'update Single Entry of Company',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParams,
                    payload: updateCompanyModelValidationObj,
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
                description: 'Delete Single Entry of Company',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParams,
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
            path: '/' + version + baseUrl+ resourceName + "/admin",
            options: {
                handler: controller.handleCreateEntryWithAdmin,
                description: 'Create Company With Admin Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    payload: createCompanyAndUserModelValidationObj,
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
            path: '/' + version + baseUrl+ "po-report",
            options: {
                handler: controller.handleGetAllPoReports,
                description: 'Get All Entries for Company',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: getAllCompanyParams,
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