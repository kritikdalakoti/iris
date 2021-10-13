import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum';
import { StatusCodes } from '../classes/status-codes';
import { Response } from '../classes/response';
import InfluxCrudServiceImpl from '../services/influx-crud-serviceImpl';
import { DataPreparation } from '../classes/data-preparation';
import { CustomMessages } from '../classes/custom-messages';
import * as moment from 'moment-timezone';


export default class CustomReportController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    public influxServiceImpl: InfluxCrudServiceImpl;
    public companyMetersServiceImpl: CommonCrudServiceImpl;
    public meterParamsServiceImpl: CommonCrudServiceImpl;


    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_custom_reports','t_custom_reports');
        this.companyMetersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters','v_company_meters_data');
        this.meterParamsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters','t_meter_parameters');

        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = ['', '']
        super.sortColumn = "custom_report_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }


    public async CreateCustomReportEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let obj = await DataPreparation.modifyPayloadObjAndParams(request.params, request.payload);

            let payload = await DataPreparation.convertObjectsToStringsInPayload(obj);

            if(payload['mode'] == 'Daily') {
                
                let checkDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 00:00:00')).getTime();
                let serverStartTime = ((checkDate / 1000) - 19800) * 1000;
           
                let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
                let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
              
                payload['startDate'] = serverStartTime;
                payload['endDate'] = serverEndTime;
                console.log("payload",payload)
            } else if(payload['mode'] == 'Weekly') {
                
                let checkDate = new Date(moment(new Date()).subtract(7,'day').format('YYYY-MM-DD 00:00:00')).getTime();
                let serverStartTime = ((checkDate / 1000) - 19800) * 1000;
             
                let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
                let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
              
                payload['startDate'] = serverStartTime;
                payload['endDate'] = serverEndTime;
                console.log("payload",payload)
            } else if(payload['mode'] == 'Monthly') {
                
                let checkDate = new Date(moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD 00:00:00')).getTime()
                 let serverStartTime = ((checkDate / 1000) - 19800) * 1000;

                 let reportEndDate = new Date(moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
                 let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
          
                payload['startDate'] = serverStartTime;
                payload['endDate'] = serverEndTime;
                console.log("payload",payload)
            } 
            
            response = await this.serviceImpl.createEntry(payload, []);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleGetAllSharedEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let size = request.query['size'] ? request.query['size'] : this.size;
            let page = request.query['page'] ? request.query['page'] : this.page;
            let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);

            let condition = await DataPreparation.getNewObject(request.params);
            let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
            let rawWhereQuery = filterObj.rawQuery;
            let finalArray = [];
            condition = { ...condition, ...filterObj.condition };

            let searchQuery = "true";

            if (request.query['search']) {

                searchQuery = await DataPreparation.getSearchRawQuery(this.searchColumnsArray, request.query['search']);
            }

            if (this.isDeleteConditionChecking) {

                condition['isDeleted'] = 0;
            }

            if (this.isActiveConditionChecking) {

                condition['isActive'] = 1;
            }

            // let userId = condition['userId'];
            // delete condition['userId'];

            // response = await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery);
            // condition['userId'] = userId;
            // let reports = response['result']['list'];

            // for( let i = 0; i < reports.length; i++ ) {

            //     let query;

            //     if( reports[i]['isShared'] == 1) {

            //         query = `SELECT * FROM t_custom_reports WHERE (${userId} IN (${reports[i]['sharedWith']})) and company_id=${condition['companyId']} and custom_report_id=${reports[i]['customReportId']}`;
            //         console.log("query",query);
            //         let sharedResponse = await this.serviceImpl.rawQueryOnDb(query);
                   
            //         if( sharedResponse.getIsSuccess() ) {

            //             finalArray.push(sharedResponse['result']);
            //         }
            //     } else {

            //        let singleResponse = await this.serviceImpl.getSingleEntry(condition);
                   
            //        if( singleResponse.getIsSuccess() ) {

            //         finalArray.push(singleResponse['result']);

            //        }
            //     }
            // }
            // response['result'] = finalArray;
            // response['list'] = finalArray.length;


            let query = `SELECT * from t_custom_reports where shared_with::jsonb @> '[${condition['userId']}]'::jsonb or user_id= ${condition['userId']} and company_id = ${condition['companyId']} and is_active = 1 and is_deleted = 0 limit ${size} offset ${page}`; 
            let queryResponse = await this.serviceImpl.rawQueryOnDb(query);
          //  console.log("queryResponse",queryResponse['result'])

            let countQuery = `SELECT count(*) from t_custom_reports where shared_with::jsonb @> '[${condition['userId']}]'::jsonb or user_id= ${condition['userId']} and company_id = ${condition['companyId']} and is_active = 1 and is_deleted = 0`; 
            let countQueryResponse = await this.serviceImpl.rawQueryOnDb(countQuery);
          //  console.log("countQueryResponse",countQueryResponse['result'])

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, {});
            response['result']['list'] = queryResponse['result'];
            //console.log("response",queryResponse)

             response['result']['count'] = countQueryResponse['result'][0]['count'];
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    // public async handleGetSingleEntryForNormalFields(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {
    //         let result;

    //         let size = request.query['size'] ? request.query['size'] : 10;
    //         let page = request.query['page'] ? request.query['page'] : 0;
    //         let orderString = request.query['sort'] == undefined ? "ASC" : request.query['sort'];

    //         let condition = await DataPreparation.getNewObject(request.params);
    //         let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
                     

    //          condition = request.params;

    //         if (this.isDeleteConditionChecking) {

    //             condition['isDeleted'] = 0;
    //         }

    //         if (this.isActiveConditionChecking) {

    //             condition['isActive'] = 1;
    //         }

    //         result =  await this.serviceImpl.getSingleEntry(condition);
    //   //      console.log("companyId",result.getResult()['companyMeterId'])
    //         let companyMeterIds = [...new Set(result.getResult()['normalFields'].map(item => item.companyMeterId))];
    //         let measurements = [];

    //         for( let i = 0; i < companyMeterIds.length; i++) {

    //             measurements[i] =  `parameter_meter${companyMeterIds[i]}`
    //         }

    //         this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx, measurements);
           
    //         let finalObj = {};
    //         let finalObjList = [];

    //         filterObj['startDate'] = result.getResult()['startDate'];
    //         filterObj['endDate'] = result.getResult()['endDate'];
    //         filterObj['interval'] = result.getResult()['interval'];

    //         result = await this.influxServiceImpl.getNormalFields(size,page,orderString,filterObj,condition);
    //         let objList = result.getResult()['list'];

    //         for( let i = 0; i < objList.length; i++) {

    //             for( let j = i+1; j < objList.length -1; j++) {
                   
    //                 if( objList[i]['time']['_nanoISO'] ===objList[j]['time']['_nanoISO']) {
   
    //                     let obj1Keys = Object.keys(objList[i]);
    //                     let obj2Keys = Object.keys(objList[j]);

    //                     for( let k = 0; k < obj1Keys.length; k++) {

    //                         if(obj1Keys[k] != 'time' ) {

    //                          finalObj[`'${objList[i]['companyMeterId']}_${obj1Keys[k]}'`] = objList[i][obj1Keys[k]];
                            
    //                         }
                            
    //                     }

    //                     for( let k = 0; k < obj2Keys.length; k++) {

    //                         if(obj2Keys[k] != 'time' ) {

    //                          finalObj[`'${objList[j]['companyMeterId']}_${obj2Keys[k]}'`] = objList[j][obj2Keys[k]];
                            
    //                         }
                            
    //                     }
    //                     finalObj['time'] = objList[i]['time'];
    //                     console.log(finalObj);
    //                     finalObjList.push(finalObj);
                        
    //                 }
    //             }
    //         }
            
    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalObjList);
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }


}
