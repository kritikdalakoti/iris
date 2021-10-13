import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import NotificationServiceImpl from '../services/notification-serviceImpl';
import { CustomMessages } from '../classes/custom-messages';

export default class NotificationController {

    public globalVariables: AppGlobalVariableInterface;
    private notificationServiceImpl: NotificationServiceImpl;
    private externalUrls;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.notificationServiceImpl = new NotificationServiceImpl(server);
        this.externalUrls = this.globalVariables.externalUrls;
      
    }

    public async handleSendEmailEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {


            // let userEmail = "pratik.shinde@arraypointer.com";
            // let emailData = "helooooo";
            // let subject = "test";
            // let type = "Type1";

            console.log(request.payload);

            let userEmail = request.payload.toEmail;
            let emailData = request.payload.emailData;
            let subject = request.payload.subject;
            let type = "Type" + request.payload.templateType;

            console.log("Type", type, this.externalUrls[type]);

            response = await this.notificationServiceImpl.sendMail(userEmail, emailData, this.externalUrls[type], subject);

            console.log(response);

            // //
                 response = new Response(true, StatusCodes.OK, "Email Sent", {});
            // //
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }
   
    public async handleSendEmailWithAttachmentEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            console.log(request.payload);

            let userEmail = request.payload.toEmail;
            let emailData = request.payload.emailData;
            let subject = request.payload.subject;
            let type = "Type" + request.payload.templateType;
            let filePath = request.payload['filePath'];
            
            console.log("Type", type, this.externalUrls[type]);

            response = await this.notificationServiceImpl.sendMailWithAttachment(userEmail, emailData, this.externalUrls[type], subject,filePath);

            console.log(response);

            // //
                 response = new Response(true, StatusCodes.OK, "Email Sent", {});
            // //
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }
}