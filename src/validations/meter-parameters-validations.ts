import * as Joi from "joi";
import { RouteOptionsResponseSchema } from '@hapi/hapi';
import { ValidationsInterface } from "../interfaces/validations-interface";

export const getMeterParametersValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "sort": Joi.string(),
    "page": Joi.number().default(0),
    "size": Joi.number().default(10),
    "search": Joi.string(),
    "filters": Joi.object(),
  
});
export const meterIdInParamsValidtaionObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "meterId": Joi.string(),
})

export const meterIdAndMeterParameterIdInParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
    "meterId": Joi.number().required(),
    "meterParameterId": Joi.number().required(),
});
export const createMeterParametersModelParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
   
   "hexAddress":Joi.string().required(),
   "name":Joi.string().required(),
   "unit":Joi.string().required(),
   "decimalAddress":Joi.string(),
   "bitInterval":Joi.number(),
   "isActive" : Joi.number().default(1),
   "isDeleted":Joi.number().default(0),

});

export const updateMeterParametersModelParamsValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
   
    "hexAddress":Joi.string(),
    "name":Joi.string(),
    "unit":Joi.string(),
    "decimalAddress":Joi.string(),
    "bitInterval":Joi.number(),
    "isActive" : Joi.number().default(1),
    "isDeleted":Joi.number().default(0),
    });
    
    export const meterIdValidationObj: RouteOptionsResponseSchema = <RouteOptionsResponseSchema>Joi.object().keys({
        "meterId": Joi.number().required(),
    });