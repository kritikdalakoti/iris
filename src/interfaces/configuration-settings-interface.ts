import { ServerConfigurationInterface } from "./server-configuration-interface";
import { PostgresConfigInterface } from "./postgres-config-interface";
import { MySqlConfigurationInterface } from "./my-sql-configuration-interface";
import { MongoConfigurationInterface } from "./mongo-configuration-interface";
import { InfluxConfigInterface } from "./influx-configuration-interface";
import { SwaggerConfigurationInterface } from "./swagger-configuration-interface";

export interface ConfigurationSettingsInterface {

    serverConfig: ServerConfigurationInterface,

    postgresConfig: PostgresConfigInterface,

    mongoConfig: MongoConfigurationInterface,

    mySqlConfig: MySqlConfigurationInterface,

    mailConfig,

    externalUrls: any;

    myHost: string;

    awsS3: string;

    extraData: any;

    influxConfig: InfluxConfigInterface;

    swaggerConfig: SwaggerConfigurationInterface;

    

}
