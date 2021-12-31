// import * as Hapi from '@hapi/hapi';
// import { StatusCodes } from "../classes/status-codes";
// import { Response } from "../classes/response";
// import { getByStartAndEndDate,companyIdInParamsValidtaionObj, createMsedclFixedReportsModelValidationObj, updateMsedclFixedReportsModelValidationObj,companyIdAnduserIdAndMsedclFixedReportsIdInParamsValidationObj } from '../validations/msedcl-fixed-report-validations'
// import MsedclFixedReportsController from '../controllers/msedcl-fixed-report-controller';
// import { headerValidationModel,getAllApiQueryParams} from "../validations/common-validations"
// import { companyIdAndUserIdInParams } from '../validations/dashboard-validations';
// export default function (server: Hapi.Server) {

//     const version = "v1.0.0"
//     const controller = new MsedclFixedReportsController(server);
//     server.bind(controller);
//     let isAuthRequired = false;
//     let resourceName = 'companies/{companyId}/users/{userId}/msedcl-fixed-report';
//     let baseUrl="/";
//     let id="/{msedclReportId}"
//     server.route([

//         {
//             method: 'POST',
//             path: '/' + version + baseUrl+ resourceName,
//             options: {
//                 handler: controller.handleCreateEntry,
//                 description: 'Create fixed-report Entry',
//                 tags: ['api'], // ADD THIS TAG
//                 auth: isAuthRequired,
//                 validate: {
//                     headers: headerValidationModel,
//                     params: companyIdAndUserIdInParams,
//                     payload: createMsedclFixedReportsModelValidationObj,
//                     failAction: async (request, h, err) => {

//                         if (err) {
//                             let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//                             return h.response(response).code(response.getStatusCode()).takeover();
//                         }

//                         return h.continue;
//                     }
//                 },
//                 plugins: {
//                     'hapi-swagger': {
//                         responses: {
//                             '201': [],
//                             '406': {
//                                 'description': 'Validation Error.'
//                             }
//                         }
//                     }
//                 }
//             }
//         },


//         {
//             method: 'GET',
//             path: '/' + version + baseUrl+ resourceName,
//             options: {
//                 handler: controller.handleGetAllSharedEntries,
//                 description: 'Get All Entries for fixed-report',
//                 tags: ['api'], // ADD THIS TAG
//                 auth: isAuthRequired,
//                 validate: {
//                     headers: headerValidationModel,
//                     params:companyIdAndUserIdInParams,
//                     query: getAllApiQueryParams,
//                     failAction: async (request, h, err) => {

//                         if (err) {
//                             let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//                             return h.response(response).code(response.getStatusCode()).takeover();
//                         }

//                         return h.continue;
//                     }
//                 },
//                 plugins: {
//                     'hapi-swagger': {
//                         responses: {
//                             '201': [],
//                             '406': {
//                                 'description': 'Validation Error.'
//                             }
//                         }
//                     }
//                 }
//             }
//         },


//         {
//             method: 'GET',
//             path: '/' + version + baseUrl+resourceName + id+"/start-date/{startDate}/end-date/{endDate}",
//             options: {
//                 handler: controller.handleGetFixedReportsData,
//                 description: 'Get Single Entry for fixed-report',
//                 tags: ['api'], // ADD THIS TAG
//                 auth: isAuthRequired,
//                 validate: {
//                     headers: headerValidationModel,
//                     params: getByStartAndEndDate,
//                     failAction: async (request, h, err) => {

//                         if (err) {
//                             let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//                             return h.response(response).code(response.getStatusCode()).takeover();
//                         }

//                         return h.continue;
//                     }
//                 },
//                 plugins: {
//                     'hapi-swagger': {
//                         responses: {
//                             '201': [],
//                             '406': {
//                                 'description': 'Validation Error.'
//                             }
//                         }
//                     }
//                 }
//             }
//         },


