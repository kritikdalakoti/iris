import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum'
import { StatusCodes } from '../classes/status-codes';
const fs = require('fs');
const csvtojson = require('csvtojson');
import { Response } from '../classes/response';
import { resourceUsage } from 'process';


export default class MeterParametersController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    public serviceImpl
    public searchColumnName: string = 'meter_type'
    public metersServiceImpl: CommonCrudServiceImpl;
    public externalUrls;


    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters', 't_meter_parameters');
        this.metersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meters', 't_meters');
        this.externalUrls = this.globalVariables.externalUrls;
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = ['name', 'hex_address']
        // super.primaryKey = "meter_parameter_id";
        super.sortColumn = "decimal_address";
        // super.sortColumn = "meter_parameter_id";
        super.orderBy = "asc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }


    public async handleUploadFile(request: Hapi.Request, h: Hapi.ResponseToolkit) {
        let response: Response;
        const data = request.payload['file'];
        
        //console.log(data)
        let filepath;
        if (data) {

            const name = data.hapi.filename;
            const path =  this.externalUrls['excelUploadPath'] + name;
            filepath =path;
            const file = await fs.createWriteStream(path);

            file.on('error', (err) => console.error(err));

            data.pipe(file);

            data.on('end', async (err) => { 
                const ret = {
                    filename: data.hapi.filename,
                    headers: data.hapi.headers
                }
                return JSON.stringify(ret);
            })
        }
       let result = await this.handleExcelSheet(request.payload['meterId'],filepath);

       return result;
    }

public async handleExcelSheet(meterId: any, path:any) {

    let response: Response;
    let result ;

    try {

          const csvFilePath = path;
          let jsonObj = await csvtojson().fromFile(csvFilePath);

                //console.log(jsonObj);
                let length = jsonObj.length;
                
            for(let i = 0; i < length; i++) {
                    
                let task_obj = {
                        "name" : jsonObj[i]['name'],
                        "unit" : jsonObj[i]['unit'],
                        "hexAddress" : jsonObj[i]['hex_address'],
                        "bitInterval" : jsonObj[i]['bit_interval'],
                        "decimalAddress":jsonObj[i]['decimal_address'],
                        "meterId":meterId,
                        "isActive":1,
                        "isDeleted":0   
                    }
             
                let condition = {};
            
                condition['meterId'] = meterId;
                condition['isActive'] = 1;
                condition['isDeleted'] = 0;
                let parameter;
                response =  await this.metersServiceImpl.getSingleEntry(condition);

                if ( response.getIsSuccess() == true ) {

                    let getParameterCondition = {};
                    getParameterCondition['isActive'] = 1;
                    getParameterCondition['isDeleted'] = 0;
                    getParameterCondition['name'] = task_obj['name'];
                    getParameterCondition['meterId'] = meterId; 
                    getParameterCondition['hexAddress'] = task_obj['hexAddress'];
                    getParameterCondition['decimalAddress'] = task_obj['decimalAddress'];

                    parameter = await this.serviceImpl.getSingleEntry(getParameterCondition);
                  
                    if( parameter.getIsSuccess() == true) {

                        let updateCondition = {};
                        updateCondition['name'] = task_obj['name'];
                        updateCondition['meterId'] = meterId; 
                        updateCondition['hexAddress'] = task_obj['hexAddress'];
                        updateCondition['decimalAddress'] = task_obj['decimalAddress'];
                        //console.log("update",i,task_obj);
                       result = await this.serviceImpl.updateEntry(updateCondition,task_obj)
                
                    } else {
                      // console.log("create",i,task_obj)
                       result = await this.serviceImpl.createEntry(task_obj,[])
                       //console.log(result.getIsSuccess())
                    }

                    response =  new Response(true,StatusCodes.CREATED,"Data Uploaded Successfully",true);           
                    
                } else {
    
                    response =  new Response(false,StatusCodes.INTERNAL_SERVER_ERROR,"Meter Not Present",false);           

                }
     
            }        

    } catch (err) {

        response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
      }
    return response;
   }

}