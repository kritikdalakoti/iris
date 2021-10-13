import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import { idInParams,modeInQueryParams } from '../validations/generate-excelsheet-validations'
import ExcelSheetGenerationController from '../controllers/excelsheet-generation-controller';
var cron = require('node-cron');
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new ExcelSheetGenerationController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'generate-excel-sheet';
    let baseUrl = "/companies/{companyId}/";
    let id = "custom-report/{customReportId}/";
    let startDate = "start-date/{startDate}/";
    let endDate = "end-date/{endDate}/"
    server.route([

        {
            method: 'GET',
            path: '/' + version + baseUrl+ id +startDate+endDate+resourceName,
            options: {
                handler: controller.handleGetReport,
                description: 'Create create excel Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    params: idInParams,   
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
            path: '/' + version + "/run-daily-python-script",
            options: {
                handler: controller.handleRunPythonScript,
                description: 'Create get Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headerValidationModel,
                    query: modeInQueryParams,   
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