//         {
//             method: 'PUT',
//             path: '/' + version + baseUrl+ resourceName + id,
//             options: {
//                 handler: controller.handleUpdateEntry,
//                 description: 'update Single Entry of fixed-report',
//                 tags: ['api'], // ADD THIS TAG
//                 auth: isAuthRequired,
//                 validate: {
//                     headers: headerValidationModel,
//                     params: companyIdAnduserIdAndMsedclFixedReportsIdInParamsValidationObj,
//                     payload: createMsedclFixedReportsModelValidationObj,
//                     failAction: async (request, h, err) => {

//                         if (err) {
//                             let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//                             return h.response(response).code(response.getStatusCode()).takeover();
//                         }

//                         return h.continue;
//                     }
//                 },
//                 plugins: {
//                     'hapi-swagger': {
//                         responses: {
//                             '201': [],
//                             '406': {
//                                 'description': 'Validation Error.'
//                             }
//                         },
                        
//                     }
//                 }
//             }
//         },


//         {
//             method: 'DELETE',
//             path: '/' + version + baseUrl + resourceName + id,
//             options: {
//                 handler: controller.hanldeDeleteEntry,
//                 description: 'Delete Single Entry of fixed-report',
//                 tags: ['api'], // ADD THIS TAG
//                 auth: isAuthRequired,
//                 validate: {
//                     headers: headerValidationModel,
//                     params: companyIdAnduserIdAndMsedclFixedReportsIdInParamsValidationObj,
//                     failAction: async (request, h, err) => {

//                         if (err) {
//                             let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//                             return h.response(response).code(response.getStatusCode()).takeover();
//                         }

//                         return h.continue;
//                     }
//                 },
//                 plugins: {
//                     'hapi-swagger': {
//                         responses: {
//                             '201': [],
//                             '406': {
//                                 'description': 'Validation Error.'
//                             }
//                         }
//                     }
//                 }
//             }
//         },
//         // {
//         //     method: 'GET',
//         //     path: '/' + version + baseUrl+resourceName + id+"/start-date/{startDate}/end-date/{endDate}/genrate-msedcl-fixed-report-excelsheet",
//         //     options: {
//         //         handler: controller.genrateExcelSheet,
//         //         description: 'Get Single Entry for fixed-report',
//         //         tags: ['api'], // ADD THIS TAG
//         //         auth: isAuthRequired,
//         //         validate: {
//         //             headers: headerValidationModel,
//         //             params: getByStartAndEndDate,
//         //             failAction: async (request, h, err) => {

//         //                 if (err) {
//         //                     let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//         //                     return h.response(response).code(response.getStatusCode()).takeover();
//         //                 }

//         //                 return h.continue;
//         //             }
//         //         },
//         //         plugins: {
//         //             'hapi-swagger': {
//         //                 responses: {
//         //                     '201': [],
//         //                     '406': {
//         //                         'description': 'Validation Error.'
//         //                     }
//         //                 }
//         //             }
//         //         }
//         //     }
//         // },

//         // {
//         //     method: 'GET',
//         //     path: '/' + version + baseUrl+"run-msedcl-fixed-report-python-script",
//         //     options: {
//         //         handler: controller.handleRunPythonScriptOfFixedReport,
//         //         description: 'Get Single Entry for fixed-report',
//         //         tags: ['api'], // ADD THIS TAG
//         //         auth: isAuthRequired,
//         //         validate: {
//         //             headers: headerValidationModel,
//         //             failAction: async (request, h, err) => {

//         //                 if (err) {
//         //                     let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
//         //                     return h.response(response).code(response.getStatusCode()).takeover();
//         //                 }

//         //                 return h.continue;
//         //             }
//         //         },
//         //         plugins: {
//         //             'hapi-swagger': {
//         //                 responses: {
//         //                     '201': [],
//         //                     '406': {
//         //                         'description': 'Validation Error.'
//         //                     }
//         //                 }
//         //             }
//         //         }
//         //     }
//         // },



//     ]);
// }