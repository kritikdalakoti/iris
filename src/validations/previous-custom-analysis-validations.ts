import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const userIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "userId": Joi.number().required(),
})

export const createDataModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
   "parameters":Joi.array().single().required(),
   "startDate": Joi.number().required(),
   "endDate": Joi.number().required(),
   "name": Joi.string().required(),
   "interval": Joi.string(),
   "operations":Joi.array().single().required(),
   "isDeleted" : Joi.number().default(0),
   "isActive" : Joi.number().default(1),
    "shiftId": Joi.array().single()
});