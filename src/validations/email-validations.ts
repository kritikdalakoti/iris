import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";


export const getAllApiQueryParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const createEmailValidationModel : RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "toEmail": Joi.array().single().allow("", null),
    "subject": Joi.string().allow("", null),
    "templateType": Joi.number().allow("", null),
    "emailData": Joi.object().allow("", null),
});

export const createEmaiWithAttachmentValidationModel : RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "toEmail": Joi.array().single().allow("", null),
    "subject": Joi.string().allow("", null),
    "templateType": Joi.number().allow("", null),
    "emailData": Joi.object().allow("", null),
    "filePath":Joi.any().allow("",null)
});

