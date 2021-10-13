import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import {dashboardDataIdAndCompanyIdAndUserInParams,companyIdAndUserIdInParams,updateDashboardDataModelValidationObj, getAllDashboardDataParams, dashboardDataIdAndCompanyIdInParams,companyIdInParams, createDashboardDataModelValidationObj, dashboardDataIdInParams } from '../validations/dashboard-validations'
import CompaniesController from '../controllers/companies-controller';
import DashboardController from '../controllers/dashboard-controller';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v2.0.0"
    const controller = new DashboardController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'dashboard';
    let baseUrl="/companies/{companyId}/";
    let id="/{dashboardDataId}";
    let user = "users/{userId}/";

    server.route([

        {
            method: 'POST',
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Dashboard Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParams,
                    payload: createDashboardDataModelValidationObj,
                    
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
                handler: controller.handleGetAllDashboardDataEntries,
                description: 'Get All Entries for Dashboard',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: getAllDashboardDataParams,
                    params:companyIdInParams,
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
            method: 'DELETE',
            path: '/' + version + baseUrl + resourceName + id,
            options: {
                handler: controller.hanldeDeleteEntry,
                description: 'Delete Single Entry of Dashboard',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: dashboardDataIdAndCompanyIdInParams,
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
                description: 'update Single Entry of Dashboard',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: dashboardDataIdAndCompanyIdInParams,
                    payload: updateDashboardDataModelValidationObj,
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
            method: 'POST',
            path: '/' + version + baseUrl+ user + resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Dashboard Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndUserIdInParams,
                    payload: createDashboardDataModelValidationObj,
                    
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
            path: '/' + version + baseUrl+ user + resourceName,
            options: {
                handler: controller.handleGetAllDashboardDataEntriesForShared,
                description: 'Get All Entries for Dashboard',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: getAllDashboardDataParams,
                    params:companyIdAndUserIdInParams,
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
            method: 'DELETE',
            path: '/' + version + baseUrl + user+ resourceName + id,
            options: {
                handler: controller.hanldeDeleteEntry,
                description: 'Delete Single Entry of Dashboard',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: dashboardDataIdAndCompanyIdAndUserInParams,
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
            path: '/' + version + baseUrl+ user + resourceName + id,
            options: {
                handler: controller.handleUpdateEntry,
                description: 'update Single Entry of Dashboard',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: dashboardDataIdAndCompanyIdAndUserInParams,
                    payload: updateDashboardDataModelValidationObj,
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