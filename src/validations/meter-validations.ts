import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const meterIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "meterId": Joi.number(),
});

export const createMeterModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "modelName":Joi.string().required(),
    "manufacturingCompanyName":Joi.string().required(),
    "isActive" : Joi.number().default(1),
    "isDeleted":Joi.number().default(0)    

});

export const updateMeterModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "modelName":Joi.string(),
    "manufacturingCompanyName":Joi.string(),
    "isActive" : Joi.number().default(1),
    "isDeleted":Joi.number().default(0)  
});

export const getMeterParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
    
});