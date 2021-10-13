import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const getAllShiftParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const createShiftModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({

    "name": Joi.string().required(),
    "startTime": Joi.string().required(),
    "endTime": Joi.string().required(),
    "isActive": Joi.number().default(1),
    "isDeleted": Joi.number().default(0)
});

export const updateShiftModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "name": Joi.string(),
    "startTime": Joi.string().required(),
    "endTime": Joi.string().required(),
    "isActive": Joi.number().default(1),
    "isDeleted": Joi.number().default(0)
});

export const companyIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.string(),
});

export const companyIdAndShiftIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "shiftId": Joi.number().required()

});