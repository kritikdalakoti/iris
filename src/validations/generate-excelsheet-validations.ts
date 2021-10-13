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

export const idInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.string().required(),
    "customReportId": Joi.string().required(),
    "startDate":Joi.number().required(),
    "endDate":Joi.number().required(),
})

export const modeInQueryParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "mode": Joi.string().required(),

})
