import { CustomMessages } from '../classes/custom-messages';
import * as Hapi from '@hapi/hapi';
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import { DataPreparation } from '../classes/data-preparation';
import { DeleteStrategy } from '../classes/delete-strategy-enum';

export default class CommonController {

    public serviceImpl : CommonCrudServiceImpl;

    public searchColumnsArray = [];
    public deleteStrategy;
    public size;
    public page;
    public sortColumn = "id"
    public orderBy = "desc"
    public isDeleteConditionChecking = true;
    public isActiveConditionChecking = true;


    constructor(server: Hapi.Server) {
    }

    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let size = request.query['size'] ? request.query['size'] : this.size;
            let page = request.query['page'] ? request.query['page'] : this.page;
            let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);

            let condition = await DataPreparation.getNewObject(request.params);
            let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
            let rawWhereQuery = filterObj.rawQuery;

            condition = { ...condition, ...filterObj.condition };

            let searchQuery = "true";

            if (request.query['search']) {

                searchQuery = await DataPreparation.getSearchRawQuery(this.searchColumnsArray, request.query['search']);
            }

            if (this.isDeleteConditionChecking) {

                condition['isDeleted'] = 0;
            }

            if (this.isActiveConditionChecking) {

                condition['isActive'] = 1;
            }

            response = await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleGetSingleEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};

            condition = request.params;

            if (this.isDeleteConditionChecking) {

                condition['isDeleted'] = 0;
            }

            if (this.isActiveConditionChecking) {

                condition['isActive'] = 1;
            }

            response = await this.serviceImpl.getSingleEntry(condition);
            if(response.getMessage() == "Success") {

                response['message'] = "husn and musn already present";
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let obj = await DataPreparation.modifyPayloadObjAndParams(request.params, request.payload);

            let payload = await DataPreparation.convertObjectsToStringsInPayload(obj);

            response = await this.serviceImpl.createEntry(payload, []);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleUpdateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition = await DataPreparation.getObjectFromParams(request.params);

            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);

            response = await this.serviceImpl.updateEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async hanldeDeleteEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};

            condition = await DataPreparation.getObjectFromParams(request.params);

            let payload = {};

            if ( this.deleteStrategy === DeleteStrategy.logicallyDelete ) {
                payload['isDeleted'] = 1;

                response = await this.serviceImpl.deleteEntryLogically(condition, payload);

            } else if ( this.deleteStrategy === DeleteStrategy.physicallyDelete ) {

                response = await this.serviceImpl.deleteEntryPhysically(condition);
            }

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }
}
