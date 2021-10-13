import { ConfigurationSettingsInterface } from '../interfaces/configuration-settings-interface';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import * as Configs from "../configurations";
import * as Hapi from '@hapi/hapi';
import * as Server from "../server";
import * as _ from 'lodash'
import * as knex from 'knex';
import { InfluxConfigInterface } from "../interfaces/influx-configuration-interface";
const Influx = require('influx');

class ServerInstace {

    public server: Hapi.server;
    private static _instance: ServerInstace;

    constructor() { }

    async createServerInstance() {

        let globalVariables: AppGlobalVariableInterface = {};
        const allConfigurations: ConfigurationSettingsInterface = Configs.getConfigurations();

        // Change this with env variables 
     
        let influxConfig: InfluxConfigInterface = allConfigurations.influxConfig;
        // console.log("database",knex(confgis.postgresConfig));
        globalVariables.postgres = knex(allConfigurations.postgresConfig);
        globalVariables.externalUrls = allConfigurations.externalUrls;
        globalVariables.swaggerConfig = allConfigurations.swaggerConfig;
        globalVariables.influx = new Influx.InfluxDB(influxConfig.connectionString);
        
        

        this.server = await Server.init(allConfigurations.serverConfig,globalVariables,allConfigurations.myHost);

        console.log("Server created successfully ");

    }

    public static async getInstance() {

     //   console.log("I am herer", this._instance);

        // if (!this._instance) {

        if (!this._instance) {

            this._instance = new this();
            console.log("Before server init");
            await this._instance.createServerInstance()
            console.log("After server init");
        }

        //console.log("I am here", this._instance);


        return this._instance;
    }

    public getServerInstance() {

        console.log("Server return successfully");
        return this.server;
    }

}

module.exports = ServerInstace.getInstance();
