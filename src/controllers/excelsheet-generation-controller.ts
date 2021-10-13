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
import { date } from 'joi';
var spawn = require("child_process").spawn;

export default class ExcelSheetGenerationController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    public influxServiceImpl: InfluxCrudServiceImpl;
    public meterParamsServiceImpl: CommonCrudServiceImpl;
    public companyServiceImpl: CommonCrudServiceImpl;
    public externalUrls;
    private userServiceImpl: CommonCrudServiceImpl;

    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_custom_reports','t_custom_reports');
        this.companyServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_companies','t_companies');
        this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx);
        this.meterParamsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters','t_meter_parameters');
        this.userServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users', 't_users');
        this.externalUrls = this.globalVariables.externalUrls;
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = ['', '']
        super.sortColumn = "excel_sheet_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

    public async handleGetReport(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {
            let name = "";
            let condition = {};
            let reportResult;

            condition['isActive'] = 1;
            condition['isDeleted'] = 0; 
            condition['companyId'] = request.params['companyId'];
            condition['customReportId'] = request.params['customReportId'];
            
            console.log("getReportId",request.params['customReportId'])
            
            reportResult =  (await this.serviceImpl.getSingleEntry(condition)).getResult();
           //  console.log(reportResult);
            let operations = reportResult['operations'];
            let companyId = reportResult['companyId'];
            let customReportId = reportResult['customReportId'];

            let startDateTime = request.params['startDate'] * 1000000;
            let endDateTime = request.params['endDate'] * 1000000;
            let measurementName = '"company-' + companyId + '"';

            let reportCondition = {};
            reportCondition['companyId'] = companyId;
            reportCondition['customReportId'] = customReportId;
            let customReportData = await this.serviceImpl.getSingleEntryAsObject(reportCondition)

            let headerColumns = [
                {
                    "title": "",
                    "key": "date",
                    "span": 1
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
                let headerName = obj.name;;

                if( name ==="" ) {
        
                    name = tempName[0];
        
                } else if (name != tempName[0]) {
        
                    name = name + ":" + tempName[0];
                }
                for ( let l = 0; l < operations.length; l++ ) {
                   
                    parametersString = parametersString + 'mean("' + key + '") as "mean_of_' + key + '",';

                  
                    if( operations[l] == "mean") {

                        let meanObj = {
                            legend:tempName[0]+":"+"Average Of " + columnName,
                            name: "Mean of " + columnName,
                            title: "Average of " + columnName,
                            key: 'mean_of_' + key,
                            span: 0,
                            series: [],
                        }
                        aggregatedDataColumns.push({...meanObj});
                    //    dataColumns.push({...meanObj});
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

            }

            let interval = customReportData['interval'];

            parametersString = parametersString.replace(/,\s*$/, "");

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
            //         query = "select " + parametersString + " from " + measurementName
            //       + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+ "("+shiftConditionQuery+")"+ " group by time(" + interval +",30m" +"),* fill(none)"
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
            // let query = "select " + parametersString + " from " + measurementName
            //     + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ")"

             console.log(query)
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
                    let fieldValue = await this.getCalculatedField(obj, a[i]);
                    a[i][obj['key']] = fieldValue;
                }
                
                for (let x = 0; x < dataColumns.length; x++) {

                    if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
                        continue;

                    let obj = {};
                
                    obj['name'] = date + " " + time;
                    obj['value'] = a[i][dataColumns[x]['key']];
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
       //     console.log(name,dataColumns,aggregatedDataColumns,headerColumns,a)
            let result = {
                name,
                dataColumns: dataColumns,
                aggregatedDataColumns: aggregatedDataColumns,
                headerColumns: headerColumns,
                dataList: a
            }

            let finalResult;
         //   console.log("result",result)
            finalResult = await this.genrateExcelSheet(result);
          //  console.log("report final result", finalResult)
            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalResult);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }

        return h.response(response).code(response.getStatusCode());
    }

    // public async handleGetReport(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {
    //                let name = "";
    //         let condition = {};
    //         let reportResult;

    //         condition['isActive'] = 1;
    //         condition['isDeleted'] = 0; 
    //         condition['companyId'] = request.params['companyId'];
    //         condition['customReportId'] = request.params['customReportId'];
            
    //         console.log("getReportId",request.params['customReportId'])
            
    //         reportResult =  (await this.serviceImpl.getSingleEntry(condition)).getResult();
    //        //  console.log(reportResult);
    //         let operations = reportResult['operations'];
    //         let companyId = reportResult['companyId'];
    //         let customReportId = reportResult['customReportId'];

    //         let startDateTime = request.params['startDate'] * 1000000;
    //         let endDateTime = request.params['endDate'] * 1000000;
    //         let measurementName = '"company-' + companyId + '"';
    //         console.log("startDateTime",startDateTime,"endDateTime",endDateTime)
    //         let reportCondition = {};
    //         reportCondition['companyId'] = companyId;
    //         reportCondition['customReportId'] = customReportId;
    //         let customReportData = await this.serviceImpl.getSingleEntryAsObject(reportCondition)

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
    //             // let columnName = obj.name;
    //             // let tempName =columnName.split(":");

    //             let columnNameFromObject = obj.name;
    //             let tempName = columnNameFromObject.split(":");
    //             let columnName = tempName[1];

    //             if( name ==="" ) {
        
    //                 name = tempName[0];
        
    //             } else if (name != tempName[0]) {
        
    //                 name = name + ":" + tempName[0];
    //             }
    //             for ( let l = 0; l < operations.length; l++ ) {
                   
    //                 parametersString = parametersString + 'mean("' + key + '") as "mean_of_' + key + '",';

    //                 let meanObj = {
    //                     name: "Mean of " + columnName,
    //                     title: "Mean of " + columnName,
    //                     key: 'mean_of_' + key,
    //                     span: 0,
    //                     series: [],
    //                 }
    //                     if( operations[l] == "mean" ) {
                   
                      
    //                     aggregatedDataColumns.push({...meanObj});
    //                  //   dataColumns.push({...meanObj});
    //                     }

    //                  else if( operations[l] == "max") {

    //                     parametersString = parametersString + 'max("' + key + '") as "max_of_' + key + '",';

    //                     let maxObj = {
    //                         name: "Max of " + columnName,
    //                         title: "Max of " + columnName,
    //                         key: 'max_of_' + key,
    //                         span: 0,
    //                         series: [],
    //                     }
    //                     aggregatedDataColumns.push({...maxObj});

    //                 }

    //                 else if( operations[l] == "min") {

    //                     parametersString = parametersString + 'min("' + key + '") as "min_of_' + key + '",';

    //                     let minObj = {
    //                         name: "Min Of " + columnName,
    //                         title: "Min Of " + columnName,
    //                         key: 'min_of_' + key,
    //                         span: 0,
    //                         series: [],
    //                     }

    //                     aggregatedDataColumns.push({...minObj});

    //                 }

    //             }

    //             let headerObj = {
    //                 "title": columnName,
    //                 "key": "",
    //                 "span": operations.length,
    //                 series: [],
    //             };
              
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
    //          //   console.log("agg",obj2)
    //             obj2['series'] = [];                
    //             aggregatedDataColumns.push(obj2);

    //         }

    //         let interval = customReportData['interval'];

    //         parametersString = parametersString.replace(/,\s*$/, "");

    //      //   console.log(customReportData['shiftId'])
    //         let shiftIdArr = customReportData['shiftId'];

    //       //  console.log(shiftIdArr)
    //         let query;
    //         let shiftConditionQuery = " ";
    //         let shiftArrLength = shiftIdArr.length;

    //         if( shiftArrLength > 0 ) {

    //            for ( let i = 0; i < shiftArrLength; i++ ) {

    //                 if( i >= 1) {
                        
    //                     shiftConditionQuery = shiftConditionQuery + " "+"OR" + " ";

    //                 }
    //               //  console.log(shiftConditionQuery)
    //                 shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;

    //             }
    //               query = "select " + parametersString + " from " + measurementName
    //             + " where time >= " + startDateTime + " and time <= " + endDateTime + " and "+ "("+shiftConditionQuery+")"+ " group by time(" + interval + "),* fill(none)"
    //         } else {

    //                query = "select " + parametersString + " from " + measurementName
    //             + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + "),* fill(none)"

    //         } 
          
    //         console.log(query);
    //         let a = await this.influxServiceImpl.getAllEntries(query);
    //         //console.log(a)
    //         for (let i = 0; i < a.length; i++) {
    //             let dateString = a[i]['time']['_nanoISO'];
    //             // let date = moment(dateString).format("DD-MM-YYYY")
    //             // let time = moment(dateString).format("HH:mm A")

    //             let date = moment(dateString).tz('Asia/Calcutta').format("DD-MM-YYYY");
    //            let time = moment(dateString).tz('Asia/Calcutta').format("HH:mm");

    //             a[i]['date'] = date;
    //             a[i]['time'] = time;


    //             for (let x = 0; x < calculatedFieldLength; x++) {

    //                 let obj = customReportData['calculatedFields'][x];
    //                 obj['span'] = 0;
    //              //    console.log(obj,a[i])
    //                 let fieldValue = await this.getCalculatedField(obj, a[i]);
    //                //  console.log(fieldValue)
    //                 a[i][obj['key']] = fieldValue;
    //             }
                
    //             for (let x = 0; x < dataColumns.length; x++) {

    //                 if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
    //                     continue;

    //                 let obj = {};
                
    //                 obj['name'] = date + " " + time;
    //                 obj['value'] = a[i][dataColumns[x]['key']];
    //                //  console.log("datacolobj",obj)
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
    //             name,
    //             dataColumns: dataColumns,
    //             aggregatedDataColumns: aggregatedDataColumns,
    //             headerColumns: headerColumns,
    //             dataList: a,
    //         }
    //                  let finalResult;
    //       //  console.log("result",result)
    //         finalResult = await this.genrateExcelSheet(result);
    //      //   console.log("report final result", finalResult)
    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalResult);


    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }

    //     return h.response(response).code(response.getStatusCode());
    // }



    public async genrateExcelSheet(result){

        let aggregatedDataColumns = result['aggregatedDataColumns'];
        let headerColumns = result['headerColumns'];
        let dataList = result['dataList'];
        let subHeaders = [];

      //  console.log(headerColumns)
        let index = 0;

                //    for( j = 0; j < length; j++){
        //     //   console.log(length)
        //         console.log(index,j)
        //         startColumn = startColumn + ":"+ alphabets[index+j].concat(startIndex.toString());
        //    }
       
      //  console.log(headerColumns);

        for(let i of aggregatedDataColumns) {
            
            if(i['title'] != undefined) {

                if(i['title'] != "Time")
                {
                    subHeaders.push({title:i['title']});

                }

            }
        }

        let data = [];
        let obj = {};
        for( let i = 0; i < dataList.length; i++) {
            let arr = [];
            
            for( let j = 0; j < aggregatedDataColumns.length; j++) {
          
              // console.log(aggregatedDataColumns[j]) 

               let a = aggregatedDataColumns[j]['key'];
            //   console.log(aggregatedDataColumns[j]['key'])
                //data[i] = dataList[j][a];
                // console.log(dataList[i][a]);

                if( j== 0) {

                    arr[0] = dataList[i][a];
                }
                if( j==1) {

                    arr[0] = arr[0].concat(" ",dataList[i][a]);
                    obj['Date'] = arr[0];
                } else {

                    if( isNaN(dataList[i][a]) == false ) {

                        arr[j] = dataList[i][a];
                     } else if( typeof dataList[i][a] == 'string' ) {
        
                        arr[j] = dataList[i][a];
                     } else {
        
                        arr[j] = 0;
                     } 

                }
                    
            }
            arr.splice(1,1);
            data[i] = arr;
        }


        let excelObj = {};
        let alphabets = ["A","B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        let colIndex = 0;

        for( let i = 0; i < headerColumns.length; i++) {

            if ( !headerColumns[i]['span'] ) {

                headerColumns[i]['span'] = 1;
            }
            if( headerColumns[i]['span'] == 1 ) {

                headerColumns[i]['isMerge'] = false;    
                headerColumns[i]['cell'] =  alphabets[colIndex] + "22";
                colIndex += 1;
            } else {

                headerColumns[i]['isMerge'] = true;    
                headerColumns[i]['cell'] = alphabets[colIndex] + "22" + ":" + alphabets[colIndex + headerColumns[i]['span'] -1 ] + "22";
                colIndex += headerColumns[i]['span'];
            }
        }

        let chartObjPlotList = [];
        let chartObj = {};

        // for(let i = 0; i < subHeaders.length; i++) {

        //     chartObj['name'] = subHeaders[i]['title'];
        //     chartObj['marker'] = {'type': 'circle'};
        //     chartObj['smooth'] = true;
        //     if( chartObj['name'] === "Date") {

        //     //    chartObj['values'] = "report!$"+alphabets[i]+"$"+"24:$"+alphabets[i + data.length]+"$24";

        //     } else {

        //         chartObj['values'] = "report!$"+alphabets[i]+"$"+"24:$"+alphabets[i]+"$"+(data.length + 24).toString();

        //     }
        //     chartObjPlotList[i] = {...chartObj};
        // }     
        
        for(let i = 0; i < subHeaders.length; i++) {

            chartObj['marker'] = {'type': 'circle'};
            chartObj['smooth'] = true;

            if( subHeaders[i]['title'] != "Date") {

                chartObj['name'] = subHeaders[i]['title'];
                chartObj['values'] = "report!$"+alphabets[i]+"$"+"24:$"+alphabets[i]+"$"+(data.length + 24).toString();


            }
            chartObj['categories'] = "report!$"+"A"+"$"+"24:$"+"A"+"$"+(data.length + 24).toString();


            chartObjPlotList[i] = {...chartObj};
        }     
        
        excelObj['headers'] = headerColumns;
        excelObj['subHeaders'] = subHeaders;
        excelObj['data'] = data;
        excelObj['subHeadersStringArray'] = subHeaders.map( x => x.title);
      //  excelObj['headersStringArray'] = headerColumns.map( x => x.title);
        excelObj['chartDataPlot'] = chartObjPlotList;

        return excelObj;
    }


    // public  async handleRunPythonScript(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let condition = {};
    //     condition['isActive'] = 1;
    //     condition['isDeleted'] = 0;
    //     let companiesResponse = await this.companyServiceImpl.getAllEntries(condition,10000,0,"company_id asc","true","true");      

    //     let companies = companiesResponse.getResult()['list'];

    //   //  console.log(companies)
    //  //   console.log(companies.length);
    //     for( let i = 0; i < companies.length; i++) {

    //         let reportCondition = {};
    //         let companyName = companies[i]['companyName']
    //         reportCondition['companyId'] = companies[i]['companyId'];
    //         reportCondition['mode'] = request.query['mode'];
    //         console.log("companyId",reportCondition['companyId'])
    //         let reportsResponse = await this.serviceImpl.getAllEntries(reportCondition,100000,0,"custom_report_id asc","true","true");

    //         let reports = reportsResponse.getResult()['list'];

    //        // console.log((reports['created']).getDate())
    //        // console.log(reports[4]);
    //         let finalReports = [];
    //         let finalReportObj = {};
    //       //  console.log(reportCondition['mode'])
    //         if(reportCondition['mode'] == "Daily" ) {

    //             let checkDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(0, 0, 0, 0);
                
    //             let currentDate = new Date().getTime();
    //           //  console.log(checkDate)

    //             // let startDate = moment(new Date()).format("YYYY-MM-DD");
    //             for( let k = 0; k < reports.length; k++ ) {

    //                 let startTimeStamp = reports[k]['startDate'];
    //                 let endTimeStamp = reports[k]['endDate'];
    //                 let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(23, 59, 59, 999);
    //                 console.log(checkDate,startTimeStamp,endTimeStamp);

    //                 if( currentDate >= startTimeStamp && currentDate <= endTimeStamp ) {

    //                     console.log(checkDate,startTimeStamp,endTimeStamp)
    //                     finalReportObj['reportData'] = reports[k];
    //                     finalReportObj['reportStartDate'] = checkDate;
    //                     finalReportObj['reportEndDate'] = reportEndDate;  
    //                     console.log("checkdate",checkDate,"rep end date",reportEndDate);
    //                     finalReports.push({...finalReportObj});                      
    //                 }
    //             }
            
    //         } else if ( reportCondition['mode'] == "weekly") {

    //             // let endDate = new Date("2021-03-30");
    //             // let startDate = new Date(moment(endDate).subtract(7,'days').format("YYYY-MM-DD"));
    //             let checkDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(0, 0, 0, 0);
    //             let currentDate = new Date().getTime();

    //             for( let k = 0; k < reports.length; k++) {

    //                 let startTimeStamp = reports[k]['startDate'];
    //                 let endTimeStamp = reports[k]['endDate'];

    //                 if( currentDate >= startTimeStamp && currentDate <= endTimeStamp) {

    //                     console.log(checkDate,startTimeStamp,endTimeStamp)
    //                     finalReportObj['reportData'] = reports[k];
    //                     finalReportObj['reportStartDate'] = checkDate;
    //                     finalReportObj['reportEndDate'] = new Date().getTime();  
    //                //     console.log(checkDate,reportEndDate);
    //                     finalReports.push({...finalReportObj});                      
    //                     console.log("finalReports[k]",finalReports)

    //                 }
    //             }
    //         } else if ( reportCondition['mode'] == "monthly") {

    //             let endDate = new Date("2021-03-30");
    //             let startDate = new Date(moment(endDate).subtract(1,'months').format("YYYY-MM-DD"));
                
    //             for( let k = 0; k < reports.length; k++) {

    //                 let reportDate =  new Date(moment(reports[k]['created']).format("YYYY-MM-DD"));

    //                 console.log("startDate",startDate,"endDate",endDate,"reportDate",reportDate)

    //                 if( reportDate >= startDate && reportDate <= endDate) {

    //                     finalReports[k] = reports[k];
    //                 }
    //             }
    //         }

    //      //   console.log("finalReports[k]",finalReports)

    //         console.log("finalReports",finalReports.length)
    //         for (let j = 0; j < finalReports.length; j++) {
    //            // console.log( moment(reports[j]['created']).format("YYYY-MM-DD"))
               
    //             console.log("Python file path", this.externalUrls['pythonFilePath']);
    //             console.log(finalReports[j]['reportData']['companyId'],finalReports[j]['reportData']['customReportId']);
    //             var process = await spawn('python3', [this.externalUrls['pythonFilePath'], finalReports[j]['reportData']['companyId'], finalReports[j]['reportData']['customReportId'],finalReports[j]['reportStartDate'],finalReports[j]['reportEndDate']], { detached: true, stdio: 'ignore' });

    //             console.log("process", process);
    //         }
    //         let userCondition = {};
    //         userCondition['isActive'] = 1;
    //         userCondition['isDeleted'] = 0;
    //         userCondition['roleId'] = 0;
    //         let userEmails = [];

    //         for( let m = 0; m < finalReports.length; m++) {

    //             userEmails[m] = finalReports[m]['reportData']['emails']
    //             console.log("mails",userEmails[m])
    //         }
  
    //         if( userEmails.length > 0 ) {
    //            // let objArr = [];

    //             let obj = {

    //                 "toEmail":userEmails,
    //                 "subject": "reports",
    //                 "templateType": 1,
    //                 "emailData": {"name":companyName}
    //             }
    
    //             let filePath = [];
    //          //   console.log("length",finalReports.length)
    //             for( let n = 0; n < finalReports.length; n++) {
    //               //  console.log("finalreports",finalReports[n])
               
    //                 console.log("reportPath",this.externalUrls['customReportPath'])
    //                 filePath[n] = this.externalUrls['customReportPath']+finalReports[n]['reportData']['customReportId']+".xlsx";
    //             }
    
    //             obj['filePath'] = filePath;
    //             console.log("filePath",filePath)
    
    //             await DataPreparation.sendEmailWithAttachment(obj);

            
    //         }

    //     }
     
    //     return true;
    // }


    public  async handleRunPythonScript(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let condition = {};
        condition['isActive'] = 1;
        condition['isDeleted'] = 0;
        let companiesResponse = await this.companyServiceImpl.getAllEntries(condition,10000,0,"company_id asc","true","true");      

        let companies = companiesResponse.getResult()['list'];

      //  console.log(companies)
     //   console.log(companies.length);
        for( let i = 0; i < companies.length; i++) {

            let reportCondition = {};
            let companyName = companies[i]['companyName']
            reportCondition['companyId'] = companies[i]['companyId'];
            reportCondition['mode'] = request.query['mode'];
            console.log("companyId",reportCondition['companyId'])
            let reportsResponse = await this.serviceImpl.getAllEntries(reportCondition,100000,0,"custom_report_id asc","true","true");

            let reports = reportsResponse.getResult()['list'];

           // console.log((reports['created']).getDate())
           // console.log(reports[4]);
            let finalReports = [];
            let finalReportObj = {};
            console.log(reportCondition['mode'])
            if(reportCondition['mode'] == "Daily" ) {

             //   let checkDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(0, 0, 0, 0);
              let checkDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 00:00:00')).getTime();
                let serverStartTime = ((checkDate / 1000) - 19800) * 1000;
                
              //  console.log(checkDate)

                // let startDate = moment(new Date()).format("YYYY-MM-DD");
                console.log("report lenght",reports.lenght)
                for( let k = 0; k < reports.length; k++ ) {
              //      console.log("isEmailEnabled",reports[k]['isEmailEnabled'])

                let isEmailEnabled = reports[k]['isEmailEnabled'];                  
               // console.log("isEmailEnabled",isEmailEnabled)

                //    let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(23, 59, 59, 999);
                let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
                let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
                
                // console.log(checkDate,startTimeStamp,endTimeStamp);

                //     if( currentDate >= startTimeStamp && currentDate <= endTimeStamp ) {

                //    //     console.log(checkDate,startTimeStamp,endTimeStamp)
                //         finalReportObj['reportData'] = reports[k];
                //         finalReportObj['reportStartDate'] = serverStartTime;
                //         finalReportObj['reportEndDate'] = serverEndTime;  
                //         console.log("checkdate",serverStartTime,"rep end date",serverEndTime);
                //         finalReports.push({...finalReportObj});                      
                //     }

                    if( isEmailEnabled == true) {

                        //     console.log(checkDate,startTimeStamp,endTimeStamp)
                             finalReportObj['reportData'] = reports[k];
                             finalReportObj['reportStartDate'] = serverStartTime;
                             finalReportObj['reportEndDate'] = serverEndTime;  
                             console.log("checkdate",serverStartTime,"rep end date",serverEndTime);
                             finalReports.push({...finalReportObj});                      
                         }
                }
            
            } else if(reportCondition['mode'] == "Weekly" ) {

                //   let checkDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(0, 0, 0, 0);
                 let checkDate = new Date(moment(new Date()).subtract(7,'day').format('YYYY-MM-DD 00:00:00')).getTime();
                   let serverStartTime = ((checkDate / 1000) - 19800) * 1000;
                   
               //  let currentDate = new Date().getTime();
                 //  console.log(checkDate)
   
                   // let startDate = moment(new Date()).format("YYYY-MM-DD");
                   for( let k = 0; k < reports.length; k++ ) {
   
                   let isEmailEnabled = reports[k]['isEmailEnabled'];                  
                   //    let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(23, 59, 59, 999);
                   let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
                   let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
            
                       if( isEmailEnabled == true) {
   
                           //     console.log(checkDate,startTimeStamp,endTimeStamp)
                        finalReportObj['reportData'] = reports[k];
                        finalReportObj['reportStartDate'] = serverStartTime;
                        finalReportObj['reportEndDate'] = serverEndTime;  
                        console.log("checkdate",serverStartTime,"rep end date",serverEndTime);
                        finalReports.push({...finalReportObj});                      
                        }
                   }
               
               } else if(reportCondition['mode'] == "Monthly" ) {

                //   let checkDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(0, 0, 0, 0);
                 let checkDate = new Date(moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD 00:00:00')).getTime()
                 let serverStartTime = ((checkDate / 1000) - 19800) * 1000;

                   for( let k = 0; k < reports.length; k++ ) {
   
                   let isEmailEnabled = reports[k]['isEmailEnabled'];                  
                       
                   //    let reportEndDate = new Date(moment(new Date()).subtract(1,'day').format("YYYY-MM-DD")).setHours(23, 59, 59, 999);
                   let reportEndDate = new Date(moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD 23:59:59')).getTime()-19800;
                   let  serverEndTime= ((reportEndDate / 1000) - 19800) * 1000;
            
                       if( isEmailEnabled == true) {
   
                           //     console.log(checkDate,startTimeStamp,endTimeStamp)
                        finalReportObj['reportData'] = reports[k];
                        finalReportObj['reportStartDate'] = serverStartTime;
                        finalReportObj['reportEndDate'] = serverEndTime;  
                        console.log("checkdate",serverStartTime,"rep end date",serverEndTime);
                        finalReports.push({...finalReportObj});                      
                        }
                   }
               
               }

         //   console.log("finalReports[k]",finalReports)

            console.log("finalReports",finalReports.length)
            for (let j = 0; j < finalReports.length; j++) {
               // console.log( moment(reports[j]['created']).format("YYYY-MM-DD"))
               
                console.log("Python file path", this.externalUrls['pythonFilePath']);
                console.log(finalReports[j]['reportData']['companyId'],finalReports[j]['reportData']['customReportId']);
                var process = await spawn('python3', [this.externalUrls['pythonFilePath'], finalReports[j]['reportData']['companyId'], finalReports[j]['reportData']['customReportId'],finalReports[j]['reportStartDate'],finalReports[j]['reportEndDate']], { detached: true, stdio: 'ignore' });

                console.log("process", process);
            }
  
                console.log("length",finalReports.length)
                for( let n = 0; n < finalReports.length; n++) {
                  //  console.log("finalreports",finalReports[n])
                  let filePath ;

                  let obj = {

                    "toEmail":finalReports[n]['reportData']['emails'],
                    "subject": "reports",
                    "templateType": 1,
                    "emailData": {"name":companyName,"mode":reportCondition['mode']}
                }
                    console.log("reportPath",this.externalUrls['customReportPath'])
                    filePath = this.externalUrls['customReportPath']+finalReports[n]['reportData']['customReportId']+"-"+finalReports[n]['reportStartDate']+".xlsx";
                
    
                obj['filePath'] = filePath;
                console.log("filePath",filePath)
    
                await DataPreparation.sendEmailWithAttachment(obj);
            }

        }
     
        return true;
    }

    // public  async handleRunDailyPythonScript() {

    //     let condition = {};
    //     condition['isActive'] = 1;
    //     condition['isDeleted'] = 0;
    //     let companiesResponse = await this.companyServiceImpl.getAllEntries(condition,1000,0,"company_id asc","true","true");      

    //     let companies = companiesResponse.getResult()['list'];
    //     //console.log(companies)
    //  //   console.log(companies.length);
    //     for( let i = 0; i < companies.length; i++) {

    //         let reportCondition = {};

    //         reportCondition['companyId'] = companies[i]['companyId'];
    //         reportCondition['mode'] = 'daily';
    //    //     console.log(reportCondition['companyId'])
    //         let reportsResponse = await this.serviceImpl.getAllEntries(condition,1000,0,"custom_report_id asc","true","true");

    //         let reports = reportsResponse.getResult()['list'];

    //      //   console.log(reports);
    //         for (let j = 0; j < reports.length; j++) {
    
    //             console.log("Python file path", this.externalUrls['pythonFilePath']);
    //             var process = await spawn('python3', [this.externalUrls['pythonFilePath'], reports[j]['companyId'], reports[j]['customReportId']], { detached: true, stdio: 'ignore' });
    //             console.log("process", process);
    //         }
    
    //     }
     
    //     return true;
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
                    console.log("//",tempAdd);
                    
                    console.log("for",actualDataObj[param + calculatedObj['multipleCalculations'][i]])
                    tempAdd = tempAdd + actualDataObj[param + calculatedObj['multipleCalculations'][i]];
                }
                console.log("finalResult",tempAdd)
                return tempAdd;

                case "P1*P2*Pn":

                    for( let i = 0; i < calculatedObj['multipleCalculations'].length; i++) {
                        console.log("for",actualDataObj[param + calculatedObj['multipleCalculations'][i]])
                        tempMul = tempMul * actualDataObj[param + calculatedObj['multipleCalculations'][i]];
                    }
                    console.log("finalResult",tempMul)
                return tempMul;
        
                case "(P1+P2+Pn)/(P1+P2+Pn)":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                        console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
                        console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 / addOfArray2;
                    console.log("finalResult",result);

                return result;   
                
                case "(P1+P2+Pn)*(P1+P2+Pn)":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                        console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
                        console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 * addOfArray2;
                    console.log("finalResult",result);

                return result;   

                case "[sqrt(P1+P2+Pn)]/(P1+P2+Pn)":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                        console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
                        console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = Math.sqrt(addOfArray1) / addOfArray2;
                    console.log("finalResult",result);

                return result;   

                case "(P1+P2+Pn)/[sqrt(P1+P2+Pn)]":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                        console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
                        console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 / Math.sqrt(addOfArray2);
                    console.log("finalResult",result);

                return result;   

                case "sqrt[(P1+P2+Pn)/(P1+P2+Pn)]":

                    for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                        console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                        addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                        }

                    for( let i = 0; i < calculatedObj['array2'].length; i++) {
                           
                        console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                        addOfArray2 = addOfArray2 + actualDataObj[param + calculatedObj['array2'][i]];
                    }
                    result = addOfArray1 / (addOfArray2);
                    console.log("finalResult",result);

                return Math.sqrt(result);

                // case "P1/P2":

                // return actualDataObj[ param + calculatedObj['p1'] ] / actualDataObj[ param+ calculatedObj['p2'] ];
    
                case "(P1+P2+Pn)/[sqrt(P1^2+P2^a+Pn)]":

                let a = 2;
                let powerResult = 1;

                for( let i = 0; i < calculatedObj['array1'].length; i++) {
                           
                    console.log("arra1 loop",actualDataObj[param + calculatedObj['array1'][i]])
                    addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                }

                for( let i = 0; i < calculatedObj['array2'].length; i++) {
                    powerResult = 1;
                    console.log("for",actualDataObj[param + calculatedObj['array2'][i]])
                    for( let j = 0; j < a; j++) {

                        powerResult = powerResult * actualDataObj[param + calculatedObj['array2'][i]];

                    }
                    console.log(powerResult)
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
                console.log("actualDataObj[param+calculatedObj['volt']]",actualDataObj[param+calculatedObj['volt']],"actualDataObj[param+calculatedObj['sCurrent']]",actualDataObj[param+calculatedObj['current']],"Math.sin(Math.acos(parseFloat(calculatedObj['spf']))",Math.sin(Math.acos(actualDataObj[param + calculatedObj['pf']])));
                return 1.732 * (actualDataObj[param+calculatedObj['volt']] * Math.pow(10,3)) * actualDataObj[param+calculatedObj['current']] * Math.sin(Math.acos(actualDataObj[param + calculatedObj['pf']]));
            case "constantReactivePower":
                console.log("actualDataObj[param+calculatedObj['volt']]",actualDataObj[param+calculatedObj['volt']],"actualDataObj[param+calculatedObj['sCurrent']]",actualDataObj[param+calculatedObj['current']],"Math.sin(Math.acos(parseFloat(calculatedObj['spf']))",Math.acos(Math.cos(pf)))
                return 1.732 * (actualDataObj[param+calculatedObj['volt']] * Math.pow(10,3)) * actualDataObj[param+calculatedObj['current']] * Math.sin(Math.acos(parseFloat(calculatedObj['pf'])));
            case "(P1+P2+Pn)/C":
                 for( let i = 0; i < calculatedObj['array1'].length; i++) {
                            
                   // console.log("for",actualDataObj[param + calculatedObj['array1'][i]])
                    addOfArray1 = addOfArray1 + actualDataObj[param + calculatedObj['array1'][i]];
                    }
                return addOfArray1 / parseFloat( calculatedObj['c'] ); 
                
            }
            
        }


}
