import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum'
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { DataPreparation } from '../classes/data-preparation';
import MeterDataController from './meter-data-controller';
import InfluxCrudServiceImpl from '../services/influx-crud-serviceImpl';
import * as moment from 'moment';
import { CustomMessages } from '../classes/custom-messages';

export default class PreviousCustomAnalysisController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    // public meterDataController: MeterDataController;
    // public companyMetersServiceImpl : CommonCrudServiceImpl;
    // public influxServiceImpl: InfluxCrudServiceImpl;
    // public parameterServiceImpl: CommonCrudServiceImpl;
    
    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_previous_custom_analysis','t_previous_custom_analysis');
        // this.companyMetersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters', 'v_company_meters_data');
        // this.influxServiceImpl = new InfluxCrudServiceImpl(this.globalVariables.influx);
        // this.parameterServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_meter_parameters', 't_meter_parameters');
        
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = []
        super.sortColumn = "previous_custom_analysis_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

    public async handleCreateAndUpdateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition = await DataPreparation.getObjectFromParams(request.params);

            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);

            payload['userId'] = condition['userId'];
            
            response = await this.serviceImpl.createOrUpdateEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


}