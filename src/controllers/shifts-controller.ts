import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum'


export default class ShiftsController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;

    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_shifts','t_shifts');
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.logicallyDelete;
        super.searchColumnsArray = ['name']
        super.sortColumn = "shift_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

}
