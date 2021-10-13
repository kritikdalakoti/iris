import * as Configs from "./configurations";
import * as Server from "./server";
import { AppGlobalVariableInterface } from "./interfaces/app-global-variables-interface";
import * as knex from 'knex';
import { InfluxConfigInterface } from "./interfaces/influx-configuration-interface";
const Influx = require('influx');
var nodemailer = require("nodemailer");

console.log(`Running enviroment ${process.env.NODE_ENV || 'dev'}`);

// Catch unhandling unexpected exceptions
process.on('uncaughtException', (error: Error) => {
    console.error(`uncaughtException ${error.message}`);
});

// Catch unhandling rejected promises
process.on('unhandledRejection', (reason: any) => {
    console.error(`unhandledRejection ${reason}`);
});

let confgis = Configs.getConfigurations();
let influxConfig: InfluxConfigInterface = confgis.influxConfig;

const start = async ({ config, globalVariables, myHost }) => {
    try {

        const server = await Server.init(config, globalVariables, myHost);
        await server.start();
        console.log('Server running at:', server.info.uri);
    } catch (err) {
        console.error('Error starting server: ', err.message);
        throw err;
    }
};

let transporter = nodemailer.createTransport({
    host: confgis.mailConfig.host,
    secure: false, port: 587, tls: { rejectUnauthorized: false },
    auth: {
        user:  confgis.mailConfig.username, // generated gmail user
        pass:  confgis.mailConfig.password, // generated gmail account password
    }
});

let globalVariables: AppGlobalVariableInterface = {};
// console.log("database",knex(confgis.postgresConfig));
globalVariables.postgres = knex(confgis.postgresConfig);
globalVariables.externalUrls = confgis.externalUrls;
globalVariables.awsS3 = confgis.awsS3;
globalVariables.influx = new Influx.InfluxDB(influxConfig.connectionString);
globalVariables.mailTransporter = transporter;


start({
    config: confgis.serverConfig,
    globalVariables: globalVariables,
    myHost: confgis.myHost
});
