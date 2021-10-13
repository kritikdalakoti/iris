import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const getAllUserParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const createUserManagementModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "roleId" : Joi.number().required(),   
  //  "companyId" : Joi.number().required(),
    "email" : Joi.string().email().required(),
    "password" : Joi.string().required(),
    "name" : Joi.string().required(),
    "mobile" : Joi.string().required(),
    "isDeleted" : Joi.number().required().default(0),
    "isActive" : Joi.number().required().default(1),
    "isVerified" :Joi.number().required().default(0),
    "isEditDashboard": Joi.number().required().default(0),
    "forgotPasswordToken":Joi.string(),

});

export const updateUserManagementModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "roleId" : Joi.number(),   
    "email" : Joi.string(),
    "password" : Joi.string(),
    "name" : Joi.string(),
    "mobile" : Joi.string(),
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1),
    "isVerified" :Joi.number().default(0),
    "isEditDashboard": Joi.number().default(0),
    "forgotPasswordToken":Joi.string(),
});

export const getEmailAndPassword: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "email" : Joi.string().email().required(),
    "password" : Joi.string().required()
});
export const getEmail: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "email" : Joi.string().email().required(),
});

export const getPassword: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "password" : Joi.string().required()
});

export const companyIdAndUserIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId":Joi.number().required(),
    "userId" : Joi.number().required(),

});

export const companyIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId":Joi.number().required(),

});
