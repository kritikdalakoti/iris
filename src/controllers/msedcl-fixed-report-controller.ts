// import * as Hapi from '@hapi/hapi';
// import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
// import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
// import CommonController from './common-controller';
// import { DeleteStrategy } from '../classes/delete-strategy-enum';
// import { Response } from '../classes/response';
// import { StatusCodes } from '../classes/status-codes';
// import { DataPreparation } from '../classes/data-preparation';
// import { CustomMessages } from '../classes/custom-messages';
// import InfluxCrudServiceImpl from '../services/influx-crud-serviceImpl';
// import { key } from 'nconf';
// import * as moment from 'moment-timezone';
// var spawn = require("child_process").spawn;

// export default class MsedclFixedReportsController extends CommonController {

//     public globalVariables: AppGlobalVariableInterface;
//     public serviceImpl:CommonCrudServiceImpl;
//     public influxServiceImpl: InfluxCrudServiceImpl;
//     public companyMetersServiceImpl: CommonCrudServiceImpl;
//     public meterParamtersServiceImpl: CommonCrudServiceImpl;
//     public companyServiceImpl: CommonCrudServiceImpl;
//     public externalUrls;

//     public searchColumnName: string = ''
//     constructor(server: Hapi.Server) {
//         super(server);
//         this.globalVariables = server['app']['globalVariables'];
//         this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx);
//         super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_msedcl_reports', 't_msedcl_reports');
//         this.companyMetersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters', 't_company_meters');
//         this.meterParamtersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters', 't_meter_parameters');
//         this.companyServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_companies', 't_companies');
//         this.externalUrls = this.globalVariables.externalUrls;

//         super.size = 10;
//         super.page = 0;
//         super.deleteStrategy = DeleteStrategy.logicallyDelete;
//         super.searchColumnsArray = []
//         super.sortColumn = "fixed_report_id";
//         super.orderBy = "desc";
//         super.isDeleteConditionChecking = true;
//         super.isActiveConditionChecking = true;
//     }
//     public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

//         let response: Response;

//         try {

//             let obj = await DataPreparation.modifyPayloadObjAndParams(request.params, request.payload);

//             let payload = await DataPreparation.convertObjectsToStringsInPayload(obj);

//             response = await this.serviceImpl.createEntry(payload, []);

//         } catch (err) {

//             response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
//         }
//         return h.response(response).code(response.getStatusCode());
//     }

//     public async handleGetFixedReportsData(request: Hapi.Request, h: Hapi.ResponseToolkit) {

//         let response: Response;

//         try {

//             let parameters = ["Import Active energy", "Apparent energy"];
//             let parameterKeys = [];
//             let differenceParameters = ["kWh as per interval", "kVAh as per interval"];
//             let companyId = request.params['companyId'];
//             let msedclReportId = request.params['msedclReportId'];
//             let userId = request.params['userId'];
//             let startDateTime = request.params['startDate'] * 1000000;
//             let endDateTime = request.params['endDate'] * 1000000;
//             let measurementName = '"company-' + companyId + '"';

//             let reportCondition = {};
//             reportCondition['companyId'] = companyId;
//             reportCondition['msedclReportId'] = msedclReportId;
//             reportCondition['userId'] = userId;
//             let query = `SELECT * from t_msedcl_reports where shared_with::jsonb @> '[${reportCondition['userId']}]'::jsonb or user_id= ${reportCondition['userId']} and company_id = ${reportCondition['companyId']} and msedcl_report_id = ${reportCondition['msedclReportId']} and is_active = 1 and is_deleted = 0`; 
//             let queryResponse = await this.serviceImpl.rawQueryOnDb(query);

//             // let fixedReportDataResult = await this.serviceImpl.getSingleEntry(reportCondition);
//             // console.log("fixedReportData",fixedReportDataResult)
//             let fixedReportDataResult = queryResponse;
//             console.log("fixedReportData",fixedReportDataResult)
//             console.log("Object.keys(fixedReportDataResult['result'][0]).length",Object.keys(fixedReportDataResult['result']).length)

