import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum'
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { DataPreparation } from '../classes/data-preparation';
import MeterDataController from './meter-data-controller';
import InfluxCrudServiceImpl from '../services/influx-crud-serviceImpl';
import * as moment from 'moment-timezone';
import { CustomMessages } from '../classes/custom-messages';

export default class DashboardController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    public meterDataController: MeterDataController;
    public companyMetersServiceImpl : CommonCrudServiceImpl;
    public influxServiceImpl: InfluxCrudServiceImpl;
    public parameterServiceImpl: CommonCrudServiceImpl;
    public customReportServiceImpl: CommonCrudServiceImpl;

    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_dashboard_data','t_dashboard_data');
        this.companyMetersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters', 'v_company_meters_data');
        this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx);
        this.parameterServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters', 't_meter_parameters');
        this.customReportServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_custom_reports', 't_custom_reports');

        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = []
        super.sortColumn = "dashboard_data_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

//     public async handleGetAllDashboardDataEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

//         let response: Response;

//         try {

//             let size = request.query['size'] ? request.query['size'] : this.size;
//             let page = request.query['page'] ? request.query['page'] : this.page;
//             let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);

//             let condition = await DataPreparation.getNewObject(request.params);
//             let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
//             let rawWhereQuery = filterObj.rawQuery;

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
         
//             let result =  (await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery)).getResult();
            
//           //  console.log(result['list'][0])
//             let obj = result['list'];
//             let finalList = [];
//             let meterName;
//             for( let i = 0; i < obj.length; i++ ) {
//                 let dashboard_data_id = obj[i]['dashboardDataId'];
//                 let companyId = obj[i]['companyId'];
//                 let parameters = obj[i]['parameters'];
//                 let startDateTime = obj[i]['startDate']* 1000000;
//                 let endDateTime = obj[i]['endDate'] * 1000000;
//                 let measurementName = '"company-' + companyId + '"';
//                 let parametersString = "";
//                 let interval = obj[i]['interval'];
              
//                 let headerColumns = [
//                     {
//                         "title": "",
//                         "key": "date",
//                         "span": 2
//                     },
//                     // {
//                     //     "title": "Time",
//                     //     "key": "time",
//                     //     "span": 0
//                     // },
//                 ];
    
//                 let aggregatedDataColumns = [
//                     {
//                         "title": "Date",
//                         "key": "date",
//                         "span": 0
//                     },
//                     {
//                         "title": "Time",
//                         "key": "time",
//                         "span": 0
//                     },
//                 ];
    
//                 let dataColumns = [
//                     {
//                         "title": "Date",
//                         "key": "date",
//                         "span": 0
//                     },
//                     {
//                         "title": "Time",
//                         "key": "time",
//                         "span": 0
//                     },
//                 ]
    
//                 for (let i = 0; i < parameters.length; i++) {
    
//                     let splitArrayForHexCode = parameters[i].split(":");
//                     let hexCode = splitArrayForHexCode[2];
//                     let hardwareUsn = splitArrayForHexCode[0];
//                     let meterUsn = splitArrayForHexCode[1]
    
//                     let meterCondition = {}
//                     meterCondition['hardwareUniqueSerialNumber'] = hardwareUsn;
//                     meterCondition['meterUniqueSerialNumber'] = meterUsn;
//                     let meterData = await this.companyMetersServiceImpl.getSingleEntryAsObject(meterCondition);
//                     console.log(meterData);

//                     meterName = meterData['name'];
//                     let parameterCondition = {};
//                     parameterCondition['meterId'] = meterData['meterId'];
//                     parameterCondition['hexAddress'] = hexCode;
//                     let parameterData = await this.parameterServiceImpl.getSingleEntryAsObject(parameterCondition);
                   
//                     console.log(parameterData);;

//                     let columnName = meterData['name'] + ":" + parameterData['name'];
//                     parametersString = parametersString + 'mean("' + parameters[i] + '") as "mean_of_' + parameters[i] + '",';
//                     parametersString = parametersString + 'max("' + parameters[i] + '") as "max_of_' + parameters[i] + '",';
//                     parametersString = parametersString + 'min("' + parameters[i] + '") as "min_of_' + parameters[i] + '",';
//                     parametersString = parametersString + 'last("' + parameters[i] + '") as "last_of_' + parameters[i] + '",';
    
//                     let meanObj = {
//                         name: "Mean of " + columnName,
//                         title: "Mean of " + columnName,
//                         key: 'mean_of_' + parameters[i],
//                         span: 0,
//                         series: [],
//                     }
    
