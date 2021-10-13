import { join } from 'path';
import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum'
import InfluxCrudServiceImpl from '../services/influx-crud-serviceImpl';
import { DataPreparation } from '../classes/data-preparation';
import { StatusCodes } from '../classes/status-codes';
import { Response } from '../classes/response';
import { CustomMessages } from '../classes/custom-messages';
const csvtojson = require('csvtojson');
import * as moment from 'moment-timezone';
import { random, values } from 'lodash';
const fs = require('fs');

export default class MeterDataController {

    public globalVariables: AppGlobalVariableInterface;
    public influxServiceImpl: InfluxCrudServiceImpl;
    public companyMetersServiceImpl: CommonCrudServiceImpl;
    public parameterServiceImpl: CommonCrudServiceImpl;
    public customReportServiceImpl: CommonCrudServiceImpl;
    public shiftServiceImpl: CommonCrudServiceImpl;
    public userServiceImpl: CommonCrudServiceImpl;
    public metersServiceImpl: CommonCrudServiceImpl;

    public measurementName;
    public measurementName2;

    constructor(server: Hapi.Server) {
        this.globalVariables = server['app']['globalVariables'];
        this.companyMetersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters', 'v_company_meters_data');
        this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx);
        this.parameterServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters', 't_meter_parameters');
        this.customReportServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_custom_reports', 't_custom_reports');
        this.shiftServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_shifts', 't_shifts');
        this.userServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users', 't_users');
        this.metersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meters', 't_meters');

    }

    public async handleCreateEntryInInflux(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {


            let flag = false;
            let metersCondition = {};
            metersCondition['hardwareUniqueSerialNumber'] = request.payload['hUsn'];
            metersCondition['meterUniqueSerialNumber'] = request.payload['mUsn'];
            let husn = request.payload['hUsn'];
            let musn = request.payload['mUsn'];


            let companyMeters = await this.companyMetersServiceImpl.getSingleEntry(metersCondition);


            if (!companyMeters.getIsSuccess()) {

                response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
                return h.response(response).code(response.getStatusCode());
            }

            let companyMetersData = companyMeters.getResult();
            let companyId = companyMetersData['companyId'];
            let measurementName = `company-${companyId}`;

            let fields = {};

           // let timestamp = new Date().getTime();
           
           let hr = new Date().getHours();
          // console.log(hr)
           let shiftId;
           let condition = {};
           condition['companyId'] = companyId;
         console.log("companyId",companyId)

           let shiftResultList = (await this.shiftServiceImpl.getAllEntries(condition,1000,0,"shift_id ASC","true","true")).getResult()['list'] 
          
         //  console.log(shiftResultList)
          condition['roleId'] = 0;
          let users =  (await this.userServiceImpl.getAllEntries(condition,1000,0,"user_id ASC","true","true")).getResult()['list'];
         // console.log(users)
          let userEmails = [];

          for( let i = 0; i < users.length; i++ ) {

            userEmails[i] = users[i]['email'];
          }

         // console.log(userEmails)
          for( let i = 0; i < shiftResultList.length; i++) {

            let startTime = shiftResultList[i]['startTime'];
            let endTime = shiftResultList[i]['endTime'];
            let startHr = startTime.split(":")[0];
            let endHr = endTime.split(":")[0];   
        //    console.log(hr,startHr,endHr)
            if(hr >= startHr && hr <= endHr ) {

                shiftId = shiftResultList[i]['shiftId'];
            }
        }
        
           let timestamp =  Date.parse(moment(new Date()).utc().format('YYYY-MM-DDTHH:mm:ss.SSS'));
 
           let companyMeterCondition = {};
           companyMeterCondition['isActive'] = 1;
           companyMeterCondition['isDeleted'] = 0;
           companyMeterCondition['hardwareUniqueSerialNumber'] = request.payload['hUsn'];
           companyMeterCondition['meterUniqueSerialNumber'] = request.payload['mUsn'];
           let comapnyMeterData = (await this.companyMetersServiceImpl.getSingleEntry(companyMeterCondition)).getResult();
         //  console.log("companyMeterParameters",comapnyMeterData);

           let companyMeterParameters = comapnyMeterData['meterParameters'];
           let a ;

           if( request.payload['values'].length > 0 ) {

            for ( let i = 0; i < request.payload['values'].length; i++ ) {

                let keyName = husn + ":" + musn + ":"+request.payload['values'][i]['hexAdd'];
           
                for( let j = 0; j < companyMeterParameters.length; j++ ) {

            //        if( (companyMeterParameters[j]['hexAddress'] == request.payload['values'][i]['hexAdd']) && (request.payload['values'][i]['value'] < companyMeterParameters[j]['minThresholdValue']  )){
                     
                            if('minThresholdValue' in companyMeterParameters[j] && 'maxThresholdValue' in companyMeterParameters[j]) {

                                if( companyMeterParameters[j]['hexAddress'] == request.payload['values'][i]['hexAdd'] &&  request.payload['values'][i]['value'] < companyMeterParameters[j]['minThresholdValue']){

                                    let msg = "min threshold Value is " + companyMeterParameters[j]['minThresholdValue'] + " and we get " +request.payload['values'][i]['value']+" for "+request.payload['values'][i]['hexAdd'];

                                    let obj = {

                                        "toEmail":userEmails,
                                        "subject": "alarm",
                                        "templateType": 2,
                                        "emailData": {"msg":msg}
                                    }

                                  await DataPreparation.sendEmail(obj);
                                  response = new Response(false, StatusCodes.OK, msg, false);
                            
                            
                                }  if(companyMeterParameters[j]['hexAddress'] == request.payload['values'][i]['hexAdd'] && request.payload['values'][i]['value'] > companyMeterParameters[j]['maxThresholdValue']){

                                    let msg = "max threshold Value is " + companyMeterParameters[j]['maxThresholdValue'] + " and we get " +request.payload['values'][i]['value']+" for "+request.payload['values'][i]['hexAdd'];
                                    console.log("max","companyMeterParameters[j]['hexAddress']",companyMeterParameters[j]['hexAddress'],"request.payload['values'][i]['value']",request.payload['values'][i]['value'],"companyMeterParameters[j]['maxThresholdValue']",companyMeterParameters[j]['maxThresholdValue'])
                                    let obj = {

                                        "toEmail":userEmails,
                                        "subject": "alarm",
                                        "templateType": 2,
                                        "emailData": {"msg":msg}
                                    }

                                    await DataPreparation.sendEmail(obj);
                                    response = new Response(false, StatusCodes.OK, msg, false);
                                }
                            }

                      if( companyMeterParameters[j]['hexAddress'] == request.payload['values'][i]['hexAdd'] && request.payload['values'][i]['value'] ) {
                            
                            // console.log("fields",fields)

                            fields[keyName] = request.payload['values'][i]['value'];
                            // console.log("fields[keyName]",request.payload['values'][i])

                            fields['shiftId'] = shiftId;

                            // console.log("fields",fields)

                        }                
                }
            }

          console.log("Company meters",companyMeters.getResult(),request.payload);

          a = await this.influxServiceImpl.createEntry(measurementName, timestamp, fields);
          console.log("response",a)

          if ( a.getIsSuccess() ) {

              let updateCondition = {};
              updateCondition['companyMeterId'] = comapnyMeterData['companyMeterId'];
              let companyMeterResponse = await this.companyMetersServiceImpl.updateEntry(updateCondition,{"lastUpdatedDateTime":new Date()}); 
              flag = true;
              
          }

          if(flag == true){
            response = new Response(true, StatusCodes.OK, "Success", {});
          } else {
            response = new Response(false, StatusCodes.NOT_ACCEPTABLE, "hex address not present", {});

            }
 
           } else {

            response = new Response(false, StatusCodes.NOT_ACCEPTABLE, "Please Pass Atleast one field", false);

           }

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    // public async handleGetCustomAnalysisEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {
        
    //     let response: Response;

    //     try {
    //         let companyId = request.params['companyId'];
    //         let parameters = request.query['parameters'];
    //         let startDateTime = request.query['startDate'] * 1000000;
    //         let endDateTime = request.query['endDate'] * 1000000;
    //         let measurementName = '"company-' + companyId + '"';
    //         let parametersString = "";
    //         let interval = request.query['interval'];

    //         let headerColumns = [
    //             {
    //                 "title": "",
    //                 "key": "date",
    //                 "span": 2
    //             },
    //             // {
    //             //     "title": "Time",
    //             //     "key": "time",
    //             //     "span": 0
    //             // },
    //         ];

    //         let aggregatedDataColumns = [
    //             {
    //                 "title": "Date",
    //                 "key": "date",
    //                 "span": 0
    //             },
    //             {
    //                 "title": "Time",
    //                 "key": "time",
    //                 "span": 0
    //             },
    //         ];

    //         let dataColumns = [
    //             {
    //                 "title": "Date",
    //                 "key": "date",
    //                 "span": 0
    //             },
    //             {
    //                 "title": "Time",
    //                 "key": "time",
    //                 "span": 0
    //             },
    //         ]

    //         for (let i = 0; i < parameters.length; i++) {

    //             let splitArrayForHexCode = parameters[i].split(":");
    //             let hexCode = splitArrayForHexCode[2];
    //             let hardwareUsn = splitArrayForHexCode[0];
    //             let meterUsn = splitArrayForHexCode[1]

    //             let meterCondition = {}
    //             meterCondition['hardwareUniqueSerialNumber'] = hardwareUsn;
    //             meterCondition['meterUniqueSerialNumber'] = meterUsn;
    //             let meterData = await this.companyMetersServiceImpl.getSingleEntryAsObject(meterCondition);
    //             let parameterCondition = {};
    //             parameterCondition['meterId'] = meterData['meterId'];
    //             parameterCondition['hexAddress'] = hexCode;
    //             let parameterData = await this.parameterServiceImpl.getSingleEntryAsObject(parameterCondition);
    //             let columnName = meterData['name'] + ":" + parameterData['name'];
    //             parametersString = parametersString + 'mean("' + parameters[i] + '") as "mean_of_' + parameters[i] + '",';
    //             parametersString = parametersString + 'max("' + parameters[i] + '") as "max_of_' + parameters[i] + '",';
    //             parametersString = parametersString + 'min("' + parameters[i] + '") as "min_of_' + parameters[i] + '",';
    //             parametersString = parametersString + 'last("' + parameters[i] + '") as "last_of_' + parameters[i] + '",';

    //             let meanObj = {
    //                 name: "Mean of " + columnName,
    //                 title: "Mean of " + columnName,
    //                 key: 'mean_of_' + parameters[i],
    //                 span: 0,
    //                 series: [],
    //             }

    //             let maxObj = {
    //                 name: "Max of " + columnName,
    //                 title: "Max of " + columnName,
    //                 key: 'max_of_' + parameters[i],
    //                 span: 0,
    //                 series: [],
    //             }

    //             let minObj = {
    //                 name: "Min Of " + columnName,
    //                 title: "Min Of " + columnName,
    //                 key: 'min_of_' + parameters[i],
    //                 span: 0,
    //                 series: [],
    //             }

    //             let lastObj = {
    //                 name: columnName,
    //                 title: columnName,
    //                 key: 'last_of_' + parameters[i],
    //                 span: 0,
    //                 series: [],
    //             }

    //             let headerObj = {
    //                 "title": columnName,
    //                 "key": "",
    //                 "span": 4,
    //                 series: [],
    //             };

    //             aggregatedDataColumns.push(meanObj);
    //             aggregatedDataColumns.push(maxObj);
    //             aggregatedDataColumns.push(minObj);
    //             aggregatedDataColumns.push(lastObj);

    //             dataColumns.push(lastObj);
    //             headerColumns.push(headerObj);

    //             // aggregatedGraph.push(meanObj);
    //             // aggregatedGraph.push(maxObj);
    //             // aggregatedGraph.push(minObj);
    //             // dataGraph.push(lastObj);
    //         }

    //         parametersString = parametersString.replace(/,\s*$/, "");

    //         let query = "select " + parametersString + " from " + measurementName
    //             + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ")"

    //         let a = await this.influxServiceImpl.getAllEntries(query);
    //         for (let i = 0; i < a.length; i++) {

    //             let dateString = a[i]['time']['_nanoISO'];
    //             let date = moment(dateString).format("DD-MM-YYYY")
    //             let time = moment(dateString).format("HH:mm A")

    //             a[i]['date'] = date;
    //             a[i]['time'] = time;

    //             for (let x = 0; x < dataColumns.length; x++) {

    //                 if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
    //                     continue;

    //                 let obj = {};
    //                 obj['name'] = date + " " + time;
    //                 obj['value'] = a[i][dataColumns[x]['key']];
    //                 dataColumns[x]['series'].push(obj);
    //             }
                
    //             for (let x = 0; x < aggregatedDataColumns.length; x++) {

    //                 if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
    //                     continue;

    //                 let obj = {};
    //                 obj['name'] = date + " " + time;
    //                 obj['value'] = a[i][aggregatedDataColumns[x]['key']];
    //                 aggregatedDataColumns[x]['series'].push(obj);
    //             }
    //         }
    //         let result = {
    //             dataColumns: dataColumns,
    //             aggregatedDataColumns: aggregatedDataColumns,
    //             headerColumns: headerColumns,
    //             dataList: a,
    //         }

    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }

    //     return h.response(response).code(response.getStatusCode());
    // }

      public async handleGetCustomAnalysisEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {
        
        let response: Response;

        try {

            let companyId = request.params['companyId'];
            let parameters = request.query['parameters'];
            let startDateTime = request.query['startDate'] * 1000000;
            let endDateTime = request.query['endDate'] * 1000000;
            let measurementName = '"company-' + companyId + '"';
            let parametersString = "";
            let interval = request.query['interval'];
            let operations = request.query['operations'];
            let shiftIdArr;
            console.log(request.query['shiftId'])
            if( request.query['shiftId'] != undefined ) {

                 shiftIdArr = request.query['shiftId'];

            }

            let name = "";
            let headerColumns = [
                {
                    "title": "",
                    "key": "date",
                    "span": 2
                },
                // {
                //     "title": "Time",
                //     "key": "time",
                //     "span": 0
                // },
            ];

            let aggregatedDataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ];

            let dataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ]

            for (let i = 0; i < parameters.length; i++) {

                let splitArrayForHexCode = parameters[i].split(":");
                let hexCode = splitArrayForHexCode[2];
                
                let hardwareUsn = splitArrayForHexCode[0];
                let meterUsn = splitArrayForHexCode[1]

                let meterCondition = {}
                meterCondition['hardwareUniqueSerialNumber'] = hardwareUsn;
                meterCondition['meterUniqueSerialNumber'] = meterUsn;
                
                let meterData = await this.companyMetersServiceImpl.getSingleEntryAsObject(meterCondition);
                let parameterCondition = {};
                parameterCondition['meterId'] = meterData['meterId'];
                parameterCondition['hexAddress'] = hexCode;
                console.log("parameterCondition",parameterCondition)

                let parameterData = await this.parameterServiceImpl.getSingleEntryAsObject(parameterCondition);
                console.log("parameterData",parameterData)
               // let columnName = meterData['name'] + ":" + parameterData['name'];
                let columnName = parameterData['name'];
                let headerName = meterData['name'] + ":" + parameterData['name'];

                if( name ==="" ) {

                    name = meterData['name'];

                } else if (name != meterData['name']) {
                    name = name + ":" + meterData['name'];
                }
                for (let l = 0; l < operations.length; l++) {

                        if( operations[l] == "mean" ) {

                            parametersString = parametersString + 'mean("' + parameters[i] + '") as "mean_of_' + parameters[i] + '",';

                            let meanObj = {
                                legend: meterData['name']+":"+"Average of " + columnName,
                                name: "Mean of " + columnName,
                                title: "Average of " + columnName,
                                key: 'mean_of_' + parameters[i],
                                span: 0,
                                series: [],
                            }
                            aggregatedDataColumns.push({...meanObj});
                         //   dataColumns.push({...meanObj});
                            }
                  else  if (operations[l] == "max") {

                        parametersString = parametersString + 'max("' + parameters[i] + '") as "max_of_' + parameters[i] + '",';

                        let maxObj = {
                            legend: meterData['name']+":"+"Max of " + columnName,
                            name: "Max of " + columnName,
                            title: "Max of " + columnName,
                            key: 'max_of_' + parameters[i],
                            span: 0,
                            series: [],
                        }

                        aggregatedDataColumns.push(maxObj);

                    }

                    else if (operations[l] == "min") {

                        parametersString = parametersString + 'min("' + parameters[i] + '") as "min_of_' + parameters[i] + '",';

                        let minObj = {
                            legend: meterData['name']+":"+"Min of " + columnName,
                            name: "Min Of " + columnName,
                            title: "Min Of " + columnName,
                            key: 'min_of_' + parameters[i],
                            span: 0,
                            series: [],
                        }

                        aggregatedDataColumns.push(minObj);

                    }

                    // else if (operations[l] == "last") {

                    //     parametersString = parametersString + 'last("' + parameters[i] + '") as "last_of_' + parameters[i] + '",';

                    //     let lastObj = {
                    //         name: "Last Of " + columnName,
                    //         title: "Last Of  " + columnName,
                    //         key: 'last_of_' + parameters[i],
                    //         span: 0,
                    //         series: [],
                    //     }

                    //     aggregatedDataColumns.push(lastObj);

                    //     dataColumns.push(lastObj);
                    // }
    
                }
             
             

                let headerObj = {
                    "title": headerName,
                    "key": "",
                    "span": operations.length,
                    series: [],
                };

                headerColumns.push(headerObj);

            }

            parametersString = parametersString.replace(/,\s*$/, "");

            let query;
            let shiftConditionQuery = " ";
            let shiftArrLength;
            if( shiftIdArr != undefined ) {

                 shiftArrLength = shiftIdArr.length;

            } else {
                shiftArrLength = 0;
            }

                //  query = "select " + parametersString + " from " + measurementName
                // + " where time >= " + startDateTime + " and time <= " + endDateTime +" group by time(" + interval + ")"

                if( shiftArrLength > 0 ) {

                for ( let i = 0; i < shiftArrLength; i++ ) {

                    if( i >= 1) {
                        
                        shiftConditionQuery = shiftConditionQuery + " "+"OR" + " ";

                    }
                  //  console.log(shiftConditionQuery)
                    shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;

                }  
                    // query = "select " + parametersString + " from " + measurementName
                    // + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
               
                if( interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w"){
                    switch(interval) {
                        case "3h":
                            console.log("3h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
                        break;
                        case "6h":
                            console.log("6h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
                        break;
                        case "12h":
                            console.log("12h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",390m"+"),* fill(none)"
                        break;
                        case "24h":
                            console.log("24h")
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",-330m"+"),* fill(none)"
                        break;
                        case "1w":
                            console.log("1w")
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",5430m"+"),* fill(none)"
                        break;
                    }  
                } else {

                    query = "select " + parametersString + " from " + measurementName
                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"               
                }   

                } else {
                    console.log(interval)
                    if( interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w"){
                        switch(interval) {
                            case "3h":
                                console.log("3h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"
                            break;
                            case "6h":
                                console.log("6h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"
                            break;
                            case "12h":
                                console.log("12h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",390m"+"),* fill(none)"
                            break;
                            case "24h":
                                console.log("24h")
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",-330m"+"),* fill(none)"
                            break;
                            case "1w":
                                console.log("1w")
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime +" group by time(" + interval +",5430m"+"),* fill(none)"
                            break;

                        }  
                    }
                    else {

                        query = "select " + parametersString + " from " + measurementName
                        + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"        
                    }
               }
            console.log(query);
            let a = await this.influxServiceImpl.getAllEntries(query);
            for (let i = 0; i < a.length; i++) {

                let dateString = a[i]['time']['_nanoISO'];

               let date = moment(dateString).tz('Asia/Calcutta').format("DD-MM-YYYY");
               let time = moment(dateString).tz('Asia/Calcutta').format("HH:mm");

              // console.log("date",date,"time",time)
                a[i]['date'] = date;
                a[i]['time'] = time;

                for (let x = 0; x < dataColumns.length; x++) {

                    if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
                        continue;

                    let obj = {};
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][dataColumns[x]['key']];
                    dataColumns[x]['series'].push(obj);
                }
                
                for (let x = 0; x < aggregatedDataColumns.length; x++) {

                    if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
                        continue;

                    let obj = {};
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][aggregatedDataColumns[x]['key']];
                    aggregatedDataColumns[x]['series'].push(obj);

                }
            }
            let result = {
                name,
                dataColumns: dataColumns,
                aggregatedDataColumns: aggregatedDataColumns,
                headerColumns: headerColumns,
                dataList: a,
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }

        return h.response(response).code(response.getStatusCode());
    }

    // public async handleGetCustomReportsAnalytics(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let companyId = request.params['companyId'];
    //         let customReportId = request.params['customReportId'];

    //         let startDateTime = request.query['startDate'] * 1000000;
    //         let endDateTime = request.query['endDate'] * 1000000;
    //         let measurementName = '"company-' + companyId + '"';

    //         let reportCondition = {};
    //         reportCondition['companyId'] = companyId;
    //         reportCondition['customReportId'] = customReportId;
    //         let customReportData = await this.customReportServiceImpl.getSingleEntryAsObject(reportCondition)

    //         let headerColumns = [
    //             {
    //                 "title": "",
    //                 "key": "date",
    //                 "span": 2
    //             },
    //             // {
    //             //     "title": "Time",
    //             //     "key": "time",
    //             //     "span": 0
    //             // },
    //         ];

    //         let aggregatedDataColumns = [
    //             {
    //                 "title": "Date",
    //                 "key": "date",
    //                 "span": 0
    //             },
    //             {
    //                 "title": "Time",
    //                 "key": "time",
    //                 "span": 0
    //             },
    //         ];

    //         let dataColumns = [
    //             {
    //                 "title": "Date",
    //                 "key": "date",
    //                 "span": 0
    //             },
    //             {
    //                 "title": "Time",
    //                 "key": "time",
    //                 "span": 0
    //             },
    //         ]

    //         let parametersString = "";

    //         let length = customReportData['normalFields'].length;
    //         for (let i = 0; i < length; i++) {

    //             let obj = customReportData['normalFields'][i];
            
    //             let key = obj.key;
    //             let columnName = obj.name;
    //             parametersString = parametersString + 'mean("' + key + '") as "mean_of_' + key + '",';
    //             parametersString = parametersString + 'max("' + key + '") as "max_of_' + key + '",';
    //             parametersString = parametersString + 'min("' + key + '") as "min_of_' + key + '",';
    //             parametersString = parametersString + 'last("' + key + '") as "last_of_' + key + '",';

    //             let meanObj = {
    //                 name: "Mean of " + columnName,
    //                 title: "Mean of " + columnName,
    //                 key: 'mean_of_' + key,
    //                 span: 0,
    //                 series: [],
    //             }

    //             let maxObj = {
    //                 name: "Max of " + columnName,
    //                 title: "Max of " + columnName,
    //                 key: 'max_of_' + key,
    //                 span: 0,
    //                 series: [],
    //             }

    //             let minObj = {
    //                 name: "Min Of " + columnName,
    //                 title: "Min Of " + columnName,
    //                 key: 'min_of_' + key,
    //                 span: 0,
    //                 series: [],
    //             }

    //             let lastObj = {
    //                 name: columnName,
    //                 title: columnName,
    //                 key: 'last_of_' + key,
    //                 span: 0,
    //                 series: [],
    //             }

    //             let headerObj = {
    //                 "title": columnName,
    //                 "key": "",
    //                 "span": 4,
    //                 series: [],
    //             };
    //             aggregatedDataColumns.push({...meanObj});
    //             aggregatedDataColumns.push({...maxObj});
    //             aggregatedDataColumns.push({...minObj});
    //             aggregatedDataColumns.push({...lastObj});

    //             dataColumns.push({...lastObj});
    //             headerColumns.push({...headerObj});
    //         }

    //         let calculatedFieldLength = customReportData['calculatedFields'].length;

    //         for (let i = 0; i < calculatedFieldLength; i++) {

    //             let obj = {...customReportData['calculatedFields'][i]};
    //             obj['series'] = [];
    //             headerColumns.push(obj);

    //             let obj1 = {...customReportData['calculatedFields'][i]};
    //             obj1['series'] = [];                
    //             dataColumns.push(obj1);

    //             let obj2 = {...customReportData['calculatedFields'][i]};
    //             obj2['series'] = [];                
    //             aggregatedDataColumns.push(obj2);

    //         }

    //         let interval = customReportData['interval'];

    //         parametersString = parametersString.replace(/,\s*$/, "");

    //         let query = "select " + parametersString + " from " + measurementName
    //             + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ")"

    //         let a = await this.influxServiceImpl.getAllEntries(query);

    //         for (let i = 0; i < a.length; i++) {
    //             let dateString = a[i]['time']['_nanoISO'];
    //             let date = moment(dateString).format("DD-MM-YYYY")
    //             let time = moment(dateString).format("HH:mm A")

    //             a[i]['date'] = date;
    //             a[i]['time'] = time;


    //             for (let x = 0; x < calculatedFieldLength; x++) {

    //                 let obj = customReportData['calculatedFields'][x];
    //                 obj['span'] = 0;
    //                 let fieldValue = await this.getCalculatedField(obj, a[i]);
    //                 a[i][obj['key']] = fieldValue;
    //             }
                
    //             for (let x = 0; x < dataColumns.length; x++) {

    //                 if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
    //                     continue;

    //                 let obj = {};
                
    //                 obj['name'] = date + " " + time;
    //                 obj['value'] = a[i][dataColumns[x]['key']];
    //                 dataColumns[x]['series'].push({...obj});
    //             }
                
    //             for (let x = 0; x < aggregatedDataColumns.length; x++) {
                    
    //                 if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
    //                     continue;
    //                 let obj = {};
    //                 obj['name'] = date + " " + time;
    //                 obj['value'] = a[i][aggregatedDataColumns[x]['key']];
    //                // console.log( obj['value'] = a[i][aggregatedDataColumns[x]['key']]);
    //                 aggregatedDataColumns[x]['series'].push({...obj});

    //             }
    //         }
            
    //         let result = {
    //             dataColumns: dataColumns,
    //             aggregatedDataColumns: aggregatedDataColumns,
    //             headerColumns: headerColumns,
    //             dataList: a,
    //         }

    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }

    //     return h.response(response).code(response.getStatusCode());
    // }

      public async handleGetCustomReportsAnalytics(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {
            let name = "";
            let operations = request.query['operations'];
            let companyId = request.params['companyId'];
            let customReportId = request.params['customReportId'];

            let startDateTime = request.query['startDate'] * 1000000;
            let endDateTime = request.query['endDate'] * 1000000;
            let measurementName = '"company-' + companyId + '"';

            let reportCondition = {};
            reportCondition['companyId'] = companyId;
            reportCondition['customReportId'] = customReportId;
            let customReportData = await this.customReportServiceImpl.getSingleEntryAsObject(reportCondition)

            let headerColumns = [
                {
                    "title": "",
                    "key": "date",
                    "span": 2
                },
                // {
                //     "title": "Time",
                //     "key": "time",
                //     "span": 0
                // },
            ];

            let aggregatedDataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ];

            let dataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ]

            let parametersString = "";

            let length = customReportData['normalFields'].length;
            for (let i = 0; i < length; i++) {

                let obj = customReportData['normalFields'][i];
            
                let key = obj.key;
                // let columnName = obj.name;
                // let tempName =columnName.split(":");

                let columnNameFromObject = obj.name;
                let tempName = columnNameFromObject.split(":");
                let columnName = tempName[1];
                let headerName = obj.name;

                if( name ==="" ) {
        
                    name = tempName[0];
        
                } else if (name != tempName[0]) {
        
                    name = name + ":" + tempName[0];
                }
                for ( let l = 0; l < operations.length; l++ ) {
                   
                     parametersString = parametersString + 'mean("' + key + '") as "mean_of_' + key + '",';

                  
                        if( operations[l] == "mean" ) {
                   
                            let meanObj = {
                                legend:tempName[0]+":"+"Average Of " + columnName,
                                name: "Mean of " + columnName,
                                title: "Average of " + columnName,
                                key: 'mean_of_' + key,
                                span: 0,
                                series: [],
                            }
                        aggregatedDataColumns.push({...meanObj});
                     //   dataColumns.push({...meanObj});
                        }
                  
                     else if( operations[l] == "max") {

                        parametersString = parametersString + 'max("' + key + '") as "max_of_' + key + '",';

                        let maxObj = {
                            legend:tempName[0]+":"+"Max Of " + columnName,
                            name: "Max of " + columnName,
                            title: "Max of " + columnName,
                            key: 'max_of_' + key,
                            span: 0,
                            series: [],
                        }
                        aggregatedDataColumns.push({...maxObj});

                    }

                    else if( operations[l] == "min") {

                        parametersString = parametersString + 'min("' + key + '") as "min_of_' + key + '",';

                        let minObj = {
                            legend:tempName[0]+":"+"Min Of " + columnName,
                            name: "Min Of " + columnName,
                            title: "Min Of " + columnName,
                            key: 'min_of_' + key,
                            span: 0,
                            series: [],
                        }

                        aggregatedDataColumns.push({...minObj});

                    }

                    // else if( operations[l] == "last") {

                    //     parametersString = parametersString + 'last("' + key + '") as "last_of_' + key + '",';

                    //     let lastObj = {
                    //         name: "Last Of" + columnName,
                    //         title: "Last Of" + columnName,
                    //         key: 'last_of_' + key,
                    //         span: 0,
                    //         series: [],
                    //     }

                    //     aggregatedDataColumns.push({...lastObj});

                    //     dataColumns.push({...lastObj});
                    // }
                }

                let headerObj = {
                    "title": headerName,
                    "key": "",
                    "span": operations.length,
                    series: [],
                };
              
                headerColumns.push({...headerObj});
            }

            let calculatedFieldLength = customReportData['calculatedFields'].length;
            for (let i = 0; i < calculatedFieldLength; i++) {

                let obj = {...customReportData['calculatedFields'][i]};
                obj['series'] = [];
                headerColumns.push(obj);

                let obj1 = {...customReportData['calculatedFields'][i]};
                obj1['series'] = [];                
                dataColumns.push(obj1);

                let obj2 = {...customReportData['calculatedFields'][i]};
                obj2['series'] = [];
                obj2['legend'] = obj2['name'];     
                aggregatedDataColumns.push(obj2);
                 console.log("agg",aggregatedDataColumns[i])

            }

            let interval = customReportData['interval'];

            parametersString = parametersString.replace(/,\s*$/, "");

         //   console.log(customReportData['shiftId'])
            let shiftIdArr = customReportData['shiftId'];

          //  console.log(shiftIdArr)
            let query;
            let shiftConditionQuery = " ";
            let shiftArrLength = shiftIdArr.length;

            if( shiftArrLength > 0 ) {

               for ( let i = 0; i < shiftArrLength; i++ ) {

                    if( i >= 1) {
                        
                        shiftConditionQuery = shiftConditionQuery + " "+"OR" + " ";

                    }
                  //  console.log(shiftConditionQuery)
                    shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;

                }

                //   query = "select " + parametersString + " from " + measurementName
                // + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+ "("+shiftConditionQuery+")"+ " group by time(" + interval +",30m"+"),* fill(none)"
            
                if( interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w"){
                    switch(interval) {
                        case "3h":
                            console.log("3h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
                        break;
                        case "6h":
                            console.log("6h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
                        break;
                        case "12h":
                            console.log("12h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",390m"+"),* fill(none)"
                        break;
                        case "24h":
                            console.log("24h")
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",-330m"+"),* fill(none)"
                        break;
                        case "1w":
                            console.log("1w")
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",5430m"+"),* fill(none)"
                        break;
                    }  
                } else {

                    query = "select " + parametersString + " from " + measurementName
                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"               
                }   

                } else {
                    console.log(interval)
                    if( interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w"){
                        switch(interval) {
                            case "3h":
                                console.log("3h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"
                            break;
                            case "6h":
                                console.log("6h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"
                            break;
                            case "12h":
                                console.log("12h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",390m"+"),* fill(none)"
                            break;
                            case "24h":
                                console.log("24h")
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",-330m"+"),* fill(none)"
                            break;
                            case "1w":
                                console.log("1w")
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime +" group by time(" + interval +",5430m"+"),* fill(none)"
                            break;
    
                        }  
                    }
                    else {

                        query = "select " + parametersString + " from " + measurementName
                        + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"        
                    }
               }
            console.log(query);
            let a = await this.influxServiceImpl.getAllEntries(query);

            for (let i = 0; i < a.length; i++) {
                let dateString = a[i]['time']['_nanoISO'];
                // let date = moment(dateString).format("DD-MM-YYYY")
                // let time = moment(dateString).format("HH:mm A")

                let date = moment(dateString).tz('Asia/Calcutta').format("DD-MM-YYYY");
               let time = moment(dateString).tz('Asia/Calcutta').format("HH:mm");

                a[i]['date'] = date;
                a[i]['time'] = time;


                for (let x = 0; x < calculatedFieldLength; x++) {

                    let obj = customReportData['calculatedFields'][x];
                    obj['span'] = 0;
                 //    console.log(obj,a[i])
                    let fieldValue = await this.getCalculatedField(obj, a[i]);
                   //  console.log(fieldValue)
                    a[i][obj['key']] = fieldValue;
                }
                
                for (let x = 0; x < dataColumns.length; x++) {

                    if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
                        continue;

                    let obj = {};
                
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][dataColumns[x]['key']];
                   //  console.log("datacolobj",obj)
                    dataColumns[x]['series'].push({...obj});
                }
                
                for (let x = 0; x < aggregatedDataColumns.length; x++) {
                    
                    if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
                        continue;
                    let obj = {};
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][aggregatedDataColumns[x]['key']];
                   // console.log( obj['value'] = a[i][aggregatedDataColumns[x]['key']]);
                    aggregatedDataColumns[x]['series'].push({...obj});

                }
            }
            
            let result = {
                name,
                dataColumns: dataColumns,
                aggregatedDataColumns: aggregatedDataColumns,
                headerColumns: headerColumns,
                dataList: a,
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }

        return h.response(response).code(response.getStatusCode());
    }


    public async handleCreateEntryInInfluxByCsv(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            console.log("I am here");

            let csvFilePath = request.query['csvPath'];
            let hardwareUsn = request.query['hardwareUsn'];
            let meterUsn = request.query['meterUsn'];
            let companyId = request.query['companyId'];
            let measurementName = "company-" + companyId;

            if (hardwareUsn && meterUsn  && companyId) {

                csvtojson()
                    .fromFile(csvFilePath)
                    .then(async (json) => {

                        let length = json.length;

                        for (let i = 0; i < length; i++) {

                            let obj = json[i];
                       
                            let time = obj['Time'];
                            delete obj['Time'];
                            let keys = Object.keys(obj);

                            let fieldObj = {};

                            for (let x = 0; x < keys.length; x++) {

                                let value = obj[keys[x]];
                                let key = keys[x].replace(/['"]+/g, '');

                                if( key != "shiftId"){

                                    fieldObj[hardwareUsn + ":" + meterUsn + ":"+key] = parseFloat(value);
                                } else {
                                    fieldObj[key] = parseFloat(value);
                                }
            
                            }

                            let a = await this.influxServiceImpl.createEntry(measurementName, time, fieldObj);
                        }
                    })
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    
    // public async getCalculatedField(calculatedObj, actualDataObj) {

    //     let param = "mean_of_";
        
    //     switch (calculatedObj['type']) {

    //         case "P1+P2":
    //             console.log(actualDataObj[ param + calculatedObj['p1'] ] + actualDataObj[ param + calculatedObj['p2'] ])
    //             return actualDataObj[ param + calculatedObj['p1'] ] + actualDataObj[ param + calculatedObj['p2'] ];
    //         case "P1+C1":
    //             return actualDataObj[ param + calculatedObj['p1'] ] + parseFloat( calculatedObj['c1']);
    //         case "C1+C2":
    //             return parseFloat( calculatedObj['c1'] ) + parseFloat( calculatedObj['c2'] );
    //         case "P1*P2":
    //             return actualDataObj[ param + calculatedObj['p1'] ] * actualDataObj[ param + calculatedObj['p2'] ];
    //         case "P1*C1":
    //             return actualDataObj[ param + calculatedObj['p1'] ] * parseFloat( calculatedObj['c1'] );
    //         case "P1/P2":
    //             return actualDataObj[ param + calculatedObj['p1'] ] / actualDataObj[ param+ calculatedObj['p2'] ];
    //         case "P1/C1":
    //             return actualDataObj[ param + calculatedObj['p1'] ] / parseFloat( calculatedObj['c1'] );
    //         case "P1*C2":
    //             return actualDataObj[ param + calculatedObj['p1'] ] * parseFloat( calculatedObj['c2'] );
    //         case "P1/C2":
    //             return actualDataObj[ param + calculatedObj['p1'] ] / parseFloat( calculatedObj['c2'] );
    //         case "C1*C2":
    //             return parseFloat( calculatedObj['c1'] ) * parseFloat( calculatedObj['c2'] );
    //         case "C1/C2":
    //             return parseFloat( calculatedObj['c1'] ) / parseFloat( calculatedObj['c2'] );



    //     }
    // }

    public async getCalculatedField(calculatedObj, actualDataObj) {

        let param = "mean_of_";
        let tempAdd = 0;
        let tempMul = 1;
        let result = 0;
        let addOfArray1 = 0;
        let addOfArray2 = 0;
        let kw = 0;
        let kva = 0;
        let dpf = 0;
        let pf = 0;

        switch (calculatedObj['type']) {


            case "P1+P2+Pn":

                for( let i = 0; i < calculatedObj['multipleCalculations'].length; i++) {
      //              console.log("//",tempAdd);
                    
       //             console.log("for",actualDataObj[param + calculatedObj['multipleCalculations'][i]])
                    tempAdd = tempAdd + actualDataObj[param + calculatedObj['multipleCalculations'][i]];
                }
      //          console.log("finalResult",tempAdd)
                return tempAdd;

                case "P1*P2*Pn":

                    for( let i = 0; i < calculatedObj['multipleCalculations'].length; i++) {
                        console.log("for",actualDataObj[param + calculatedObj['multipleCalculations'][i]])
                        tempMul = tempMul * actualDataObj[param + calculatedObj['multipleCalculations'][i]];
                    }
       //             console.log("finalResult",tempMul)
                return tempMul;
        
                case "(P1+P2+Pn)/(P1+P2+Pn)":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
           //             console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
          //              console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 / addOfArray2;
           //         console.log("finalResult",result);

                return result;   
                
                case "(P1+P2+Pn)*(P1+P2+Pn)":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
          //              console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
            //            console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 * addOfArray2;
          //          console.log("finalResult",result);

                return result;   

                case "[sqrt(P1+P2+Pn)]/(P1+P2+Pn)":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
          //              console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
          //              console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = Math.sqrt(addOfArray1) / addOfArray2;
                    console.log("finalResult",result);

                return result;   

                case "(P1+P2+Pn)/[sqrt(P1+P2+Pn)]":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
            //            console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
             //           console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 / Math.sqrt(addOfArray2);
                    console.log("finalResult",result);

                return result;   

                case "sqrt[(P1+P2+Pn)/(P1+P2+Pn)]":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
             //           console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
                        console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 / (addOfArray2);
           //         console.log("finalResult",result);

                return Math.sqrt(result);

                // case "P1/P2":

                // return actualDataObj[ param + calculatedObj['p1'] ] / actualDataObj[ param+ calculatedObj['p2'] ];
    
                case "(P1+P2+Pn)/[sqrt(P1^2+P2^a+Pn)]":

                let a = 2;
                let powerResult = 1;

                for( let i = 0; i < calculatedObj['array1'].length; i++) {
                           
             //       console.log("arra1 loop",actualDataObj[param + calculatedObj['array1'][i]])
                    addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                }

                for( let i = 0; i < calculatedObj['array2'].length; i++) {
                    powerResult = 1;
                    console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                    for( let j = 0; j < a; j++) {

                        powerResult = powerResult * actualDataObj[param + calculatedObj['array2'][i]];

                    }
             //       console.log(powerResult)
                    addOfArray2 = addOfArray2 + powerResult;
                    a++;
                }
                console.log(addOfArray1,addOfArray2,Math.sqrt(addOfArray2))

                result = addOfArray1 + Math.sqrt(addOfArray2);

                return result;

            case "P1+P2":
                console.log(actualDataObj[ param + calculatedObj['p1'] ] + actualDataObj[ param + calculatedObj['p2'] ])
                return actualDataObj[ param + calculatedObj['p1'] ] + actualDataObj[ param + calculatedObj['p2'] ];
            case "P1+C1":
                return actualDataObj[ param + calculatedObj['p1'] ] + parseFloat( calculatedObj['c1']);
            case "C1+C2":
                return parseFloat( calculatedObj['c1'] ) + parseFloat( calculatedObj['c2'] );
            case "P1*P2":
                return actualDataObj[ param + calculatedObj['p1'] ] * actualDataObj[ param + calculatedObj['p2'] ];
            case "P1*C1":
                return actualDataObj[ param + calculatedObj['p1'] ] * parseFloat( calculatedObj['c1'] );
            case "P1/P2":
                return actualDataObj[ param + calculatedObj['p1'] ] / actualDataObj[ param+ calculatedObj['p2'] ];
            case "P1/C1":
                return actualDataObj[ param + calculatedObj['p1'] ] / parseFloat( calculatedObj['c1'] );
            case "P1*C2":
                return actualDataObj[ param + calculatedObj['p1'] ] * parseFloat( calculatedObj['c2'] );
            case "P1/C2":
                return actualDataObj[ param + calculatedObj['p1'] ] / parseFloat( calculatedObj['c2'] );
            case "C1*C2":
                return parseFloat( calculatedObj['c1'] ) * parseFloat( calculatedObj['c2'] );
            case "C1/C2":
                return parseFloat( calculatedObj['c1'] ) / parseFloat( calculatedObj['c2'] );
            case "realPower":
                console.log(actualDataObj[param + calculatedObj['volt']],actualDataObj[param+calculatedObj['current']],calculatedObj['pf']);         
             
                return 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']] * actualDataObj[param + calculatedObj['pf']];

             case "constantRealPower":
              
                return 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']] * parseFloat( calculatedObj['pf']);
                
            case "apparentPower":
                return 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']];            
            case "displacementPowerFactor":
                kw = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']] * actualDataObj[param + calculatedObj['pf']];
                
                 kva = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']];            
                return kw / kva;
            case "constantDisplacementPowerFactor":
              
                kw = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']] * parseFloat( calculatedObj['pf']);
                
                kva = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']];            
                return kw / kva;
            case "distortionPowerFactor":
                return 1 / Math.sqrt(1 + Math.pow(actualDataObj[param+calculatedObj['thd']],2));
            case "truePowerFactor":

                 kw = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']] * actualDataObj[param + calculatedObj['pf']];
                 kva = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']];            
                 dpf = kw /kva;
                 pf = 1 / Math.sqrt(1 + Math.pow(actualDataObj[param+calculatedObj['thd']],2));
                 return dpf *pf;
            case "constantTruePowerFactor":
                 kw = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']] * parseFloat( calculatedObj['pf']);
                 kva = 1.732 * (actualDataObj[param + calculatedObj['volt']] * Math.pow(10,-3)) * actualDataObj[param+calculatedObj['current']];            
                 dpf = kw /kva;
                 pf = 1 / Math.sqrt(1 + Math.pow(actualDataObj[param+calculatedObj['thd']],2));
                 return dpf *pf;
            case "reactivePower":
            //    console.log("actualDataObj[param+calculatedObj['volt']]",actualDataObj[param+calculatedObj['volt']],"actualDataObj[param+calculatedObj['sCurrent']]",actualDataObj[param+calculatedObj['current']],"Math.sin(Math.acos(parseFloat(calculatedObj['spf']))",Math.sin(Math.acos(actualDataObj[param + calculatedObj['pf']])));
                return 1.732 * (actualDataObj[param+calculatedObj['volt']] * Math.pow(10,3)) * actualDataObj[param+calculatedObj['current']] * Math.sin(Math.acos(actualDataObj[param + calculatedObj['pf']]));
            case "constantReactivePower":
            //    console.log("actualDataObj[param+calculatedObj['volt']]",actualDataObj[param+calculatedObj['volt']],"actualDataObj[param+calculatedObj['sCurrent']]",actualDataObj[param+calculatedObj['current']],"Math.sin(Math.acos(parseFloat(calculatedObj['spf']))",Math.acos(Math.cos(pf)))
                return 1.732 * (actualDataObj[param+calculatedObj['volt']] * Math.pow(10,3)) * actualDataObj[param+calculatedObj['current']] * Math.sin(Math.acos(parseFloat(calculatedObj['pf'])));
                
            case "(P1+P2+Pn)/C":

                for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                   // console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                    addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                    }
                return addOfArray1 / parseFloat( calculatedObj['c'] );
            }
            
        }

    public async handleGetDashboardEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = await DataPreparation.getNewObject(request.params);
            condition['isActive'] = 1;
            condition['isDeleted'] = 0;
            response = await this.companyMetersServiceImpl.getAllEntries(condition, 100, 0, "company_Id asc", "true", "true");
            let result = response.getResult();
            for (let i = 0; i < result['list'].length; i++) {

                let data = await this.createGraphAndTabularData(result['list'][i], request.query['startDate'], request.query['endDate']);
                result['list'][i]['graphTableData'] = data;
                delete result['list'][i]['meterParameters'];
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async createGraphAndTabularData(metersData, startDate, endDate) {

        try {

            let measurementName = '"company-' + metersData['companyId'] + '"';

            let headerColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ];

            let dataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ]
            let parameters = metersData['meterParameters'];
            let parametersString = "";
            let startDateTime = startDate * 1000000;
            let endDateTime = endDate * 1000000;;
            for (let i = 0; i < parameters.length; i++) {

                let key = metersData['hardwareUniqueSerialNumber'] + ":" +metersData['meterUniqueSerialNumber'] + ":" + parameters[i]['hexAddress'];
                let columnName = metersData['name'] + ":" + parameters[i]['name']
                 parametersString = parametersString + 'mean("' + key + '") as "mean_of_' + key + '",';
                // parametersString = parametersString + 'max("' + key + '") as "max_of_' + key + '",';
                // parametersString = parametersString + 'min("' + key + '") as "min_of_' + key + '",';
          //      parametersString = parametersString + 'last("' + key + '") as "last_of_' + key + '",';

                // let lastObj = {
                //     name: "Last Of" + columnName,
                //     title: "Last Of" + columnName,
                //     key: 'last_of_' + key,
                //     span: 0,
                //     series: [],
                // }

                let meanObj = {
                    name: "Mean Of" + columnName,
                    title: "Mean Of" + columnName,
                    key: 'mean_of_' + key,
                    span: 0,
                    series: [],
                }
                let headerObj = {
                    "title": columnName,
                    "key": "",
                    "span": 3,
                    series: [],
                };


                dataColumns.push(meanObj);
                headerColumns.push(headerObj);
            }

            let interval = '1h'
            parametersString = parametersString.replace(/,\s*$/, "");

            let query = "select " + parametersString + " from " + measurementName
                + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ")"

         //   console.log("query", query);

            let a = await this.influxServiceImpl.getAllEntries(query);

            for (let i = 0; i < a.length; i++) {
                let dateString = a[i]['time']['_nanoISO'];
                // let date = moment(dateString).format("DD-MM-YYYY")
                // let time = moment(dateString).format("HH:mm A")

                let date = moment(dateString).tz('Asia/Calcutta').format("DD-MM-YYYY");
               let time = moment(dateString).tz('Asia/Calcutta').format("HH:mm");

                a[i]['date'] = date;
                a[i]['time'] = time;

                for (let x = 0; x < dataColumns.length; x++) {

                    if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
                        continue;

                    let obj = {};
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][dataColumns[x]['key']];
                    dataColumns[x]['series'].push(obj);
                }

            }

            let result = {
                dataColumns: dataColumns,
                headerColumns: headerColumns,
                dataList: a,
            }

            return result;
        } catch (err) {

            console.log("err", err.message);
        }
    }
    public async handleGetCustomReportsAnalyticsForShared(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {
            let name = "";
            let operations = request.query['operations'];
            let companyId = request.params['companyId'];
            let customReportId = request.params['customReportId'];
            let userId = request.params['userId'];
            let startDateTime = request.query['startDate'] * 1000000;
            let endDateTime = request.query['endDate'] * 1000000;
            let measurementName = '"company-' + companyId + '"';

            let reportCondition = {};
            reportCondition['companyId'] = companyId;
            reportCondition['customReportId'] = customReportId;
           // let customReportData = await this.customReportServiceImpl.getSingleEntryAsObject(reportCondition)
        //   let reportData = await this.customReportServiceImpl.getSingleEntryAsObject(reportCondition)

           let sharedQuery = `SELECT * from t_custom_reports where shared_with::jsonb @> '[${userId}]'::jsonb or user_id= ${userId} and company_id = ${companyId} and custom_report_id = ${customReportId} and is_active = 1 and is_deleted = 0`; 
           console.log("sharedQuery",sharedQuery);
           let customReportData =  (await this.customReportServiceImpl.rawQueryOnDb(sharedQuery)).getResult()[0];
           console.log("customReportData",customReportData);

            let headerColumns = [
                {
                    "title": "",
                    "key": "date",
                    "span": 2
                },
                // {
                //     "title": "Time",
                //     "key": "time",
                //     "span": 0
                // },
            ];

            let aggregatedDataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ];

            let dataColumns = [
                {
                    "title": "Date",
                    "key": "date",
                    "span": 0
                },
                {
                    "title": "Time",
                    "key": "time",
                    "span": 0
                },
            ]

            let parametersString = "";

            let length = customReportData['normalFields'].length;
            for (let i = 0; i < length; i++) {

                let obj = customReportData['normalFields'][i];
            
                let key = obj.key;
                // let columnName = obj.name;
                // let tempName =columnName.split(":");

                let columnNameFromObject = obj.name;
                let tempName = columnNameFromObject.split(":");
                let columnName = tempName[1];
                let headerName = obj.name;

                if( name ==="" ) {
        
                    name = tempName[0];
        
                } else if (name != tempName[0]) {
        
                    name = name + ":" + tempName[0];
                }
                for ( let l = 0; l < operations.length; l++ ) {
                   
                     parametersString = parametersString + 'mean("' + key + '") as "mean_of_' + key + '",';

                  
                        if( operations[l] == "mean" ) {
                   
                            let meanObj = {
                                legend:tempName[0]+":"+"Average Of " + columnName,
                                name: "Mean of " + columnName,
                                title: "Average of " + columnName,
                                key: 'mean_of_' + key,
                                span: 0,
                                series: [],
                            }
                        aggregatedDataColumns.push({...meanObj});
                     //   dataColumns.push({...meanObj});
                        }
                  
                     else if( operations[l] == "max") {

                        parametersString = parametersString + 'max("' + key + '") as "max_of_' + key + '",';

                        let maxObj = {
                            legend:tempName[0]+":"+"Max Of " + columnName,
                            name: "Max of " + columnName,
                            title: "Max of " + columnName,
                            key: 'max_of_' + key,
                            span: 0,
                            series: [],
                        }
                        aggregatedDataColumns.push({...maxObj});

                    }

                    else if( operations[l] == "min") {

                        parametersString = parametersString + 'min("' + key + '") as "min_of_' + key + '",';

                        let minObj = {
                            legend:tempName[0]+":"+"Min Of " + columnName,
                            name: "Min Of " + columnName,
                            title: "Min Of " + columnName,
                            key: 'min_of_' + key,
                            span: 0,
                            series: [],
                        }

                        aggregatedDataColumns.push({...minObj});

                    }

                    // else if( operations[l] == "last") {

                    //     parametersString = parametersString + 'last("' + key + '") as "last_of_' + key + '",';

                    //     let lastObj = {
                    //         name: "Last Of" + columnName,
                    //         title: "Last Of" + columnName,
                    //         key: 'last_of_' + key,
                    //         span: 0,
                    //         series: [],
                    //     }

                    //     aggregatedDataColumns.push({...lastObj});

                    //     dataColumns.push({...lastObj});
                    // }
                }

                let headerObj = {
                    "title": headerName,
                    "key": "",
                    "span": operations.length,
                    series: [],
                };
              
                headerColumns.push({...headerObj});
            }

            let calculatedFieldLength = customReportData['calculatedFields'].length;
            for (let i = 0; i < calculatedFieldLength; i++) {

                let obj = {...customReportData['calculatedFields'][i]};
                obj['series'] = [];
                headerColumns.push(obj);

                let obj1 = {...customReportData['calculatedFields'][i]};
                obj1['series'] = [];                
                dataColumns.push(obj1);

                let obj2 = {...customReportData['calculatedFields'][i]};
                obj2['series'] = [];
                obj2['legend'] = obj2['name'];     
                aggregatedDataColumns.push(obj2);
                 console.log("agg",aggregatedDataColumns[i])

            }

            let interval = customReportData['interval'];

            parametersString = parametersString.replace(/,\s*$/, "");

         //   console.log(customReportData['shiftId'])
            let shiftIdArr = customReportData['shiftId'];

          //  console.log(shiftIdArr)
            let query;
            let shiftConditionQuery = " ";
            let shiftArrLength = shiftIdArr.length;

            if( shiftArrLength > 0 ) {

               for ( let i = 0; i < shiftArrLength; i++ ) {

                    if( i >= 1) {
                        
                        shiftConditionQuery = shiftConditionQuery + " "+"OR" + " ";

                    }
                  //  console.log(shiftConditionQuery)
                    shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;

                }

                //   query = "select " + parametersString + " from " + measurementName
                // + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+ "("+shiftConditionQuery+")"+ " group by time(" + interval +",30m"+"),* fill(none)"
            
                if( interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w"){
                    switch(interval) {
                        case "3h":
                            console.log("3h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
                        break;
                        case "6h":
                            console.log("6h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"
                        break;
                        case "12h":
                            console.log("12h")
    
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",390m"+"),* fill(none)"
                        break;
                        case "24h":
                            console.log("24h")
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",-330m"+"),* fill(none)"
                        break;
                        case "1w":
                            console.log("1w")
                            query = "select " + parametersString + " from " + measurementName
                                + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",5430m"+"),* fill(none)"
                        break;
                    }  
                } else {

                    query = "select " + parametersString + " from " + measurementName
                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+shiftConditionQuery+" group by time(" + interval +",30m"+"),* fill(none)"               
                }   

                } else {
                    console.log(interval)
                    if( interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w"){
                        switch(interval) {
                            case "3h":
                                console.log("3h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"
                            break;
                            case "6h":
                                console.log("6h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"
                            break;
                            case "12h":
                                console.log("12h")
        
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",390m"+"),* fill(none)"
                            break;
                            case "24h":
                                console.log("24h")
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",-330m"+"),* fill(none)"
                            break;
                            case "1w":
                                console.log("1w")
                                query = "select " + parametersString + " from " + measurementName
                                    + " where time >= " + startDateTime + " and time <= " + endDateTime +" group by time(" + interval +",5430m"+"),* fill(none)"
                            break;
    
                        }  
                    }
                    else {

                        query = "select " + parametersString + " from " + measurementName
                        + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval +",30m"+"),* fill(none)"        
                    }
               }
            console.log(query);
            let a = await this.influxServiceImpl.getAllEntries(query);

            for (let i = 0; i < a.length; i++) {
                let dateString = a[i]['time']['_nanoISO'];
                // let date = moment(dateString).format("DD-MM-YYYY")
                // let time = moment(dateString).format("HH:mm A")

                let date = moment(dateString).tz('Asia/Calcutta').format("DD-MM-YYYY");
               let time = moment(dateString).tz('Asia/Calcutta').format("HH:mm");

                a[i]['date'] = date;
                a[i]['time'] = time;


                for (let x = 0; x < calculatedFieldLength; x++) {

                    let obj = customReportData['calculatedFields'][x];
                    obj['span'] = 0;
                 //    console.log(obj,a[i])
                    let fieldValue = await this.getCalculatedField(obj, a[i]);
                   //  console.log(fieldValue)
                    a[i][obj['key']] = fieldValue;
                }
                
                for (let x = 0; x < dataColumns.length; x++) {

                    if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
                        continue;

                    let obj = {};
                
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][dataColumns[x]['key']];
                   //  console.log("datacolobj",obj)
                    dataColumns[x]['series'].push({...obj});
                }
                
                for (let x = 0; x < aggregatedDataColumns.length; x++) {
                    
                    if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
                        continue;
                    let obj = {};
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][aggregatedDataColumns[x]['key']];
                   // console.log( obj['value'] = a[i][aggregatedDataColumns[x]['key']]);
                    aggregatedDataColumns[x]['series'].push({...obj});

                }
            }
            
            let result = {
                name,
                dataColumns: dataColumns,
                aggregatedDataColumns: aggregatedDataColumns,
                headerColumns: headerColumns,
                dataList: a,
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }

        return h.response(response).code(response.getStatusCode());
    }

}

   
    // public async handleGetEntryForDashboard(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let result = {};

    //         let condition = await DataPreparation.getNewObject(request.params);

    //         let meterCondn = {};

    //         meterCondn = request.params;
    //         meterCondn['isActive'] = 1;
    //         meterCondn['isDeleted'] = 0;

    //         response = await this.companyMetersServiceImpl.getAllEntries(meterCondn, 100, 0, "company_Id asc", "true", "true");
    //         result = response.getResult();
    //         console.log(result['list'][0])
    //         for (let i = 0; i < result['list'].length; i++) {

    //             condition['companyMeterId'] = result['list'][i]['meterId'];
    //             this.measurementName = condition['companyMeterId'];
    //             this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx, ["parameter_meter" + this.measurementName]);

    //             result['list'][i]['timeseriesData'] = (await this.influxServiceImpl.getDataFromDashboard(100, 0, "ASC", condition)).getResult();

    //         }
    //         //   console.log(result['list'][1]['timeseriesData'])
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }



    // public async handleCreateEntryInInflux(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         response = await this.influxServiceImpl.createEntry(request.params,request.payload, []);

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }


    // public async handleGetEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let result = {};
    //         this.measurementName = request.params['companyMeterId'];
    //         this.measurementName2 = request.params['companyMeterId'];

    //         this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx, ["parameter_meter" + this.measurementName]);

    //         let size = request.query['size'] ? request.query['size'] : 10;
    //         let page = request.query['page'] ? request.query['page'] : 0;
    //         let orderString = request.query['sort'] == undefined ? "ASC" : request.query['sort'];

    //         let condition = await DataPreparation.getNewObject(request.params);
    //         let filterObj = await DataPreparation.getFilteredData(request.query['filters']);

    //         let meterCondition = {}
    //         meterCondition['companyId'] = request.params['companyId'];
    //         meterCondition['companyMeterId'] = request.params['companyMeterId']
    //         result = (await this.companyMetersServiceImpl.getSingleEntry(meterCondition)).getResult();
    //         let meterParameters = result['meterParameters'];

    //         response = await this.influxServiceImpl.getSingleEntry(size, page, orderString, filterObj, condition, meterParameters);
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }

    // public async handleGetAllEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let size = request.query['size'] ? request.query['size'] : 10;
    //         let page = request.query['page'] ? request.query['page'] : 0;
    //         let orderString = request.query['sort'] == undefined ? "ASC" : request.query['sort'];
    //         this.measurementName = request.params['companyMeterId'];
    //         this.measurementName2 = request.params['companyMeterId'];
    //         this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx, ["parameter_meter" + this.measurementName]);

    //         let condition = await DataPreparation.getNewObject(request.params);
    //         let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
    //         let aggregators = request.query['min-max-avg'];

    //         response = await this.influxServiceImpl.getAllEntryWithMinMax(size, page, orderString, condition, filterObj, aggregators);
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }
// }