//             if (Object.keys(fixedReportDataResult['result']).length > 0) {
//             let fixedReportData = fixedReportDataResult['result'][0];
//             let meters = fixedReportData['meters'] != undefined ? fixedReportData['meters'] : [];
//             let headerColumns = [
//                 {
//                     "title": "",
//                     "key": "date",
//                     "span": 2
//                 },
//             ];

//             let dataColumns = [
//                 {
//                     "title": "Date",
//                     "key": "date",
//                     "span": 0
//                 },
//                 {
//                     "title": "Time",
//                     "key": "time",
//                     "span": 0
//                 },
//             ]
   
//             let aggregatedDataColumns = [
//                 {
//                     "title": "Date",
//                     "key": "date",
//                     "span": 0
//                 },
//                 {
//                     "title": "Time",
//                     "key": "time",
//                     "span": 0
//                 },
//             ];

//             let parametersString = "";
//             let keyArray = []; 
//             for (let i = 0; i < meters.length; i++) {

//                 let meterResponse = await this.companyMetersServiceImpl.getSingleEntry({ "companyMeterId": meters[i] });

//                 if (meterResponse.getIsSuccess()) {

//                     let parameterTempKeys = [];

//                     let hUsn = meterResponse['result']['hardwareUniqueSerialNumber'];
//                     let mUsn = meterResponse['result']['meterUniqueSerialNumber'];

//                     for (let j = 0; j < parameters.length; j++) {

//                         let parameterResponse = await this.meterParamtersServiceImpl.getSingleEntry({ "meterId": meterResponse['result']['meterId'], "name": parameters[j] });
//                         console.log("parameterResponse",parameterResponse)
//                         if (parameterResponse.getIsSuccess()) {

//                             let meterParamter = parameterResponse.getResult();
//                             let key = hUsn + ":" + mUsn + ":" + meterParamter['hexAddress'];
//                             parametersString = parametersString + 'last("' + key + '") as "last_of_' + key + '",' + 'difference(last("' + key + '")) as "diff_of_' + key + '",';
//                             keyArray.push("last_of_"+key);

//                             let obj = {
//                                 legend: meterParamter.name,
//                                 name: meterParamter.name,
//                                 title: meterParamter.name,
//                                 key: "last_of_" + key,
//                                 span: 0,
//                                 series: [],
//                             }

//                             dataColumns.push(obj);
//                             aggregatedDataColumns.push(obj);
                            

//                              let diffObj = {
//                                 legend: `meter ${i+1} ` + differenceParameters[j],
//                                 name:  differenceParameters[j],
//                                 title: differenceParameters[j],
//                                 key: "diff_of_" + key,
//                                 span: 0,
//                                 series: [],
//                             }

//                             dataColumns.push(diffObj);
//                             aggregatedDataColumns.push(diffObj);
//                             parameterTempKeys.push("diff_of_" + key);
//                             console.log("dataColumns",dataColumns[j],"aggregatedDataColumns",aggregatedDataColumns[j],"parameterTempKeys",parameterTempKeys[j])
//                         } else {
                         
//                             let obj = {
//                                 legend: parameters[j],
//                                 name: parameters[j],
//                                 title: parameters[j],
//                                 key: "temp_key",
//                                 span: 0,
//                                 series: [],
//                             }

//                             dataColumns.push(obj);

//                             let diffObj = {
//                                 legend: `meter ${i+1} ` + differenceParameters[j],
//                                 name:  differenceParameters[j],
//                                 title: differenceParameters[j],
//                                 key: "diff_of_" + key,
//                                 span: 0,
//                                 series: [],
//                             }

//                             dataColumns.push(diffObj);
//                             aggregatedDataColumns.push(diffObj);
//                             parameterTempKeys.push("diff_of_" + key);
//                         }
//                     }

