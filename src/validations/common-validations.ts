import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const headerValidationModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object({
    authorization: Joi.string()
}).options({ allowUnknown: true })
export const getAllApiQueryParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const idInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "id": Joi.string().required(),
})

export const loginModel: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "mobile": Joi.string().required(),
    "password": Joi.string().required(),
});