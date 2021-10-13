import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/status-codes";
import { Response } from "../classes/response";
import NotificationController from '../controllers/notification-controller';
import {createEmailValidationModel,createEmaiWithAttachmentValidationModel} from '../validations/email-validations';
import { headerValidationModel } from "../validations/common-validations";

export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new NotificationController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'notification';
 
    const nodemailer = require("nodemailer");
    server.route([

        {
            method: 'POST',
            path: '/' + version + "/" + resourceName + "/" + "send-email",
            options: {
                handler: controller.handleSendEmailEntry,
                description: 'Send Email user',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    payload: createEmailValidationModel,
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
                path: '/' + version + "/" + resourceName + "/" + "send-email"+"/attachment",
                options: {
                    handler: controller.handleSendEmailWithAttachmentEntry,
                    description: 'Send Email user',
                    tags: ['api'], // ADD THIS TAG
                    auth: isAuthRequired,
                    validate: {
                        payload: createEmaiWithAttachmentValidationModel,
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
        }]);}  