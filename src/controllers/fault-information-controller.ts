import { CustomMessages } from '../classes/custom-messages';
import * as Hapi from '@hapi/hapi';
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import { DataPreparation } from '../classes/data-preparation';
import { DeleteStrategy } from '../classes/delete-strategy-enum';
import CommonController from './common-controller';

export default class FaultInformationController extends CommonController {


    public globalVariables: AppGlobalVariableInterface;

    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_fault_information','t_fault_information');
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.physicallyDelete;
        super.searchColumnsArray = ['meter_name']
        super.sortColumn = "fault_information_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

    
}