//                     let maxObj = {
//                         name: "Max of " + columnName,
//                         title: "Max of " + columnName,
//                         key: 'max_of_' + parameters[i],
//                         span: 0,
//                         series: [],
//                     }
    
//                     let minObj = {
//                         name: "Min Of " + columnName,
//                         title: "Min Of " + columnName,
//                         key: 'min_of_' + parameters[i],
//                         span: 0,
//                         series: [],
//                     }
    
//                     let lastObj = {
//                         name: columnName,
//                         title: columnName,
//                         key: 'last_of_' + parameters[i],
//                         span: 0,
//                         series: [],
//                     }
    
//                     let headerObj = {
//                         "title": columnName,
//                         "key": "",
//                         "span": 4,
//                         series: [],
//                     };
    
//                     aggregatedDataColumns.push(meanObj);
//                     aggregatedDataColumns.push(maxObj);
//                     aggregatedDataColumns.push(minObj);
//                     aggregatedDataColumns.push(lastObj);


//                     dataColumns.push(lastObj);
//                     headerColumns.push(headerObj);
    
//                     // aggregatedGraph.push(meanObj);
//                     // aggregatedGraph.push(maxObj);
//                     // aggregatedGraph.push(minObj);
//                     // dataGraph.push(lastObj);
//                 }
    
//                 parametersString = parametersString.replace(/,\s*$/, "");
    
//                 let query = "select " + parametersString + " from " + measurementName
//                     + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ")"
    
//                 let a = await this.influxServiceImpl.getAllEntries(query);
//                 for (let i = 0; i < a.length; i++) {
    
//                     let dateString = a[i]['time']['_nanoISO'];
//                     let date = moment(dateString).format("DD-MM-YYYY")
//                     let time = moment(dateString).format("HH:mm A")
    
//                     a[i]['date'] = date;
//                     a[i]['time'] = time;
    
//                     for (let x = 0; x < dataColumns.length; x++) {
    
//                         if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
//                             continue;
    
//                         let obj = {};
//                         obj['name'] = date + " " + time;
//                         obj['value'] = a[i][dataColumns[x]['key']];
//                         dataColumns[x]['series'].push(obj);
//                     }
                    
//                     for (let x = 0; x < aggregatedDataColumns.length; x++) {
    
//                         if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
//                             continue;
    
//                         let obj = {};
//                         obj['name'] = date + " " + time;
//                         obj['value'] = a[i][aggregatedDataColumns[x]['key']];
//                         aggregatedDataColumns[x]['series'].push(obj);
//                     }
//                 }

//                 let result = {
//                     meterName,
//                     dashboard_data_id,
//                     dataColumns: dataColumns,
//                     aggregatedDataColumns: aggregatedDataColumns,
//                     headerColumns: headerColumns,
//                     dataList: a,
//                 }

//                finalList.push(result);

//             }
//             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalList);

//         } catch (err) {

//             response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
//         }
//         return h.response(response).code(response.getStatusCode());
//     }

// public async handleGetAllDashboardDataEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

//     let response: Response;

//     try {

//         let size = request.query['size'] ? request.query['size'] : this.size;
//         let page = request.query['page'] ? request.query['page'] : this.page;
//         let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);

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
     
//         let result =  (await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery)).getResult();
        
//       //  console.log(result['list'][0])
//         let obj = result['list'];
//         let finalList = [];

//         for( let i = 0; i < obj.length; i++ ) {
//             let name = obj[i]['name'];
//             let operations = obj[i]['operations'];
//             let dashboard_data_id = obj[i]['dashboardDataId'];
//             let companyId = obj[i]['companyId'];
//             let parameters = obj[i]['parameters'];
//             let startDateTime = obj[i]['startDate']* 1000000;
//             let endDateTime = obj[i]['endDate'] * 1000000;

//             let measurementName = '"company-' + companyId + '"';
//             let parametersString = "";
//             let interval = obj[i]['interval'];
          
//             let headerColumns = [
//                 {
//                     "title": "",
//                     "key": "date",
//                     "span": 2
//                 },
//                 // {
//                 //     "title": "Time",
//                 //     "key": "time",
//                 //     "span": 0
//                 // },
//             ];

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

//             for (let i = 0; i < parameters.length; i++) {

//                 let splitArrayForHexCode = parameters[i].split(":");
//                 let hexCode = splitArrayForHexCode[2];
//                 let hardwareUsn = splitArrayForHexCode[0];
//                 let meterUsn = splitArrayForHexCode[1]