//                     parameterKeys.push(parameterTempKeys);

//                     let headerObj = {
//                         "title": `${meterResponse['result']['name']} (meter ${i+1})`,
//                         "key": "",
//                         "span": 13,
//                         series: [],
//                     };

//                     headerColumns.push(headerObj);

//                     let kWhTillDate = {
//                     legend: `meter ${i+1} ` + "kWh till date",
//                     name: "kWh till date",
//                     title: "kWh till date",
//                     key: "kWh_till_date_" +i,
//                     span: 0,
//                     series: [],
//                     }

//                     let kvahTillDate = {
//                     legend: `meter ${i+1} ` + "kVah till date",
//                     name: "kVah till date",
//                     title: "kVah till date",
//                     key: "kVah_till_date_" + i,
//                     span: 0,
//                     series: [],
//                     }
//                     let dailyObj = {
//                     legend: `meter ${i+1} ` + "daily extra billing amount",
//                     name: "daily extra billing amount",
//                     title: "daily extra billing amount",
//                     key: "daily_extra_billing_amount_" + i,
//                     span: 0,
//                     series: [],
//                     }
                   
//                      let tillDateObj = {
//                     legend: `meter ${i+1} ` + "till date extra billing amount",
//                     name: "till date extra billing amount",
//                     title: "till date extra billing amount",
//                     key: "till_date_extra_billing_amount_" + i,
//                     span: 0,
//                     series: [],
//                     }
                    
//                     let dailyDiffObj = {
//                     legend: `meter ${i+1} ` + "daily diff",
//                     name: "daily diff",
//                     title: "daily diff",
//                     key: "daily_diff_" + i,
//                     span: 0,
//                     series: [],
//                     }

//                     let tillDateDiffObj = {
//                     legend: `meter ${i+1} ` + "till date diff",
//                     name: "till date diff",
//                     title: "till date diff",
//                     key: "till_date_diff_" + i,
//                     span: 0,
//                     series: [],
//                     }

//                     let unitRateObj = {
//                     legend: `meter ${i+1} ` + "unit rate",
//                     name: "unit rate",
//                     title: "unit rate",
//                     key: "unit_rate",
//                     span: 0,
//                     series: [],
//                     }
//                  dataColumns.push(kWhTillDate);
//                  dataColumns.push(kvahTillDate);
//                  dataColumns.push(dailyDiffObj);
//                  dataColumns.push(tillDateDiffObj);
//                  dataColumns.push(unitRateObj);
//                  dataColumns.push(dailyObj);
//                  dataColumns.push(tillDateObj);
                
//                  aggregatedDataColumns.push(kWhTillDate);
//                  aggregatedDataColumns.push(kvahTillDate);
//                  aggregatedDataColumns.push(dailyDiffObj);
//                  aggregatedDataColumns.push(tillDateDiffObj);
//                  aggregatedDataColumns.push(unitRateObj);
//                  aggregatedDataColumns.push(dailyObj);
//                  aggregatedDataColumns.push(tillDateObj);

//                 }

//             }
           
//             let interval = fixedReportData['interval'];

//             parametersString = parametersString.replace(/,\s*$/, "");
//             console.log("parametersString", parametersString)

//             let shiftIdArr = fixedReportData['shiftId'];

//             let query;
//             let shiftConditionQuery = " ";
//             let shiftArrLength = shiftIdArr.length;

//             if (shiftArrLength > 0) {

//                 for (let i = 0; i < shiftArrLength; i++) {

//                     if (i >= 1) {

//                         shiftConditionQuery = shiftConditionQuery + " " + "OR" + " ";

//                     }
//                     shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;
//                 }

//                 if (interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w") {
//                     switch (interval) {
//                         case "3h":

//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " and " + shiftConditionQuery + " group by time(" + interval + ",30m" + "),* fill(none)";

//                             break;
//                         case "6h":

