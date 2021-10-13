import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { husn,getAllCompanyMeterParams,husnAndMusnParamsValidationObj,companyIdAndMeterIdInParamsValidationObj, companyIdInParamsValidtaionObj, createCompanyMeterModelValidationObj,updateCompanyMeterModelValidationObj } from '../validations/company-meters-validations'
import CompanyMetersController from '../controllers/company-meters-controller';
import { headerValidationModel } from "../validations/common-validations";


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new CompanyMetersController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'company-meters';
    let baseUrl="/companies/{companyId}/";
    let id="/{companyMeterId}"

    server.route([

        {
            method: 'POST',
            path: '/' + version + baseUrl+ resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create CompanyMeter Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParamsValidtaionObj,
                    payload: createCompanyMeterModelValidationObj,
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
                description: 'Get All Entries for CompanyMeter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdInParamsValidtaionObj,
                    query: getAllCompanyMeterParams,
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
                description: 'Get Single Entry for CompanyMeter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndMeterIdInParamsValidationObj,
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
                description: 'update Single Entry of CompanyMeter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndMeterIdInParamsValidationObj,
                    payload: updateCompanyMeterModelValidationObj,
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
                description: 'Delete Single Entry of CompanyMeter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: companyIdAndMeterIdInParamsValidationObj,
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
            path: '/' + version +"/hardware-unique-serial-number/{hardwareUniqueSerialNumber}/meters",
            options: {
                handler: controller.handleGetAllEntriesByHardwareUsn,
                description: 'Get Single Entry for CompanyMeter',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: husn,
                    query: getAllCompanyMeterParams,

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
            path: '/' + version + "/hUsn/{hardwareUniqueSerialNumber}/meterUsn/{meterUniqueSerialNumber}",
            options: {
                handler: controller.handleGetSingleEntry,
                description: 'Get Single Entry for MeterData',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: husnAndMusnParamsValidationObj,
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