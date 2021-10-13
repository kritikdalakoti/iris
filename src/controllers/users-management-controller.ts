import * as Hapi from '@hapi/hapi';
import { AppGlobalVariableInterface } from '../interfaces/app-global-variables-interface';
import CommonCrudServiceImpl from '../services/common-crud-serviceImpl';
import CommonController from './common-controller';
import { DeleteStrategy } from '../classes/delete-strategy-enum';
import { DataPreparation } from '../classes/data-preparation';
import { PasswordEncryption } from '../classes/password-encryption';
import { Response } from '../classes/response';
import { StatusCodes } from '../classes/status-codes';
import { CustomMessages } from '../classes/custom-messages';

export default class UsersManagementController extends CommonController {

    public globalVariables: AppGlobalVariableInterface;
    private passwordEncryption : PasswordEncryption;
    public tokenServiceImpl : CommonCrudServiceImpl;
    public companyMetersServiceImpl : CommonCrudServiceImpl;
    public companiesServiceImpl : CommonCrudServiceImpl;

    constructor(server: Hapi.Server) {
        super(server);
        this.passwordEncryption = new PasswordEncryption();
        this.globalVariables = server['app']['globalVariables'];
        this.tokenServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_tokens','t_tokens');
        super.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users','t_users');
        this.companyMetersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_company_meters','t_company_meters');
        this.companiesServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_companies','t_companies');

        super.size = 10;
        super.page = 0;
        super.deleteStrategy = DeleteStrategy.physicallyDelete;
        super.searchColumnsArray = ['name'];
        super.sortColumn = "user_id";
        super.orderBy = "desc";
        super.isDeleteConditionChecking = true;
        super.isActiveConditionChecking = true;
    }
    public generateToken(userId : any) {

        let tokenString =  Math.random().toString(36).substring(2,20) + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        let tokenObj = {};
        tokenObj['userId'] = userId;
        tokenObj['token'] = tokenString;
        return tokenObj;
    }

    public async handleSignUpEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let obj = await DataPreparation.modifyPayloadObjAndParams(request.payload,request.params);
            
            obj['password'] =  this.passwordEncryption.encrypt(request.payload['password'].trim());
            
            obj['email'] = (request.payload['email'].trim()).toLowerCase();

            let payload = await DataPreparation.convertObjectsToStringsInPayload(obj);
            response = await this.serviceImpl.createEntry(payload, []);
            let user = response.getResult();
            if(response.getIsSuccess)
            {
                let token = this.generateToken(user['userId']);
                this.tokenServiceImpl.createEntry(token,[]);


            }
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

            if( payload['password'] != undefined ) {
                
                payload['password'] =  this.passwordEncryption.encrypt(request.payload['password'].trim());

            } 

            response = await this.serviceImpl.updateEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    // public async handleLogin(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let condition = {};
    //         let result;
    //         let obj;

    //         condition['email'] = (request.payload['email'].trim()).toLowerCase();  
    //         result = await this.serviceImpl.getSingleEntry(condition);
    //         obj = result.getResult();

    //         if( result.getIsSuccess()) {
                
    //             let success = this.passwordEncryption.validate(obj['password'], request.payload['password'].trim()); 
    //             if( success ) {
    //                 let token ={};
    //                 token= this.generateToken(obj['userId']);
    //                let tokenObj = await this.tokenServiceImpl.createEntry(token,[]);
    //                let passingObj = {};
    //                passingObj['user'] = result.getResult();
    //                passingObj['token'] = tokenObj.getResult();

    //                 if(obj['isActive']) {

    //                     response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, passingObj);

    //                 } else {
                     
    //                     response = new Response(false, StatusCodes.NOT_ACCEPTABLE, CustomMessages.PROFILE_INACTIVATE, false);

    //                 }
    //             } else {

    //                 response = new Response(false, StatusCodes.NOT_ACCEPTABLE, CustomMessages.PASSWORD_NOT_PRESENT, false);
    //             }

    //         } else {