//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " and " + shiftConditionQuery + " group by time(" + interval + ",30m" + "),* fill(none)"
//                             break;
//                         case "12h":

//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " and " + shiftConditionQuery + " group by time(" + interval + ",390m" + "),* fill(none)"
//                             break;
//                         case "24h":
//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " and " + shiftConditionQuery + " group by time(" + interval + ",-330m" + "),* fill(none)"
//                             break;
//                         case "1w":
//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " and " + shiftConditionQuery + " group by time(" + interval + ",5430m" + "),* fill(none)"
//                             break;
//                     }
//                 } else {

//                     query = "select " + parametersString + " from " + measurementName
//                         + " where time >= " + startDateTime + " and time <= " + endDateTime + " and " + shiftConditionQuery + " group by time(" + interval + ",30m" + "),* fill(none)"
//                 }
//             } else {

//                 if (interval === "3h" || interval === "6h" || interval === "12h" || interval === "24h" || interval === "1w") {
//                     switch (interval) {
//                         case "3h":

//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ",30m" + "),* fill(none)"
//                             break;
//                         case "6h":

//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ",30m" + "),* fill(none)"
//                             break;
//                         case "12h":

//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ",390m" + "),* fill(none)"
//                             break;
//                         case "24h":
//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ",-330m" + "),* fill(none)"
//                             break;
//                         case "1w":
//                             query = "select " + parametersString + " from " + measurementName
//                                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ",5430m" + "),* fill(none)"
//                             break;

//                     }
//                 }
//                 else {

//                     query = "select " + parametersString + " from " + measurementName
//                         + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ",30m" + "),* fill(none)"
//                 }
//             }

//             console.log(query);
//             let a = await this.influxServiceImpl.getAllEntries(query);

//             console.log("parameterKeys",parameterKeys);
//             for (let i = 0; i < a.length; i++) {

//                 let dateString = a[i]['time']['_nanoISO'];
//                 let date = moment(dateString).tz('Asia/Calcutta').format("DD-MM-YYYY");
//                 let time = moment(dateString).tz('Asia/Calcutta').format("HH:mm");

//                 a[i]['date'] = date;
//                 a[i]['time'] = time;
//                 a[i]['temp_key'] = 0;
//                 // a[i][keyArray[0]] = a[i][keyArray[0]] / 1000;
//                 // a[i][keyArray[1]] = a[i][keyArray[1]] / 1000;
        
//                 a[i][keyArray[0]] = a[i][keyArray[0]];
//                 a[i][keyArray[1]] = a[i][keyArray[1]];

//                 a[i]['unit_rate'] = fixedReportData['unitRate']
//                 for( let j = 0; j < meters.length; j++ ) {
            
//                     //  let c6 = (a[i][parameterKeys[j][0]] / 1000) ?? 0;
//                     //  let e6 = (a[i][parameterKeys[j][1]] / 1000) ?? 0;
//                     //  let g6 = (a[i][keyArray[0]] / 1000) ?? 0
//                     //  let i6 = (a[i][keyArray[1]] / 1000) ?? 0
             
//                      let c6 = a[i][parameterKeys[j][0]] ?? 0;
//                      let e6 = a[i][parameterKeys[j][1]] ?? 0;
//                      let g6 = a[i][keyArray[0]] ?? 0
//                      let i6 = a[i][keyArray[1]] ?? 0
//                      a[i]['daily_diff_'+j] = e6 - c6;
//                      a[i]['till_date_diff_'] = g6 - i6;
//                      a[i]["kWh_till_date_"+j] = (a[i][keyArray[0]] ?? 0) - (a[0][keyArray[0]] ?? 0);
//                      a[i]["kVah_till_date_"+j] = (a[i][keyArray[1]] ?? 0) - (a[0][keyArray[1]] ?? 0);
                
