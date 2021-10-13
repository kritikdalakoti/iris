import * as nconf from "nconf";
import * as path from "path";
import { ConfigurationSettingsInterface } from '../interfaces/configuration-settings-interface'


//Read Configurations
const configs = new nconf.Provider({
    env: true,
    argv: true,
    store: {
        type: 'file',
        file: path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`)
    }
});

// Return All configurations
export function getConfigurations(): ConfigurationSettingsInterface {

    return configs.get("configurations");
}