//                 let meterCondition = {}
//                 meterCondition['hardwareUniqueSerialNumber'] = hardwareUsn;
//                 meterCondition['meterUniqueSerialNumber'] = meterUsn;
//                 let meterData = await this.companyMetersServiceImpl.getSingleEntryAsObject(meterCondition);
//                 let parameterCondition = {};
//                 parameterCondition['meterId'] = meterData['meterId'];
//                 parameterCondition['hexAddress'] = hexCode;
//                 let parameterData = await this.parameterServiceImpl.getSingleEntryAsObject(parameterCondition);
//                 let columnName = meterData['name'] + ":" + parameterData['name'];

//                 for (let l = 0; l < operations.length; l++) {

//                     if (operations[l] == "mean") {

//                         parametersString = parametersString + 'mean("' + parameters[i] + '") as "mean_of_' + parameters[i] + '",';

//                         let meanObj = {
//                             name: "Mean of " + columnName,
//                             title: "Mean of " + columnName,
//                             key: 'mean_of_' + parameters[i],
//                             span: 0,
//                             series: [],
//                         }

//                         aggregatedDataColumns.push(meanObj);

//                     }

//                    else if (operations[l] == "max") {

//                         parametersString = parametersString + 'max("' + parameters[i] + '") as "max_of_' + parameters[i] + '",';

//                         let maxObj = {
//                             name: "Max of " + columnName,
//                             title: "Max of " + columnName,
//                             key: 'max_of_' + parameters[i],
//                             span: 0,
//                             series: [],
//                         }

//                         aggregatedDataColumns.push(maxObj);

//                     }

//                     else if (operations[l] == "min") {

//                         parametersString = parametersString + 'min("' + parameters[i] + '") as "min_of_' + parameters[i] + '",';

//                         let minObj = {
//                             name: "Min Of " + columnName,
//                             title: "Min Of " + columnName,
//                             key: 'min_of_' + parameters[i],
//                             span: 0,
//                             series: [],
//                         }

//                         aggregatedDataColumns.push(minObj);

//                     }

//                     else if (operations[l] == "last") {

//                         parametersString = parametersString + 'last("' + parameters[i] + '") as "last_of_' + parameters[i] + '",';

//                         let lastObj = {
//                             name: "Last Of" + columnName,
//                             title: "Last Of" + columnName,
//                             key: 'last_of_' + parameters[i],
//                             span: 0,
//                             series: [],
//                         }

//                         aggregatedDataColumns.push(lastObj);

//                         dataColumns.push(lastObj);
//                     }
    
//                 }             

//                 let headerObj = {
//                     "title": columnName,
//                     "key": "",
//                     "span": operations.length,
//                     series: [],
//                 };

//                 headerColumns.push(headerObj);

//             }


//             parametersString = parametersString.replace(/,\s*$/, "");

//             let query = "select " + parametersString + " from " + measurementName
//                 + " where time >= " + startDateTime + " and time <= " + endDateTime + " group by time(" + interval + ")"

//             let a = await this.influxServiceImpl.getAllEntries(query);
//             for (let i = 0; i < a.length; i++) {

//                 let dateString = a[i]['time']['_nanoISO'];
//                 let date = moment(dateString).format("DD-MM-YYYY")
//                 let time = moment(dateString).format("HH:mm A")

//                 a[i]['date'] = date;
//                 a[i]['time'] = time;

//                 for (let x = 0; x < dataColumns.length; x++) {

//                     if (dataColumns[x]['key'] == 'date' || dataColumns[x]['key'] == 'time')
//                         continue;

//                     let obj = {};
//                     obj['name'] = date + " " + time;
//                     obj['value'] = a[i][dataColumns[x]['key']];
//                     dataColumns[x]['series'].push(obj);
//                 }
                
//                 for (let x = 0; x < aggregatedDataColumns.length; x++) {

//                     if (aggregatedDataColumns[x]['key'] == 'date' || aggregatedDataColumns[x]['key'] == 'time')
//                         continue;

//                     let obj = {};
//                     obj['name'] = date + " " + time;
//                     obj['value'] = a[i][aggregatedDataColumns[x]['key']];
//                     aggregatedDataColumns[x]['series'].push(obj);
//                 }
//             }

//             let result = {
//                 name,
//                 dashboard_data_id,
//                 dataColumns: dataColumns,
//                 aggregatedDataColumns: aggregatedDataColumns,
//                 headerColumns: headerColumns,
//                 dataList: a,
//             }

//            finalList.push(result);

//         }
//         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalList);

//     } catch (err) {

