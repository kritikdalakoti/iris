import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";
import { join } from "path";

export const createMeterDataParameterValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "hUsn": Joi.string().required(),
    "mUsn": Joi.string().required(),
    "values": Joi.array().required()
}).options({ allowUnknown: true })

export const getAllMeterDataParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "filters": Joi.object(),
});

export const getAllMeterDataParamsWithMinMax: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "min-max-avg": Joi.array().single(),
    "filters": Joi.object(),


});

export const getMeterDataParameterValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "hardwareUsn": Joi.string(),
    "meterUsn": Joi.string(),
    "location": Joi.string()
});

export const companyIdAndMeterIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "companyMeterId": Joi.number().required()
});

export const usnInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "hardwareUsn": Joi.string().required(),
    "meterUsn": Joi.string().required(),
    "values": Joi.array().required()

});

export const companyIdValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
});

export const customAnalysisQueryParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "parameters": Joi.array().single().required(),
    "interval": Joi.string().required(),
    "startDate": Joi.number().required(),
    "endDate": Joi.number().required(),
    "operations": Joi.array().single().required(),
    "shiftId":Joi.array().single()

});

export const customReportAnalyticsQueryParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "startDate": Joi.number().required(),
    "endDate": Joi.number().required(),
    "operations": Joi.array().single().required(),


});