//                 // let c6 = a[i]['total_0'];
//                 // let g6 = a[i]['total_1'];
//                 a[i]["daily_extra_billing_amount_"+j] = fixedReportData['unitRate'] * a[i]['daily_diff_' + j];
//                 a[i]["till_date_extra_billing_amount_"+j] = fixedReportData['unitRate'] * a[i]['till_date_diff_'];
//                 }

     

//                 for (let x = 0; x < aggregatedDataColumns.length; x++) {
                    
//                     if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
//                         continue;
//                     let obj = {};
//                     obj['name'] = date + " " + time;
//                     obj['value'] = a[i][dataColumns[x]['key']];
//                     // console.log("a[i]",a[i]);
//                     // console.log("obj",obj);
//                     // console.log("dataColumns[x]",dataColumns[x]);
//                     // console.log("aggregatedDataColumns[x]",aggregatedDataColumns[x]);
//                     aggregatedDataColumns[x]['series'].push({...obj});

//                 }

//             }
           
//             let result = {
//                 name : fixedReportData['name'],
//                 dataColumns: dataColumns,
//                 dataList: a, 
//                 parameterKeys : parameterKeys,
//                 headerColumns : headerColumns,
//                 aggregatedDataColumns : aggregatedDataColumns
                
//             }
                
//             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);

//             } else {

//             response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, "Entry Not Present", {});
//             }
//         } catch (err) {

//             response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
//         }

//         return h.response(response).code(response.getStatusCode());
//     }
//     public async handleGetAllSharedEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

//         let response: Response;

//         try {

//             let size = request.query['size'] ? request.query['size'] : this.size;
//             let page = request.query['page'] ? request.query['page'] : this.page;
//             let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);

//             let condition = await DataPreparation.getNewObject(request.params);
//             let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
//             let rawWhereQuery = filterObj.rawQuery;
//             let finalArray = [];
//             condition = { ...condition, ...filterObj.condition };

//             let searchQuery = "true";

//             if (request.query['search']) {

//                 searchQuery = await DataPreparation.getSearchRawQuery(this.searchColumnsArray, request.query['search']);
//             }

//             if (this.isDeleteConditionChecking) {

//                 condition['isDeleted'] = 0;
//             }

//             if (this.isActiveConditionChecking) {

//                 condition['isActive'] = 1;
//             }
            
//             let query = `SELECT * from t_msedcl_reports where shared_with::jsonb @> '[${condition['userId']}]'::jsonb or user_id= ${condition['userId']} and company_id = ${condition['companyId']} and is_active = 1 and is_deleted = 0 limit ${size} offset ${page}`; 
//             let queryResponse = await this.serviceImpl.rawQueryOnDb(query);
//             console.log("queryResponse",queryResponse['result'])

//             let countQuery = `SELECT count(*) from t_msedcl_reports where shared_with::jsonb @> '[${condition['userId']}]'::jsonb or user_id= ${condition['userId']} and company_id = ${condition['companyId']} and is_active = 1 and is_deleted = 0`; 
//             let countQueryResponse = await this.serviceImpl.rawQueryOnDb(countQuery);
//             console.log("countQueryResponse",countQueryResponse['result'])

//             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, {});
//             response['result']['list'] = queryResponse['result'];
//             console.log("response",queryResponse)

//              response['result']['count'] = countQueryResponse['result'][0]['count'];
//         } catch (err) {

//             response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
//         }
//         return h.response(response).code(response.getStatusCode());
//     }

// //     public async genrateExcelSheet(request: Hapi.Request, h: Hapi.ResponseToolkit){
// //         let response: Response;

// //         try {

// //         let fixedReportResponse = await DataPreparation.externalApiCall(`http://localhost:50101/api/v1.0.0/companies/${request.params['companyId']}/users/${request.params['userId']}/fixed-report/${request.params['msedclReportId']}/start-date/${request.params['startDate']}/end-date/${request.params['endDate']}`,{})
// //         let result = fixedReportResponse['result'];
// //         let dataColumns = result['dataColumns'];
// //         let headerColumns = result['headerColumns'];
// //         let dataList = result['dataList'];
// //         let subHeaders = [];
// //         headerColumns[0]['span'] = 1;
// //         for(let i of dataColumns) {
// //             if (i['title'] != undefined) {

