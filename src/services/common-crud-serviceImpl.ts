"use strict";
import { Response } from '../classes/response'
import { camelizeKeys, decamelizeKeys } from 'humps'
import * as R from 'ramda'
import { CustomMessages } from '../classes/custom-messages';
import { StatusCodes } from '../classes/status-codes';

// Create, Validate, Update, Pagination, Search and Filtering 
export default class CommonCrudServiceImpl {

    public postgres: any;
    private tableName;
    private viewTableName;

    constructor(postgres: any, tableName: string, viewTableName: string) {

        this.postgres = postgres;
        this.tableName = tableName;
        this.viewTableName = viewTableName;
    }


    // Unique Checking if index is there
    // Db Exception handling 
    // Response Format
    public async createEntry(payload, uniqeColumns: string[]) {

        let response: Response;

        try {

            let condition = {};
            let isEntryPresent = 0;

            if (uniqeColumns.length != 0) {

                for (let i = 0; i < uniqeColumns.length; i++) {

                    if (payload[uniqeColumns[i]] != undefined)
                        condition[uniqeColumns[i]] = payload[uniqeColumns[i]]
                }
                isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));
            }

            if (isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_ALREADY_PRESENT, {});
            } else {

                payload['created'] = new Date();
                payload['modified'] = new Date();
                let result = await this.postgres(this.tableName).returning("*").insert(decamelizeKeys(payload)).then(R.map(camelizeKeys));
                response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result[0]);

            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;
    }

    // Update Multiple Entries
    public async updateEntry(condition, payload) {

        let response: Response;

        try {

            let isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

            if (!isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                payload['modified'] = new Date();

                let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                    .then(R.map(camelizeKeys));

                response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_UPDATED_SUCCESSFULLY, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;

    }

    // Create or Update Entries
    public async createOrUpdateEntry(condition, payload) {

        let response: Response;

        try {

            let isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

            if (!isEntryPresent) {

                let result = await this.postgres(this.tableName).returning("*").insert(decamelizeKeys(payload)).then(R.map(camelizeKeys));
                response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result[0]);
            } else {


                payload['modified'] = new Date();

                let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                    .then(R.map(camelizeKeys));

                response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_UPDATED_SUCCESSFULLY, result[0]);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    // Get Single Entry
    public async getSingleEntry(condition) {

        let response: Response;

        try {

            let result = await this.postgres(this.tableName).first("*")
                .where(decamelizeKeys(condition))
                .then(camelizeKeys);

            if (!result) {

                response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    // Get All Entries
    // Remove columns from filters / Search which are not in db 
    // Camalize the response before sending 
    public async getAllEntries(filterCondition: Object, size: number, page: number, orderByString: string, rawSearchQuery: string, rawWhereQuery: string) {

        let response: Response;

        try {
            let countObj = await this.postgres(this.viewTableName)
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawSearchQuery)
                .whereRaw(rawWhereQuery)
                .count('* as cnt');
            let result = [];

            if (countObj[0]['cnt'] !== 0) {

                result = await this.postgres(this.viewTableName).select("*")
                    .where(decamelizeKeys(filterCondition))
                    .whereRaw(rawSearchQuery)
                    .whereRaw(rawWhereQuery)
                    .limit(size)
                    .offset((page * size))
                    .orderByRaw(orderByString)
                    .then(R.map(camelizeKeys));
            }

            let finalObj = {
                "list": result,
                "count": countObj[0]['cnt']
            }

            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, finalObj);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    public async createOrUpdateMultipleEntries(array, columnArray) {

        let response: Response;

        try {

            for (let i = 0; i < array.length; i++) {

                let payload = array[i];

                let condition = {};

                for (let j = 0; j < columnArray.length; j++) {

                    condition[columnArray[j]] = payload[columnArray[j]];
                }

                payload['modified'] = new Date();

                let checkEntry = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

                if (checkEntry) {

                    let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                        .then(R.map(camelizeKeys));

                    response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_UPDATED_SUCCESSFULLY, result);
                } else {

                    if (payload['id'] === 0) {

                        delete payload['id'];
                    }

                    payload['created'] = new Date();
                    payload['modified'] = new Date();
                    let result = await this.postgres(this.tableName).insert(decamelizeKeys(payload)).returning("*").then(R.map(camelizeKeys));

                    console.log("result", result);
                    response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result);
                }
            }
        } catch (err) {

            console.log(err.message);
            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;
    }

    // Work on response for this function
    public async createMultipleEntries(array) {

        let response: Response;

        try {

            for (let i = 0; i < array.length; i++) {

                let payload = array[i];

                payload['modified'] = new Date();

                if (payload['id'] === 0) {

                    delete payload['id'];
                }

                payload['created'] = new Date();
                payload['modified'] = new Date();
                let result = await this.postgres(this.tableName).insert(decamelizeKeys(payload)).returning("*").then(R.map(camelizeKeys));

                console.log("result", result);
                response = new Response(true, StatusCodes.CREATED, CustomMessages.ENTRY_CREATED_SUCCESSFULLY, result);
            }
        } catch (err) {

            console.log(err.message);
            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;
    }

    public async getSingleEntryAsObject(filterCondition: Object, orderByString?: String, rawConditionQuery?: String) {

        try {

            orderByString = orderByString != undefined ? orderByString : "true";
            rawConditionQuery = rawConditionQuery != undefined ? rawConditionQuery : "true";

            return await this.postgres(this.tableName).first("*")
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawConditionQuery)
                .orderByRaw(orderByString)
                .then(camelizeKeys);
        } catch (err) {

            return [];
        }
    }

    public async getAllEntriesArray(filterCondition: Object, orderByString: String, rawConditionQuery: String) {

        try {

            return await this.postgres(this.tableName).select("*")
                .where(decamelizeKeys(filterCondition))
                .whereRaw(rawConditionQuery)
                .orderByRaw(orderByString)
                .then(R.map(camelizeKeys));
        } catch (err) {

            return [];
        }
    }

    public async rawQueryOnDbAsObject(query) {

        let response: Response;

        try {

            let result = await this.postgres.raw(query);
            let camalizeResult = R.map(camelizeKeys, result.rows);
            return camalizeResult;
        } catch (err) {

            return err;
        }
    }

    // Delete Entries
    public async deleteEntryLogically(condition, payload) {

        let response: Response;

        try {

            let isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

            if (!isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                payload['modified'] = new Date();

                let result = await this.postgres(this.tableName).returning("*").where(decamelizeKeys(condition)).update(decamelizeKeys(payload))
                    .then(R.map(camelizeKeys));

                response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_DELETED_SUCCESSFULLY, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    public async deleteEntryPhysically(condition) {

        let response: Response;

        try {

            let isEntryPresent = await this.postgres(this.tableName).first().where(decamelizeKeys(condition));

            if (!isEntryPresent) {

                response = new Response(true, StatusCodes.BAD_REQUEST, CustomMessages.ENTRY_NOT_PRESENT, {});
            } else {

                let result = await this.postgres(this.tableName).where(decamelizeKeys(condition)).del();

                response = new Response(true, StatusCodes.OK, CustomMessages.ENTRY_DELETED_SUCCESSFULLY, result);
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }

        return response;
    }

    public async rawQueryOnDb(query) {

        let response: Response;

        try {

            let result = await this.postgres.raw(query);
            let camalizeResult = R.map(camelizeKeys, result.rows);
            response = new Response(true, StatusCodes.OK, "", camalizeResult);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return response;

    }

}