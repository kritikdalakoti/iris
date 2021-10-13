import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum'
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { DataPreparation } from '../classes/data-preparation';

export default class CompanyMetersController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
   

    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters','v_company_meters_data');
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.physicallyDelete;
        super.searchColumnsArray = ['location', 'hardware_unique_serial_number','meter_unique_serial_number','name']
        super.sortColumn = "company_meter_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

    // public async handleGetAllEntriesByHardwareUsn(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let size = request.query['size'] ? request.query['size'] : this.size;
    //         let page = request.query['page'] ? request.query['page'] : this.page;
    //         let orderString = request.query['sort'] ? request.query['sort'] : (this.primaryKey + " " + this.orderBy);

    //         let condition = await DataPreparation.getNewObject(request.params);
    //         let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
    //         let rawWhereQuery = filterObj.rawQuery;

    //         condition = { ...condition, ...filterObj.condition };

    //         let searchQuery = "true";

    //         if (request.query['search']) {

    //             searchQuery = await DataPreparation.getSearchRawQuery(this.searchColumnsArray, request.query['search']);
    //         }

    //         if (this.isDeleteConditionChecking) {

    //             condition['isDeleted'] = 0;
    //         }

    //         if (this.isActiveConditionChecking) {

    //             condition['isActive'] = 1;
    //         }
    //         response =  await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery);

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }


      public async handleGetAllEntriesByHardwareUsn(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let size = request.query['size'] ? request.query['size'] : this.size;
            let page = request.query['page'] ? request.query['page'] : this.page;
            let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);

            let condition = await DataPreparation.getNewObject(request.params);
            let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
            let rawWhereQuery = filterObj.rawQuery;

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
            response =  await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery);
            let resultList = response.getResult()['list'];

            let finalObj = {};
            let finalObjList = [];
            let arr = [];

            for (let i = 0; i < resultList.length; i++) {
                let values = [];       
                finalObj['mUsn'] = resultList[i]['meterUniqueSerialNumber'];
              
            //    console.log(finalObj,resultList[i]['meterParameters'])
        
                for ( let j = 0; j < resultList[i]['meterParameters'].length; j++ ) {
                   
                    let hexAddress = resultList[i]['meterParameters'][j]['hexAddress'];
                    let bitInterval = resultList[i]['meterParameters'][j]['bitInterval'];
                    let decimalAddress = resultList[i]['meterParameters'][j]['decimalAddress'];
                   
                    values[j]=[hexAddress,bitInterval,decimalAddress];
                   // console.log(values);
                  
                }
                arr[i] = values;
                finalObj['parameters'] = arr[i];
             // console.log(finalObj);
                finalObjList.push({...finalObj});

            }
         //   console.log(finalObjList)
            response.getResult()['list'] = finalObjList;

                
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response.getResult()['list']).code(response.getStatusCode());
    }

    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let obj = await DataPreparation.modifyPayloadObjAndParams(request.params, request.payload);

            let payload = await DataPreparation.convertObjectsToStringsInPayload(obj);
            
            let result;
            result = await this.serviceImpl.createEntry(payload, []);

            if( result.getIsSuccess() ) {

                response = result;
            } else {

                response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, "husn and musn already present", result);
                
            }
            console.log(response);

            } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}
