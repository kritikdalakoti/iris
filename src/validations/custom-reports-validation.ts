import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const getAllCustomReportsParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
       
});

export const createCustomReportsModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "shiftId":Joi.array().single(),
    "name" : Joi.string().required(),  
    "mode": Joi.string().required(),
    "interval":Joi.string().required(),
    "typeOfGraph":Joi.number().required(),
    "normalFields":Joi.array().required(),
    "calculatedFields":Joi.array(),
    "emails":Joi.array(),
    "operations":Joi.array().required(),
    "isDeleted":Joi.number().default(0),
    "isActive":Joi.number().default(1),
    "isEmailEnabled":Joi.boolean(),
    "startDate":Joi.number(),
    "endDate":Joi.number(),
    "isShared":Joi.number().default(0)
});

export const updateCustomReportsModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "shiftId":Joi.array().single(),
    "name" : Joi.string(),  
    "mode": Joi.string(),
    "interval":Joi.string(),
    "typeOfGraph":Joi.number(),
    "normalFields":Joi.array().single(),
    "calculatedFields":Joi.array(),
    "emails":Joi.array().single(),
    "operations":Joi.array().single(),
    "isDeleted":Joi.number().default(0),
    "isActive":Joi.number().default(1),
    "isEmailEnabled":Joi.boolean(),
    "isShared":Joi.number().default(0),
    "sharedWith":Joi.array().single(),


});

export const companyIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.string(),
});

export const companyIdAndUserIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.string(),
    "userId":Joi.string(),
});
export const companyIdAndCustomReportsIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "customReportId": Joi.number().required()
   
});

export const companyIdAnduserIdAndCustomReportsIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "userId": Joi.number().required(),
    "customReportId": Joi.number().required()
   
});