    //             response = new Response(false, StatusCodes.NOT_ACCEPTABLE, CustomMessages.EMAIL_NOT_PRESENT, false);
    //         }

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }


    public async handleLogin(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            let result;
            let obj;

            condition['email'] = (request.payload['email'].trim()).toLowerCase();  
            result = await this.serviceImpl.getSingleEntry(condition);
            obj = result.getResult();

            if( result.getIsSuccess()) {
                
                let success = this.passwordEncryption.validate(obj['password'], request.payload['password'].trim()); 
                if( success ) {
                    let token ={};
                    token= this.generateToken(obj['userId']);
                   let tokenObj = await this.tokenServiceImpl.createEntry(token,[]);
                   let passingObj = {};
                   passingObj['user'] = result.getResult();
                   passingObj['token'] = tokenObj.getResult();

                   let companyId = passingObj['user']['companyId'];
                   let companyCondition = {};
                   companyCondition['isDeleted'] = 0;
                   companyCondition['isActive'] = 1;
                   companyCondition['companyId'] = companyId;
                   let company =  (await this.companiesServiceImpl.getSingleEntry(companyCondition)).getResult();
                   passingObj['companyDetails'] = company;
                   
                   if(obj['isActive']) {
                        response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, passingObj);

                    } else {
                     
                        response = new Response(false, StatusCodes.NOT_ACCEPTABLE, CustomMessages.PROFILE_INACTIVATE, false);

                    }
                } else {

                    response = new Response(false, StatusCodes.NOT_ACCEPTABLE, CustomMessages.PASSWORD_NOT_PRESENT, false);
                }

            } else {

                response = new Response(false, StatusCodes.NOT_ACCEPTABLE, CustomMessages.EMAIL_NOT_PRESENT, false);
            }

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let size = request.query['size'] ? request.query['size'] : this.size;
            let page = request.query['page'] ? request.query['page'] : this.page;
            let orderString = request.query['sort'] ? request.query['sort'] : (this.sortColumn + " " + this.orderBy);
            let result;
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

            let companyCondition = {};
            companyCondition['isDeleted'] = 0;
            companyCondition['isActive'] = 1;
            companyCondition['companyId'] = request.params['companyId'];

            let company = (await this.companiesServiceImpl.getSingleEntry(companyCondition)).getResult();
            result =  (await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery)).getResult();
            let remainingCount = company['noOfUsers'] - result['count'];
            result['remainingCount'] = remainingCount;
            response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleForgotPassword(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {
            let result;

            let obj = await DataPreparation.modifyPayloadObjAndParams(request.payload,request.params);
                        
            obj['email'] = (request.payload['email'].trim()).toLowerCase();

            let condition = {};
            condition['email'] = (request.payload['email'].trim()).toLowerCase();  
            result = await this.serviceImpl.getSingleEntry(condition);

            if (result.getIsSuccess) {
                let tokenString =  Math.random().toString(36) + Math.random().toString(36)+Math.random().toString(36)+Math.random().toString(36)+Math.random().toString(36)+Math.random().toString(36);
                let userResponse = await this.serviceImpl.updateEntry(condition,{'forgotPasswordToken':tokenString});

                let obj = {

                        "toEmail":condition['email'],
                        "subject": "forgot password",
                        "templateType": 3,
                        "emailData": {"msg":`https://irisems.com/#/update-password?email=${condition['email']}&token=${tokenString}`}
                    }

                 result =  await DataPreparation.sendEmail(obj);
                 let parsedResult = JSON.parse(result);
                 if (parsedResult['isSuccess']) {
                    response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS,{});
                 } else {
                    response = new Response(false, StatusCodes.NOT_ACCEPTABLE, parsedResult['message'],{});
                 }

            } else {

                response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, CustomMessages.EMAIL_NOT_PRESENT, {});

            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }
    // public async handleGetAllEntriesWithCompanyMeters(request: Hapi.Request, h: Hapi.ResponseToolkit) {

    //     let response: Response;

    //     try {

    //         let size = request.query['size'] ? request.query['size'] : this.size;
    //         let page = request.query['page'] ? request.query['page'] : this.page;
    //         let orderString = request.query['sort'] ? request.query['sort'] : (this.primaryKey + " " + this.orderBy);

    //         let condition = await DataPreparation.getNewObject(request.params);
    //         let filterObj = await DataPreparation.getFilteredData(request.query['filters']);
    //         let rawWhereQuery = filterObj.rawQuery;

    //         condition = { ...condition, ...filterObj.condition };

    //         let searchQuery = "true";

    //         if (request.query['search']) {

    //             searchQuery = await DataPreparation.getSearchRawQuery(this.searchColumnsArray, request.query['search']);
    //         }

    //         if (this.isDeleteConditionChecking) {

    //             condition['isDeleted'] = 0;
    //         }

    //         if (this.isActiveConditionChecking) {

    //             condition['isActive'] = 1;
    //         }

    //         response = await this.serviceImpl.getAllEntries(condition, size, page, orderString, searchQuery, rawWhereQuery);
    //         let result = response.getResult();
    //         let user = {};
            
    //         for(let i = 0; i < result['list'].length; i++) {
    //             user = result['list'][i]['userId'];
    //             user = result['list'][i]['companyId']
    //         }

    //         console.log(user);

    //     } catch (err) {

    //         response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
    //     }
    //     return h.response(response).code(response.getStatusCode());
    // }
}
