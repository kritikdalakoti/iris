import { CallApi } from "./call-api";

import * as Configs from "../configurations/";

let configurations = Configs.getConfigurations();

let sendEmailUrl = configurations['externalUrls']['sendEmailUrl'];
let sendEmailWithAttachmentUrl = configurations['externalUrls']['sendEmailWithAttachmentUrl'];

export class DataPreparation {

    public static async convertObjectsToStringsInPayload(payload) {

        try {

            let keys = Object.keys(payload);

            for (let i = 0; i < keys.length; i++) {

                if (typeof (payload[keys[i]]) == 'object') {

                    payload[keys[i]] = JSON.stringify(payload[keys[i]]);
                }
            }

            // payload['createdBy'] = 1;

            return payload;
        } catch (err) {

            return {};
        }
    }

    public static async getObjectFromParams(requestParams: any, ) {

        let obj = {};

        if (requestParams) {

            let keys = Object.keys(requestParams);

            for (let i = 0; i < keys.length; i++) {

                obj[keys[i]] = requestParams[keys[i]];
            }

        }
        return obj;
    }

    public static async getNewObject(oldObj: any, ) {

        let obj = {};

        if (oldObj) {

            let keys = Object.keys(oldObj);

            for (let i = 0; i < keys.length; i++) {

                if (oldObj[keys[i]]) {

                    obj[keys[i]] = oldObj[keys[i]];
                }
            }
        }
        return obj;
    }


    public static async modifyPayloadObjAndParams(requestParams: any, requestPayload: any) {

        let obj = {};

        if (requestParams) {

            let keys = Object.keys(requestParams);

            for (let i = 0; i < keys.length; i++) {

                obj[keys[i]] = requestParams[keys[i]];
            }

        }

        if (requestPayload) {

            let keys = Object.keys(requestPayload);

            for (let i = 0; i < keys.length; i++) {

                obj[keys[i]] = requestPayload[keys[i]];
            }

        }

        return obj;
    }

    public static async getFilteredData(filters: any) {

        let condition = {};
        let rawQuery = "true";

        if (filters != undefined) {

            let filterKeys = Object.keys(filters);

            for (let i = 0; i < filterKeys.length; i++) {

                condition[filterKeys[i]] = filters[filterKeys[i]];
            }
        }
        return { condition, rawQuery }
    }

    public static getSearchRawQuery(searchArray: any, searchKey: any) {

        let searchQuery = " true and ( "

        for (let i = 0; i < searchArray.length; i++) {


            if (i >= 1) {

                searchQuery = searchQuery + " OR "
            }

            searchQuery = searchQuery + "  " + searchArray[i] + " iLike '%" + searchKey + "%'";
        }

        searchQuery = searchQuery + " ) ";

        return searchQuery;
    }

 
    public static async sendEmail(details) {

        try {
            console.log(Object);
            let url = sendEmailUrl;
            details = details

            console.log("url",url);

            let apiResponse = await CallApi.makePostRequest(url, details, details);

            console.log("Api Response", apiResponse);

            return JSON.stringify(apiResponse);
        } catch (err) {

            return {};
        }
    }

    public static async sendEmailWithAttachment(details) {

        try {
         //   console.log(Object);
            let url = sendEmailWithAttachmentUrl;
            details = details

          //  console.log("url",url);

            let apiResponse = await CallApi.makePostRequest(url, details, details);

            //console.log("Api Response", apiResponse);

            return JSON.stringify(apiResponse);
        } catch (err) {

            return {};
        }
    }

        public static async externalApiCall(requestedUrl,data) {

        try {
            
            let url = requestedUrl
            let method = 'GET'
            let apiResponse = await CallApi.makeRequest(url, method, data);
            //console.log(apiResponse)
            return apiResponse;
        } catch (err) {
            return {};
        }
    }
}