"use strict";
import { Response } from '../classes/response'
import { camelizeKeys, decamelizeKeys } from 'humps'
import * as R from 'ramda'
import { CustomMessages } from '../classes/custom-messages';
import { StatusCodes } from '../classes/status-codes';
import { get } from 'https';
const csvtojson = require('csvtojson');
const fs = require('fs');

export default class InfluxCrudServiceImpl {

    public influx: any;


    constructor(influx: any) {

        this.influx = influx;
    }

    public async createEntry(measurement, time, fields) {

        let response: Response;

        try {

            let result = await this.influx.writePoints([
                {
                    measurement: measurement,
                    fields: (fields),
                    // tags: decamelizeKeys(tagValues),
                    timestamp: time * 1000000
                }
            ]);

            response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;
    }

    public async getAllEntries(query) {

        return await this.influx.query(query);
    }


    // public async getSingleEntry(size,page,orderString,filterObj,condition) {

    //     let response: Response;

    //     try {
    //         let search = Object.keys(condition);
    //         let decamelized = decamelizeKeys(condition);

    //         let decamelizedKeys = Object.keys(decamelized);
    //         let select =   `select * from ${this.measurementName} where`;
    //         let conditionQuery = " " ;
    //         let result = {};
    //         for(let i = 0; i < search.length; i++) {

    //             if( i >= 1) {
    //               conditionQuery = conditionQuery + " "+"AND" + " ";
    //             }
    //             conditionQuery = conditionQuery + `"${decamelizedKeys[i]}" = '${condition[search[i]]}'`;
    //         }             

    //         let time = `AND time >=${filterObj.condition['startDate'] *1000000} AND time <= ${filterObj.condition['endDate'] * 1000000}`
    //         let groupBy = `GROUP BY ${decamelizedKeys}`
    //         let orderBy = `ORDER BY time ${orderString}`
    //         let limitAndOffset = `LIMIT ${size} OFFSET ${page * size}`


    //         let getQuery = select + " "+conditionQuery+" "+time+" "+groupBy+" "+orderBy+" "+ limitAndOffset;
    //         console.log("query", getQuery);

    //           result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));

    //           result['count'] = await this.influx.query(`select count(${decamelizedKeys[0]}) from (select * from ${this.measurementName} where ${conditionQuery})`);

    //           if(result['list']) {
    //             for(let i = 0; i < result['list'].length; i++) {
    //                 result['list'][i][search[0]] = condition[search[0]];
    //                 result['list'][i][search[1]] = condition[search[1]];
    //             }
    //         }

    //      //   console.log(result);

    //         if (!result) {

    //             response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //         } else {

    //             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //         }

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }

    //     return response;
    // }

    // public async getSingleEntry(size, page, orderString, filterObj, condition, meterParameters) {

    //     let response: Response;

    //     try {

    //         let search = Object.keys(condition);
    //         let decamelized = decamelizeKeys(condition);

    //         let decamelizedKeys = Object.keys(decamelized);
    //         let select = `select `;
    //         let conditionQuery = " ";
    //         let result = {};
    //         let aggregatorsQuery = " ";

    //         for (let i = 0; i < meterParameters.length; i++) {

    //             if (i <= meterParameters.length - 2) {

    //                 aggregatorsQuery = aggregatorsQuery + `min("${meterParameters[i]}") as min_${meterParameters[i]},max("${meterParameters[i]}") as max_${meterParameters[i]},mean("${meterParameters[i]}") as mean_${meterParameters[i]}, `;

    //             }
    //             else {
    //                 aggregatorsQuery = aggregatorsQuery + `min("${meterParameters[i]}") as min_${meterParameters[i]},max("${meterParameters[i]}") as max_${meterParameters[i]},mean("${meterParameters[i]}") as mean_${meterParameters[i]}`;

    //             }

    //         }

    //         let where = `from ${this.measurements[0]} where`;

    //         for (let i = 0; i < search.length; i++) {

    //             if (i >= 1) {
    //                 conditionQuery = conditionQuery + " " + "AND" + " ";
    //             }
    //             conditionQuery = conditionQuery + `"${decamelizedKeys[i]}" = '${condition[search[i]]}'`;
    //         }

    //         let time = `AND time >=${filterObj.condition['startDate'] * 1000000} AND time <= ${filterObj.condition['endDate'] * 1000000}`
    //         let groupBy = `GROUP BY time(${filterObj.condition['interval']}),${decamelizedKeys}`;
    //         let orderBy = `ORDER BY time ${orderString}`
    //         let limitAndOffset = `LIMIT ${size} OFFSET ${page * size}`


    //         let getQuery = select + " " + aggregatorsQuery + " " + where + " " + conditionQuery + " " + time + " " + groupBy + " " + orderBy + " " + limitAndOffset;
    //         console.log("query", getQuery);

    //         result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));


    //         let getAllQuery = select + " " + aggregatorsQuery + " " + where + " " + conditionQuery + " " + time + " " + groupBy + " " + orderBy;
    //         let allMeterData = await this.influx.query(getAllQuery).then(R.map(camelizeKeys));

