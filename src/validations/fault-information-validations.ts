import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";


export const getAllParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const companyIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
})

export const createFaultInfoValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "meterId": Joi.number().required(),
    "meterName":Joi.string().required(),
    "value": Joi.number().required(),
    "faultTime": Joi.date(),
    "minThreshold": Joi.number().required(),
    "maxThreshold": Joi.number().required(),
    "parameterName":Joi.string().required(),
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1),
    "shift":Joi.string().required(),
});

export const updateFaultInfoModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "meterId": Joi.number().required(),
    "meterName":Joi.string().required(),
    "value": Joi.number().required(),
    "faultTime": Joi.date(),
    "minThreshold": Joi.number().required(),
    "maxThreshold": Joi.number().required(),
    "parameterName":Joi.string().required(),
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1),
    "shift":Joi.string().required(),
 
});