import { SwaggerConfigurationInterface } from './swagger-configuration-interface';

export interface AppGlobalVariableInterface {
    postgres?: any;
    mongo?: any;
    mySql?: any;
    externalUrls?: any;
    awsS3?: any
    mailTransporter?: any;
    extraData?: any;
    jwtConfig?: any;
    swaggerConfig?: SwaggerConfigurationInterface;
    influx?: any;
    mailConfig?: any;
}
