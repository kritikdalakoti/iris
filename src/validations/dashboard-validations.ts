import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";


export const getAllDashboardDataParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const dashboardDataIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "dashboardDataId": Joi.number().required(),
});

export const dashboardDataIdAndCompanyIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "dashboardDataId": Joi.number().required(),
    
});

export const dashboardDataIdAndCompanyIdAndUserInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "dashboardDataId": Joi.number().required(),
    "userId": Joi.number().required(),

});

export const companyIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
})
export const companyIdAndUserIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "userId": Joi.number().required(),
})

export const createDashboardDataModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
   "parameters":Joi.array().single(),
   "startDate": Joi.number(),
   "endDate": Joi.number(),
   "interval": Joi.string().required(),
   "calculatedFields":Joi.array(),
   "normalFields":Joi.array(),
   "name": Joi.string().required(),
   "operations":Joi.array().single().required(),
   "isDeleted" : Joi.number().default(0),
   "isActive" : Joi.number().default(1),
    "shiftId" :Joi.array().single(),
    "isShared":Joi.number(),
});


export const updateDashboardDataModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "startDate": Joi.number(),
    "endDate": Joi.number(),
  
 });
