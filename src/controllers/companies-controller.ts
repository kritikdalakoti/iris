import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum';
import { DataPreparation } from '../classes/data-preparation';
import { StatusCodes } from '../classes/status-codes';
import { Response } from '../classes/response';
import { PasswordEncryption } from '../classes/password-encryption';
import { CustomMessages } from '../classes/custom-messages';
import { ResultError } from 'influx';

export default class CompaniesController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    public userServiceImpl: CommonCrudServiceImpl;
    public passwordEncryption : PasswordEncryption;
    constructor(server: Hapi.Server) {
        super(server);
        this.globalVariables = server['app']['globalVariables'];
        this.passwordEncryption = new PasswordEncryption();
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_companies','t_companies');
        this.userServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users','t_users');
        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.physicallyDelete;
        super.searchColumnsArray = ['company_name']
        super.sortColumn = "company_id";
        super.orderBy = "desc"
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }

    public async handleCreateEntryWithAdmin(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {
            let companyAndUserObj = {};
            let obj = await DataPreparation.modifyPayloadObjAndParams(request.params, request.payload);

            let payload = await DataPreparation.convertObjectsToStringsInPayload(obj);

            let company = {};
            let user = {};

            let companyKeys = ['companyName','noOfUsers','city','state','country','address','isDeleted','isActive'];
            let userKeys = ['roleId','email','password','name','mobile',"isEditDashboard"];
            let keys = Object.keys(request.payload); 

            for(let i = 0; i < keys.length ; i++) {
                for(let j = 0; j<keys.length; j++) {
                    if(keys[i] === companyKeys[j]) {
                        company[companyKeys[j]] = request.payload[companyKeys[j]];
                    }

                }
            }
            
            
            for(let i = 0; i < keys.length; i++) {
                for(let j = 0; j< keys.length; j++) {
                    if(keys[i] === userKeys[j]) {
                        user[userKeys[j]] = request.payload[userKeys[j]];
                    }

                }
            }

            user['password'] =  this.passwordEncryption.encrypt(user['password'].trim());
            
            user['email'] = (user['email'].trim()).toLowerCase();
               
             companyAndUserObj['company'] =  (await this.serviceImpl.createEntry(company, [])).getResult();

            if(companyAndUserObj) {

                user['companyId'] = companyAndUserObj['company']['companyId'];
                
                companyAndUserObj['user'] =  (await this.userServiceImpl.createEntry(user, [])).getResult();
                response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, companyAndUserObj);

            }

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleGetAllPoReports(request: Hapi.Request, h: Hapi.ResponseToolkit) {

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

            let result;
            let resultList = [];

            response = await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery);

            result = response;

            if(result.getIsSuccess() == true) {

               let allCompaniesList = result.getResult()['list'];


               for( let i = 0; i < allCompaniesList.length; i++ ) {

                    let condition= {};
                    condition['companyId'] = allCompaniesList[i]['companyId'];

                    condition['isDeleted'] = 0;
                    condition['isActive'] = 1;

                    let usersList =   (await this.userServiceImpl.getAllEntries(condition,10000,0,orderString,searchQuery,rawWhereQuery)).getResult();
                    let usersListLength = usersList['list'].length;

                   for( let j = 0; j < usersListLength; j++) {
                    let finalObj = {};

                    finalObj['userId'] = usersList['list'][j]['userId']; 
                    finalObj['companyId'] = allCompaniesList[i]['companyId'];
                    finalObj['companyName'] = allCompaniesList[i]['companyName'];
                    finalObj['userName'] = usersList['list'][j]['name']; 
                    finalObj['email'] = usersList['list'][j]['email']; 
                    finalObj['type'] = usersList['list'][j]['roleId']; 
                    finalObj['mobileNumber'] = usersList['list'][j]['mobile']; 

                    resultList.push(finalObj);

                   }
                }
            }
                        
            response.getResult()['list'] = resultList;
            response.getResult()['count'] = resultList.length;
            
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleGetSingleEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            let result;

            condition = request.params;

            if (this.isDeleteConditionChecking) {

                condition['isDeleted'] = 0;

            }

            if (this.isActiveConditionChecking) {

                condition['isActive'] = 1;
            }

            result =   (await this.serviceImpl.getSingleEntry(condition)).getResult();

            let usersCount =  (await this.userServiceImpl.getAllEntries(condition,100,0,"user_id ASC","true","true")).getResult()['count'];
            let remainingCount = result['noOfUsers'] - usersCount;
            result['remainingCount'] = remainingCount;
            
            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }





}
