import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const getAllCompanyMeterParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
   
});

export const createCompanyMeterModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "meterId":Joi.number().required(),   
    "location" : Joi.string(),
    "hardwareUniqueSerialNumber" :Joi.string().required(),
    "meterUniqueSerialNumber" :Joi.string().required(),
    "name": Joi.string().required(),
    "techniciansId":Joi.array(),
    "meterParameters":Joi.array(),
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1),
    "lastUpdatedDateTime":Joi.any() 
});

export const updateCompanyMeterModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "meterId":Joi.number(),   
    "location" : Joi.string(),
    "hardwareUniqueSerialNumber" :Joi.string(),
    "meterUniqueSerialNumber" :Joi.string(),
    "name": Joi.string(),
    "techniciansId":Joi.array(),
    "meterParameters":Joi.array(),
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1),
    "lastUpdatedDateTime":Joi.any() 


});

export const companyIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.string(),
});

export const husn: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "hardwareUniqueSerialNumber": Joi.string().required(),
});

export const companyIdAndMeterIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "companyMeterId": Joi.number().required()
   
});

export const husnAndMusnParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "hardwareUniqueSerialNumber": Joi.string().required(),
    "meterUniqueSerialNumber": Joi.string().required(),
});