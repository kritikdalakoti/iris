import { StatusCodes } from "./status-codes";
import { Response } from "./response";

export class ShellCommand {

    public static async executeCommand(cmd) {

        const exec = require('child_process').exec;
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {

                let response: Response;

                if (error) {

                    response = new Response(false, StatusCodes.BAD_REQUEST, error, {});
                }

                if (stdout) {

                    response = new Response(true, StatusCodes.OK, stdout, {});
                } else {

                    response = new Response(false, StatusCodes.BAD_REQUEST, stderr, {});
                }

                resolve(response);
            });
        });


    }

}