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
import { camelizeKeys, decamelizeKeys } from 'humps'
import * as R from 'ramda'
import { key } from 'nconf';

export default class MigrationController  {

    public globalVariables: AppGlobalVariableInterface;

    public influxServiceImpl: InfluxCrudServiceImpl;
 

    constructor(server: Hapi.Server) {
        this.globalVariables = server['app']['globalVariables'];
        this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx);
    }

    public async handleMigration( request: Hapi.Request, h: Hapi.ResponseToolkit ) {

        let response:Response;
        let query = `select * from "company-344"`
        let a = await this.influxServiceImpl.getAllEntries(query);

        console.log(a.length);
        let tableName = "company-52"
        for( let i = 0; i < a.length; i++) {

            let receivedTime = a[i]['time']['_nanoISO'];
            let timestamp = new Date(receivedTime).getTime();
            delete a[i]['time'];
            let obj = {};
            let finalObject = {};

            obj = camelizeKeys(a[i])

            let keys = Object.keys(obj);

         //   console.log(keys)

            for( let j = 0; j < keys.length; j++) {

                if ( obj[keys[j]] != null ) {

                 finalObject[keys[j]] = obj[keys[j]]; 
                }

            }

       //   console.log(timestamp,finalObject)
        response = await this.influxServiceImpl.createEntry(tableName,timestamp,finalObject);
        
        }
    }

    
}