// //                 if (i['title'] != "Time") {
// //                     subHeaders.push({title:i['title']});

// //                 }
// //             }
// //         }

// //         let data = [];
// //         let obj = {};
// //         for( let i = 0; i < dataList.length; i++) {
// //             let arr = [];
            
// //             for( let j = 0; j < dataColumns.length; j++) {
              
// //                let a = dataColumns[j]['key'];
         
// //                 if( j== 0) {

// //                     arr[0] = dataList[i][a];
// //                 }
// //                 if( j==1) {

// //                     arr[0] = arr[0].concat(" ",dataList[i][a]);
// //                     obj['Date'] = arr[0];
// //                 } else {

// //                     if( isNaN(dataList[i][a]) == false ) {

// //                         arr[j] = dataList[i][a];
// //                      } else if( typeof dataList[i][a] == 'string' ) {
        
// //                         arr[j] = dataList[i][a];
// //                      } else {
        
// //                         arr[j] = 0;
// //                      } 

// //                 }
                    
// //             }
// //             arr.splice(1,1);
// //             data[i] = arr;
// //         }


// //         let excelObj = {};
// //         let alphabets = 
// //         ["A","B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
// //         "AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ",
// //         "BA","BB","BC","BD","BE","BF","BG","BH","BI","BJ","BK","BL","BM","BN","BO","BP","BQ","BR","BS","BT","BU","BV","BW","BX","BY","BZ",
// //         "CA","CB","CC","CD","CE","CF","CG","CH","CI","CJ","CK","CL","CM","CN","CO","CP","CQ","CR","CS","CT","CU","CV","CW","CX","CY","CZ",
// //         "DA","DB","DC","DD","DE","DF","DG","DH","DI","DJ","DK","DL","DM","DN","DO","DP","DQ","DR","DS","DT","DU","DV","DW","DX","DY","DZ",
// //         "EA","EB","EC","ED","EE","EF","EG","EH","EI","EJ","EK","EL","EM","EN","EO","EP","EQ","ER","ES","ET","EU","EV","EW","EX","EY","EZ",
// //         ];
// //         let colIndex = 0;

// //         for( let i = 0; i < headerColumns.length; i++) {

// //             if ( !headerColumns[i]['span'] ) {

// //                 headerColumns[i]['span'] = 1;
// //             }
// //             if( headerColumns[i]['span'] == 1 ) {

// //                 headerColumns[i]['isMerge'] = false;    
// //                 headerColumns[i]['cell'] =  alphabets[colIndex] + "22";
// //                 colIndex += 1;
// //             } else {

// //                 headerColumns[i]['isMerge'] = true;    
// //                 headerColumns[i]['cell'] = alphabets[colIndex] + "22" + ":" + alphabets[colIndex + headerColumns[i]['span'] -1 ] + "22";
// //                 colIndex += headerColumns[i]['span'];
// //             }
// //         }

// //         let chartObjPlotList = [];
// //         let chartObj = {};  
        
// //         for(let i = 0; i < subHeaders.length; i++) {
// //             console.log("subHeaders",subHeaders[i]);
// //             chartObj['marker'] = {'type': 'circle'};
// //             chartObj['smooth'] = true;

// //             if( subHeaders[i]['title'] != "Date") {

// //                 chartObj['name'] = subHeaders[i]['title'];
// //                 chartObj['values'] = "report!$"+alphabets[i]+"$"+"24:$"+alphabets[i]+"$"+(data.length + 24).toString();

// //             }
// //             chartObj['categories'] = "report!$"+"A"+"$"+"24:$"+"A"+"$"+(data.length + 24).toString();

// //             chartObjPlotList[i] = {...chartObj};
// //         }     
        
