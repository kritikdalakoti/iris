import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const createFixedReportsModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "shiftId":Joi.array().single(),
    "name" : Joi.string().required(),  
    "mode": Joi.array().single(),
    "interval":Joi.string().required(),
    "emails":Joi.array(),
    "isDeleted":Joi.number().default(0),
    "isActive":Joi.number().default(1),
    "meters":Joi.array().single(),
    "isEmailEnabled":Joi.number().default(0),
});

export const updateFixedReportsModelValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "shiftId":Joi.array().single(),
    "name" : Joi.string(),  
    "mode": Joi.array().single(),
    "interval":Joi.string(),
    "emails":Joi.array(),
    "isDeleted":Joi.number().default(0),
    "isActive":Joi.number().default(1),
    "meters":Joi.array().single(),
    "isEmailEnabled":Joi.number().default(0),
});

export const companyIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.string(),
});

// export const companyIdAndUserIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
//     "companyId": Joi.string(),
//     "userId":Joi.string(),
// });

export const companyIdAnduserIdAndFixedReportsIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "userId": Joi.number().required(),
    "fixedReportId": Joi.number().required()
});
export const getByStartAndEndDate: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "companyId": Joi.number().required(),
    "userId": Joi.number().required(),
    "fixedReportId": Joi.number().required(),
    "startDate": Joi.number().required(),
    "endDate": Joi.number().required(),

});