import { MySqlConnectionConfigurationInterface } from "./my-sql-connection-configuration-interface";

export interface MySqlConfigurationInterface {
    client: string,
    connection: MySqlConnectionConfigurationInterface
}