// //         excelObj['headers'] = headerColumns;
// //         excelObj['subHeaders'] = subHeaders;
// //         excelObj['data'] = data;
// //         excelObj['subHeadersStringArray'] = subHeaders.map( x => x.title);
// //         excelObj['chartDataPlot'] = chartObjPlotList;
// //         result = excelObj;
// //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
// //         } catch (err) {

// //             response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
// //         }

// //         return h.response(response).code(response.getStatusCode());
// //     }

// //       public  async handleRunPythonScriptOfFixedReport(request: Hapi.Request, h: Hapi.ResponseToolkit) {

// //         let condition = {};
// //         condition['isActive'] = 1;
// //         condition['isDeleted'] = 0;
// //         let companiesResponse = await this.companyServiceImpl.getAllEntries(condition,100000,0,"company_id asc","true","true");      

// //         let companies = companiesResponse.getResult()['list'];

// //         for( let i = 0; i < companies.length; i++) {

// //             let reportCondition = {};
// //             let companyName = companies[i]['companyName']
// //             reportCondition['companyId'] = companies[i]['companyId'];
// //             reportCondition['isActive'] = 1;
// //             reportCondition['isDeleted'] = 0;
// //             let reportsResponse = await this.serviceImpl.getAllEntries(reportCondition,1000000,0,"fixed_report_id asc","true","true");
// //             let reports = [];
// //             reports = reportsResponse.getResult()['list'];
// //             if (reports.length != undefined && reports.length > 0) {

// //             let finalReports = [];
// //             let finalReportObj = {};

// //             let checkDate = new Date(moment(new Date(), 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD 00:00:00')).getTime();
// //             // let checkDate = new Date(moment("2021-08-02", 'YYYY-MM-DD').startOf('month').format('YYYY-MM-DD 00:00:00')).getTime();

// //             let serverStartTime = ((checkDate / 1000) - 19800) * 1000;
// //             let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
// //             //  let reportEndDate = new Date(moment("2021-08-03", 'YYYY-MM-DD').subtract(1,'day').format('YYYY-MM-DD 23:59:59')).getTime()-19800;

// //             let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
// //             console.log("report lenght",reports.length);

// //             for( let k = 0; k < reports.length; k++ ) {
// //                 let isEmailEnabled = reports[k]['isEmailEnabled'];                  
// //                 if( isEmailEnabled == true) {

// //                     finalReportObj['reportData'] = reports[k];
// //                     finalReportObj['reportStartDate'] = serverStartTime;
// //                     finalReportObj['reportEndDate'] = serverEndTime;  
// //                     console.log("checkdate",serverStartTime,"rep end date",serverEndTime);
// //                     finalReports.push({...finalReportObj});                      
// //                 }
// //             }

// //             for (let j = 0; j < finalReports.length; j++) {
                
// //                 var process = await spawn('python3', [this.externalUrls['fixedReportPythonFilePath'], finalReports[j]['reportData']['companyId'], finalReports[j]['reportData']['userId'],finalReports[j]['reportData']['msedclReportId'],serverStartTime,serverEndTime],{ detached: true, stdio: 'ignore' });

// //             }
  
// //             for( let n = 0; n < finalReports.length; n++) {

// //                 let filePath ;

// //                 let obj = {

// //                 "toEmail":finalReports[n]['reportData']['emails'],
// //                 "subject": "msedcl fixed reports",
// //                 "templateType": 1,
// //                 "emailData": {"name":companyName,"mode":""}
// //                 }
// //                 console.log("finalReports[n]",finalReports[n])
// //                 filePath = this.externalUrls['fixedReportPath']+(finalReports[n]['reportData']['msedclReportId']).toString()+"-"+serverStartTime.toString()+".xlsx";
// //                 console.log("filePath",filePath)
// //                 obj['filePath'] = filePath;
    
// //              //  await DataPreparation.sendEmailWithAttachment(obj);
// //             }
// //             }

// //         }
     
// //         return true;
// //     }
//  }
