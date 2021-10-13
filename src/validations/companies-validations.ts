import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";


export const getAllCompanyParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
});

export const companyIdInParams: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
})

export const createCompanyModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
      
    "companyName" : Joi.string().required(),
    "noOfUsers" :Joi.number().required(),
    "city" : Joi.string().required(),
    "state" : Joi.string().required(),
    "country" : Joi.string().required(),
    "address" : Joi.string().required(),   
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1) 
});
export const createCompanyAndUserModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
      
    "companyName" : Joi.string().required(),
    "noOfUsers" :Joi.number().required(),
    "city" : Joi.string().required(),
    "state" : Joi.string().required(),
    "country" : Joi.string().required(),
    "address" : Joi.string().required(),   
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1) ,
    
    "roleId" : Joi.number().required(),   
   // "companyId" : Joi.number().required(),
    "email" : Joi.string().email().required(),
    "password" : Joi.string().required(),
    "name" : Joi.string().required(),
    "mobile" : Joi.string().required(),
    "isEditDashboard": Joi.number().required().default(1)

});

export const updateCompanyModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyName" : Joi.string(),
    "noOfUsers" :Joi.number(),
    "city" : Joi.string(),
    "state" : Joi.string(),
    "country" : Joi.string(),
    "address" : Joi.string(),   
    "isDeleted" : Joi.number().default(0),
    "isActive" : Joi.number().default(1) 

});