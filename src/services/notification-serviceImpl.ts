"use strict";
import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
var Handlebars = require('handlebars');
var fs = require('fs');
import * as request from 'request';
import { CustomMessages } from '../classes/custom-messages';
import * as Configs from "../configurations/";

let configurations = Configs.getConfigurations();

export default class NotificationServiceImpl {

    private globalVariables: AppGlobalVariableInterface;
    private mailTransporter;



    constructor(server: Hapi.Server) {

        this.globalVariables = <AppGlobalVariableInterface>server['app']['globalVariables'];
        this.mailTransporter = this.globalVariables.mailTransporter;

    }


    public async sendMail(to, emailData, template, subject) {

        let response: Response;

        try {
            console.log("---------",to,emailData,template,subject)
            Handlebars.registerHelper('encodeMyString', function (inputData) {
                return new Handlebars.SafeString(inputData);
            });

            let file = fs.readFileSync(template, 'utf8').toString();
            let temp = Handlebars.compile(file);
            let emailText = temp(emailData);
            let mailResponse = await this.sendMailUsingNodeMailer(to, emailText, subject);

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, mailResponse);
        } catch (err) {

            console.log(err);

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    public async sendMailWithAttachment(to, emailData, template, subject,filePath) {

        let response: Response;

        try {
            Handlebars.registerHelper('encodeMyString', function (inputData) {
                return new Handlebars.SafeString(inputData);
            });

            let file = fs.readFileSync(template, 'utf8').toString();
            let temp = Handlebars.compile(file);
            let emailText = temp(emailData);
            // let bitmap = fs.readFileSync(filePath);
            // let fileData = new Buffer(bitmap).toString('base64');

            let fileData =  filePath;
            let filename = filePath.replace(/^.*[\\\/]/, '');
            
            // let fileData = [];
            // let filename = [];

            // for( let i = 0; i < filePath.length; i++) {

            //  //   bitmap[i] =  fs.readFileSync(filePath[i]);

            //     fileData[i] =  filePath[i];
            //     console.log("filespath", filePath[i] )
            //     filename[i] = filePath[i].replace(/^.*[\\\/]/, '');
            // }

            let mailResponse = await this.sendMailWithAttachmentUsingNodeMailer(to, emailText, subject,filename,fileData);

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, mailResponse);
        } catch (err) {

            console.log(err);

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }
public async sendMailUsingNodeMailer(to, text, subject) {

        try {

            return await this.mailTransporter.sendMail({
                from: "pratik.shinde@arraypointer.com", // sender address
                to: to,
                subject: subject,
                html: text
            });

        } catch (err) {

            console.log("Error", err);
        }
    };

    public async sendMailWithAttachmentUsingNodeMailer(to, text, subject,filename,fileData) {

        try {
            

         //   let attachmentArray = [];
            let obj = {};

                obj['filename'] = filename;
                obj['path'] = fileData;
                let attachmentArray = {...obj};

            // for( let i = 0; i < filename.length; i++) {

            //     obj['filename'] = filename[i];
            //     obj['path'] = fileData[i];
            //     attachmentArray[i] = {...obj};
            // }
            console.log("attachmentArray",attachmentArray);

            return await this.mailTransporter.sendMail({
                from: "pratik.shinde@arraypointer.com", // sender address
                to: to,
                subject: subject,
                html: text,
              //  attachments: [{ filename: filename, content: fileData }],
                attachments: await attachmentArray
            });

        } catch (err) {

            console.log("Error", err);
        }
    };



}