//         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
//     }
//     return h.response(response).code(response.getStatusCode());
//     }
//}

public async handleGetAllDashboardDataEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

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
     
        let result =  (await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery)).getResult();
        
      //  console.log(result['list'])
        let obj = result['list'];
    
        let finalList = [];
        console.log("dashboard data",obj.length)
        for( let i = 0; i < obj.length; i++ ) {
            console.log("data",obj[i])
           if(obj[i]['parameters'].length > 0) {

           //  console.log("analysis",obj[i].parameters)

               let analysisData = await this.getCustomAnalysisData(obj[i]);
              //  console.log(analysisData);
               finalList.push(analysisData);
           } else {
            //  console.log("report",obj[i].parameters)
            console.log("report")
            let reportData = await this.getCustomReportData(obj[i]);
            // console.log(reportData);

            finalList.push(reportData);
           }

        }
        let responseObj = {};
        responseObj['list'] = finalList;
        responseObj['count'] = result['count'];
        
        response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, responseObj);

    } catch (err) {

        response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    }
    return h.response(response).code(response.getStatusCode());
    }

    public async handleGetAllDashboardDataEntriesForShared(request: Hapi.Request, h: Hapi.ResponseToolkit) {

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
         
            // let result =  (await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery)).getResult();
            let query = `SELECT * from t_dashboard_data where shared_with::jsonb @> '[${condition['userId']}]'::jsonb or user_id= ${condition['userId']} and company_id = ${condition['companyId']} and is_active = 1 and is_deleted = 0 limit ${size} offset ${page}`; 
            let queryResponse = await this.serviceImpl.rawQueryOnDb(query);

           //  console.log(result['list'])
            let obj = queryResponse['result'];
        
            let countQuery = `SELECT count(*) from t_dashboard_data where shared_with::jsonb @> '[${condition['userId']}]'::jsonb or user_id= ${condition['userId']} and company_id = ${condition['companyId']} and is_active = 1 and is_deleted = 0`; 
            let countQueryResponse = await this.serviceImpl.rawQueryOnDb(query);
            let finalList = [];
            console.log("countQuery",countQuery)
            console.log("dashboard data",obj.length);
            console.log("countQueryResponse",countQueryResponse)
            for( let i = 0; i < obj.length; i++ ) {
                console.log("data",obj[i])
               if(obj[i]['parameters'].length > 0) {
    
               //  console.log("analysis",obj[i].parameters)
    
                   let analysisData = await this.getCustomAnalysisData(obj[i]);
                  //  console.log(analysisData);
                   finalList.push(analysisData);
               } else {
                //  console.log("report",obj[i].parameters)
                console.log("report")
                let reportData = await this.getCustomReportData(obj[i]);
                // console.log(reportData);
    
                finalList.push(reportData);
               }
    
            }
            let responseObj = {};
            responseObj['list'] = finalList;
            responseObj['count'] = Object.keys(countQueryResponse['result']).length > 0 ? countQueryResponse['result'][0]['count'] : 0;
            
            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, responseObj);
    
        } catch (err) {
    
            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
        }
 