    //         result['count'] = allMeterData.length;

    //         if (result['list']) {
    //             for (let i = 0; i < result['list'].length; i++) {
    //                 result['list'][i]['companyId'] = condition['companyId'];
    //                 result['list'][i]['companyMeterId'] = condition['companyMeterId'];
    //             }
    //         }

    //         //   console.log(result);

    //         if (!result) {

    //             response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //         } else {

    //             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //         }

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }

    //     return response;
    // }

    // public async getAllEntryWithMinMax(size, page, orderString, condition, filterObj, aggregators) {

    //     let response: Response;

    //     try {

    //         let decamelized = decamelizeKeys(condition);
    //         let conditionKeys = Object.keys(decamelized);
    //         let result = {};
    //         let select = ` select`;
    //         let aggregatorsQuery = " ";

    //         for (let i = 0; i < aggregators.length; i++) {

    //             if (i <= aggregators.length - 2) {

    //                 aggregatorsQuery = aggregatorsQuery + `min("${aggregators[i]}") as min_${aggregators[i]},max("${aggregators[i]}") as max_${aggregators[i]},mean("${aggregators[i]}") as mean_${aggregators[i]}, `;

    //             }
    //             else {
    //                 aggregatorsQuery = aggregatorsQuery + `min("${aggregators[i]}") as min_${aggregators[i]},max("${aggregators[i]}") as max_${aggregators[i]},mean("${aggregators[i]}") as mean_${aggregators[i]}`;

    //             }

    //         }
    //         let where = `from ${this.measurements[0]} where`;

    //         let conditionQuery = " ";
    //         for (let i = 0; i < conditionKeys.length; i++) {

    //             if (i >= 1) {
    //                 conditionQuery = conditionQuery + " " + "AND" + " ";
    //             }
    //             conditionQuery = conditionQuery + `"${conditionKeys[i]}" = '${decamelized[conditionKeys[i]]}'`;

    //         }
    //         let time = `AND time >=${filterObj.condition['startDate'] * 1000000} AND time <= ${filterObj.condition['endDate'] * 1000000}`;
    //         let groupBy = `GROUP BY time(${filterObj.condition['interval']}),${conditionKeys}`;
    //         let orderBy = `ORDER BY time ${orderString}`;
    //         let limitAndOffset = `LIMIT ${size} OFFSET ${page * size}`;



    //         let getQuery = select + " " + aggregatorsQuery + " " + where + " " + conditionQuery + " " + time + " " + groupBy + " " + orderBy + " " + limitAndOffset;
    //         console.log("query", getQuery);

    //         result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));

    //         let getAllQuery = select + " " + aggregatorsQuery + " " + where + " " + conditionQuery + " " + time + " " + groupBy + " " + orderBy;

    //         let allData = await this.influx.query(getAllQuery).then(R.map(camelizeKeys));

    //         result['count'] = allData.length;


    //         if (result['list']) {
    //             for (let i = 0; i < result['list'].length; i++) {
    //                 result['list'][i]['companyId'] = condition['companyId'];
    //                 result['list'][i]['companyMeterId'] = condition['companyMeterId'];
    //             }
    //         }

    //         if (!result) {

    //             response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //         } else {

    //             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //         }
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }

    //     return response;
    // }


    // public async getAllEntry(size,page,orderString,condition,filterObj) {

    //     let response: Response;

    //     try {

    //         let search = Object.keys(condition);
    //         let decamelized = decamelizeKeys(condition);
    //         console.log(size,page,condition,filterObj);
    //         let decamelizedKeys = Object.keys(decamelized);
    //         let select =   ` select min(${filterObj.condition['min']}),* from ${this.measurementName} where`;
    //         let conditionQuery = " " ;
    //         for(let i = 0; i < search.length; i++) {

    //             if( i >= 1) {
    //               conditionQuery = conditionQuery + " "+"AND" + " ";
    //             }
    //             conditionQuery = conditionQuery + `"${decamelizedKeys[i]}" = '${condition[search[i]]}'`;
    //         }
    //         let time = `AND time >=${filterObj.condition['startDate'] *1000000} AND time <= ${filterObj.condition['endDate'] * 100000}`
    //         let groupBy = `GROUP BY time(${filterObj.condition['interval']}),${decamelizedKeys}`
    //         let orderBy = `ORDER BY time ${orderString}`


    //         let getQuery = select + " "+conditionQuery+" "+time+" "+groupBy+" "+orderBy;
    //         console.log("query", getQuery);
    //         let result = await this.influx.query(getQuery).then(R.map(camelizeKeys));

    //         if (!result) {

    //             response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //         } else {

    //             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //         }
    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }

    //     return response;
    // }


    // public async createEntryFromCsv(requestParams: any) {

    //     let response: Response;

    //     const csvFilePath = `src/company-meter${requestParams['companyMeterId']}.csv`;
    //     let data;

    //     try {

    //         csvtojson()
    //             .fromFile(csvFilePath)
    //             .then((json) => {

    //                 data = json;
    //                 for (let i = 0; i < data.length; i++) {
    //                     let payload = {};
    //                     let keys = Object.keys(data[i]);
    //                     // let fieldsKeys = ['volts_1','volts_2','volts_3','current_1','current_2'];
    //                     let fieldsKeys = ['1', '2', '3', '4', '5'];
    //                     let tagValues = {};

    //                     let time;
    //                     for (let j = 0; j < keys.length; j++) {
    //                         for (let k = 0; k < keys.length; k++) {
    //                             if (keys[j] === fieldsKeys[k]) {
    //                                 payload[fieldsKeys[k]] = Number(data[i][fieldsKeys[k]]);
    //                                 tagValues['company_meter_id'] = requestParams['companyMeterId'];
    //                                 tagValues['company_id'] = requestParams['companyId']
    //                             }
    //                         }
    //                     }

    //                     time = data[i]['time'] * 1000000000;
    //                     this.influx.writePoints([
    //                         {
    //                             measurement: this.measurements[0],
    //                             fields: decamelizeKeys(payload),

    //                             tags: tagValues,
    //                             timestamp: time
    //                         }

    //                     ]);
    //                 }
    //             });
    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, true);

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }
    //     return response;
    // }

    // public async getDataFromDashboard(size, page, orderString, condition) {

    //     let response: Response;

    //     try {

    //         let decamelized = decamelizeKeys(condition);
    //         let conditionKeys = Object.keys(decamelized);

    //         let select = `select * from ${this.measurements[0]} where`;
    //         let conditionQuery = " ";
    //         let result = {};

    //         for (let i = 0; i < conditionKeys.length; i++) {

    //             if (i >= 1) {
    //                 conditionQuery = conditionQuery + " " + "AND" + " ";
    //             }
    //             conditionQuery = conditionQuery + `"${conditionKeys[i]}" = '${decamelized[conditionKeys[i]]}'`;
    //         }

    //         let time = `AND time >= now() - 7d `;
    //         let groupBy = `GROUP BY ${conditionKeys}`;
    //         let orderBy = `ORDER BY time ${orderString}`;
    //         let limitAndOffset = `LIMIT ${size} OFFSET ${page * size}`;

    //         let getQuery = select + " " + conditionQuery + " " + time + " " + groupBy + " " + orderBy + " " + limitAndOffset;
    //         console.log("query", getQuery);

    //         result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));

    //         let getAllQuery = select + " " + conditionQuery + " " + time + " " + groupBy + " " + orderBy;

    //         let allData = await this.influx.query(getAllQuery).then(R.map(camelizeKeys));

    //         result['count'] = allData.length;
    //         //    console.log(result);

    //         //    if(result['list'] ) {

    //         //         for(let i = 0; i < result['list'].length; i++) {
    //         //             result['list'][i][search]['companyId'] = condition[search[0]];
    //         //             result['list'][i][search][1] = condition[search[1]];
    //         //         }
    //         //     }

    //         if (!result) {

    //             response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //         } else {

    //             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //         }

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }

    //     return response;
    // }

    // public async getNormalFields(size, page, orderString, filterObj, condition) {

    //     let response: Response;

    //     try {
    //         let decamelized = decamelizeKeys(condition);
    //         let conditionKeys = Object.keys(decamelized);
    //         let measurementNames;

    //         let select = `select min("1"),* from ${this.measurements} where`;

    //         let result = {};

    //         let time = ` time >=${filterObj['startDate'] * 1000000} AND time <= ${filterObj['endDate'] * 1000000}`;
    //         let groupBy = `GROUP BY time(${filterObj['interval']})`;

    //         let orderBy = `ORDER BY time ${orderString}`;
    //         let limitAndOffset = `LIMIT ${size} OFFSET ${page * size}`;


    //         let getQuery = select + " " + time + " " + groupBy + "" + orderBy + " " + limitAndOffset;
    //         // console.log("query", getQuery);

    //         result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));

    //         // console.log(result);


    //         if (!result) {

    //             response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //         } else {

    //             response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //         }

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
    //     }

    //     return response;
    // }


    // public async sammpleQuery() {
    //     let result = {};
    //     let response: Response;

    //     let getQuery = `select * from ${this.measurementName},${this.measurementName2}`;
    //     console.log(getQuery)
    //     result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));
    //     result['count'] = result['list'].length;
    //     if (!result) {

    //         response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //     } else {
    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //     }

    //     return response;
    // }

    // public async sammpleQuery() {
    //     let result = {};
    //     let response: Response;
    //     let measurementNames;


    //     for (let i = 0; i < this.measurements.length; i++) {

    //         if (i <= this.measurements.length - 2) {

    //             measurementNames = `${this.measurements[i]},`;


    //         } else {

    //             measurementNames = this.measurements[i];

    //         }

    //         console.log(measurementNames)
    //     }
    //     let getQuery = `select * from ` + measurementNames;

    //     console.log(getQuery);
    //     result['list'] = await this.influx.query(getQuery).then(R.map(camelizeKeys));
    //     //  console.log(result['list']);

    //     result['count'] = result['list'].length;
    //     if (!result) {

    //         response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
    //     } else {
    //         response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
    //     }

    //     return response;
    // }

}