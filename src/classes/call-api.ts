import { Response } from './response';
import { StatusCodes } from './status-codes';
import * as request from 'request';

export class CallApi {

    private method;
    private url;
    private data;

    constructor(method, url, data) {

        this.method = method;
        this.url = url;
        this.data = data;

        console.log("call Api constructred");
    }

    async makeRequest() {

        return new Promise(resolve => {

            var options = {
                url: this.url,
                method: this.method,
                json: {}
            };

            if (this.method == "GET") {

            } else if (this.method == "POST") {

                options.json = this.data;
            } else if (this.method == "PUT") {

                options.json = this.data;
            }

            request(options, function (err, response, body) {

                if (err) {

                    resolve(err);
                }

                resolve(body);
            });
        });
    }


    public static async makePostRequest(url, method = "POST", data = {}) {

        return new Promise(resolve => {

            var options = {
                url: url,
                method: "POST",
                json: data
            };

            if (method == "POST") {

            } else {
                options.json = data;
            }

            // console.log("options", options);

            request(options, function (err, response, body) {

                if (err) {

                    resolve(err);
                }

                resolve(body);
            });
        });

    }

   public static async makeRequest(url, method = "GET", data = {}) {

        return new Promise(resolve => {

            var options = {
                url: url,
                method: method,
                json: {}
            };

            if (method == "GET") {

            } else {
                options.json = data;
            }

            console.log("options", options);

            request(options, function (err, response, body) {

                if (err) {

                    resolve(err);
                }

                resolve(body);
            });
        });

    }
}