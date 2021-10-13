import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum';
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { DataPreparation } from '../classes/data-preparation';

export default class MetersController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    public serviceImpl
    public searchColumnName: string = 'model_name'
    public meterParametersServiceImpl : CommonCrudServiceImpl;
    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        this.meterParametersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters', 't_meter_parameters');
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meters', 't_meters');
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = ['model_name', 'manufacturing_company_name']
        super.sortColumn = "meter_id";
        super.orderBy = "desc";
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

    public async handleGetAllMetersEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

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
            if ( response.getIsSuccess() == true ) {
                let result = response.getResult();
                for ( let i = 0; i < result['list'].length; i++) {
                    let finalObj = {};
                    let id = result['list'][i]['meterId'];
                    condition['meterId'] = id;
                    let meterParameters =  (await this.meterParametersServiceImpl.getAllEntries(condition, 1000, 0, orderString, searchQuery, rawWhereQuery)).getResult()['list'];
                   
                    finalObj = response.getResult()['list'][i];
                    finalObj['metersParameters'] = meterParameters;
                   response.getResult()['list'][i]= finalObj;
                }
            }
            

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}