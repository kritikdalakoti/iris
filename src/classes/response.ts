export class Response {

    private statusCode: number;

    private message: String;

    private result: any;

    private isSuccess: Boolean;

    constructor(isSuccess: Boolean, statusCodes: number, message: String, result: any) {

        this.statusCode = statusCodes;
        this.message = message;
        this.result = result;
        this.isSuccess = isSuccess;
    }

    public getIsSuccess() {

        return this.isSuccess;
    }

    public getMessage() {

        return this.message;
    }

    public getStatusCode() {

        return this.statusCode;
    }

    public getResult() {
        return this.result;
    }

    public setResult(result) {
        return this.result = result;
    }

    public setMessage(message) {
        return this.message = message;
    }
}