async getCustomAnalysisData(obj) {

    let name = obj['name'];
    let shiftIdArr = obj['shiftId'];
    let operations = obj['operations'];
    let dashboard_data_id = obj['dashboardDataId'];
    let companyId = obj['companyId'];
    let parameters = obj['parameters'];
    let startDateTime = obj['startDate']* 1000000;
    let endDateTime = obj['endDate'] * 1000000;
    let startDate = obj['startDate'];
    let endDate = obj['endDate'];

    let measurementName = '"company-' + companyId + '"';
    let parametersString = "";
    let interval = obj['interval'];
  
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
        let parameterData = await this.parameterServiceImpl.getSingleEntryAsObject(parameterCondition);
       // let columnName = meterData['name'] + ":" + parameterData['name'];
       let columnName = parameterData['name'];
       let headerName = meterData['name'] + ":" + parameterData['name'];

        for (let l = 0; l < operations.length; l++) {


           if( operations[l] == "mean" ) {

            parametersString = parametersString + 'mean("' + parameters[i] + '") as "mean_of_' + parameters[i] + '",';

            let meanObj = {
                legend:meterData['name']+":"+"Mean Of " + columnName,
                name: "Mean of " + columnName,
                title: "Average of " + columnName,
                key: 'mean_of_' + parameters[i],
                span: 0,
                series: [],
            }

            aggregatedDataColumns.push(meanObj);
           }
             //   dataColumns.push(meanObj);


           else if (operations[l] == "max") {

                parametersString = parametersString + 'max("' + parameters[i] + '") as "max_of_' + parameters[i] + '",';

                let maxObj = {
                    legend:meterData['name']+":"+"Max Of " + columnName,
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
                    legend:meterData['name']+":"+"Min Of " + columnName,
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
            //         name: "Last Of" + columnName,
            //         title: "Last Of" + columnName,
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
    let shiftArrLength = shiftIdArr.length;

        //  query = "select " + parametersString + " from " + measurementName
        // + " where time >= " + startDateTime + " and time <= " + endDateTime +" group by time(" + interval + ")"

        if( shiftArrLength > 0) {

        for ( let i = 0; i < shiftArrLength; i++ ) {

            if( i >= 1) {
                
                shiftConditionQuery = shiftConditionQuery + " "+"OR" + " ";

            }
          //  console.log(shiftConditionQuery)
            shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;

        }
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

   // console.log(query)
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
        dashboard_data_id,
        dataColumns: dataColumns,
        aggregatedDataColumns: aggregatedDataColumns,
        headerColumns: headerColumns,
        dataList: a,
        startDate,
        endDate
    }

    return result;
}


async getCustomReportData(reportObj) {
   
    let shiftIdArr = reportObj['shiftId'];

    console.log("shiftIdArr",shiftIdArr);

    let operations = reportObj['operations'];
    let companyId = reportObj['companyId'];
    let customReportId = reportObj['customReportId'];
    let dashboard_data_id = reportObj['dashboardDataId'];

    let name = reportObj['name'];
    console.log("reportname",reportObj['name'])

    let startDateTime = reportObj['startDate'] * 1000000;
    let endDateTime = reportObj['endDate'] * 1000000;
    let startDate = reportObj['startDate'];
    let endDate = reportObj['endDate'];
    console.log("startDate",startDate,endDate,endDate)
    let measurementName = '"company-' + companyId + '"';

    let reportCondition = {};
    reportCondition['companyId'] = companyId;
    reportCondition['customReportId'] = customReportId;
    //let customReportData = await this.customReportServiceImpl.getSingleEntryAsObject(reportCondition)

    ///console.log("customReportData",customReportData);

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

    let length = reportObj['normalFields'].length;
   
    for (let i = 0; i < length; i++) {

        let obj = reportObj['normalFields'][i];
    
        let key = obj.key;
        // let columnName = obj.name;
        // let tempName =columnName.split(":");

        let columnNameFromObject = obj.name;
        let tempName = columnNameFromObject.split(":");
        let columnName = tempName[1];
        let headerName = obj.name;

        // if( name ==="" ) {

        //     name = tempName[0];

        // } else if (name != tempName[0]) {

        //     name = name + ":" + tempName[0];
        // }
        
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
                }
            

             if( operations[l] == "max") {

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

    let calculatedFieldLength = reportObj['calculatedFields'].length;

    for (let i = 0; i < calculatedFieldLength; i++) {

        let obj = {...reportObj['calculatedFields'][i]};
        obj['series'] = [];
        headerColumns.push(obj);

        let obj1 = {...reportObj['calculatedFields'][i]};
        obj1['series'] = [];                
        dataColumns.push(obj1);

        let obj2 = {...reportObj['calculatedFields'][i]};
        obj2['series'] = [];   
        obj2['legend'] = obj2['name'];     
             
        aggregatedDataColumns.push(obj2);

    }

    let interval = reportObj['interval'];

    parametersString = parametersString.replace(/,\s*$/, "");

    let query;
    let shiftConditionQuery = " ";
    let shiftArrLength = shiftIdArr.length;

       if( shiftArrLength > 0) {

       for ( let i = 0; i < shiftArrLength; i++ ) {

            if( i >= 1) {
                
                shiftConditionQuery = shiftConditionQuery + " "+"OR" + " ";

            }
          //  console.log(shiftConditionQuery)
            shiftConditionQuery = shiftConditionQuery + `shiftId = ${shiftIdArr[i]}`;

        }

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

   // console.log(query)
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

            let obj = reportObj['calculatedFields'][x];
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
    
    let result = {
        name,
        dashboard_data_id,
        dataColumns: dataColumns,
        aggregatedDataColumns: aggregatedDataColumns,
        headerColumns: headerColumns,
        dataList: a,
        startDate,
        endDate
    }

    return result;
}


// public async getCalculatedField(calculatedObj, actualDataObj) {

//     let param = "mean_of_";
    
//     switch (calculatedObj['type']) {

//         case "P1+P2":
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
//}

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



