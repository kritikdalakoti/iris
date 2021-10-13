export { };

const Code = require('@hapi/code');
const Lab = require('@hapi/lab');

import {companiesSuccessPayload,companiesUpdatePayload,companiesFailurePayload} from "../tests/payloads/companies-payloads"; 
const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

let version = "/v1.0.0"
let resource = 'companies';
let baseUrl="/";
let resourceUrl = "/api"+version +baseUrl+resource;

var _id;
var i;
var emptyId;
var obj;
console.log("I am in testing file, ServerInstance");

// create entry Success
// create entry Failure
// Get all Entries
// Get Single Entry -> Success Test case
// Get Single Entry -> Failure Test Case
// Update Entry -> Success 
// Update Entry -> Failure 

//Api Path check

describe('unit tests - companies Api Path Check', () => {

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
  //      console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'POST',
            headers: { authorization: false },
            url: "/api" + "/"+version  + baseUrl + resource,
            payload: companiesSuccessPayload
        }
        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload)

   //     console.log(injectOptions.payload)
    //    console.log("Companies API Path Check URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
  //    console.log("path check",reponse['statusCode']);

        expect(reponse['statusCode']).to.equal(404);

    })
});

//Create entry

describe('unit tests - companies Create Entry', () => {

    it('Success', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'POST',
            headers: { authorization: false },
            url: resourceUrl,
            payload: companiesSuccessPayload
        }
        const res = await ServerInstanceObj.server.inject(injectOptions);

        let response = JSON.parse(res.payload)

       console.log(injectOptions.payload)
        console.log("URL And Message :-- ", injectOptions.url, " :-  ", response['message'])
        // console.log(reponse);
       // console.log("ressult",reponse['result'] );
         obj = response['result'];
        var id = response['result']['companyId'];
       // console.log("id",id)

        expect(response['statusCode']).to.equal(201);
        expect(response['isSuccess']).to.equal(true);
        expect(typeof (response['result'])).to.equal('object')

        // Check Entry present or not 
        const injectOptions2 = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl + "/" + id
        }
        const res1 = await ServerInstanceObj.server.inject(injectOptions2);

        let response1 = JSON.parse(res1.payload);

      //  console.log("response1",res1.result);
      //  console.log(injectOptions.payload)
        console.log("URL And Message :-- ", injectOptions2.url, " :-  ", response1['message'])
    //  console.log("obj",JSON.stringify(obj),"response1",JSON.stringify(response1['result']));
        expect(JSON.stringify(obj)).to.equal(JSON.stringify(response1['result']));
        expect(response1['statusCode']).to.equal(200);
        expect(response1['isSuccess']).to.equal(true);
        expect(typeof (response['result'])).to.equal('object')
    })

    for (i = 0; i < companiesFailurePayload.length; i++) {

        let payload = companiesFailurePayload[i];

        it('Failures', async (done) => {

            let ServerInstanceObj = await require('../tests/getServerInstance');
            console.log("Resource url", resourceUrl);
            const injectOptions = {
                method: 'POST',
                headers: { authorization: true },
                url: resourceUrl,
                payload: payload
            }
            const res = await ServerInstanceObj.server.inject(injectOptions);

            let reponse = JSON.parse(res.payload)

            console.log(injectOptions.payload);
            console.log("URL And Message payload number :-- ", injectOptions.url, " :-  ", reponse['message'])
            console.log(reponse['result']);
            expect(reponse['statusCode']).to.equal(406);
            expect(reponse['isSuccess']).to.equal(false);
            expect(typeof (reponse['result'])).to.equal('object')

        })
    }

    // it('Failures', async (done) => {

    //     let ServerInstanceObj = await require('../tests/getServerInstance');
    //     console.log("Resource url", resourceUrl);
    //     const injectOptions = {
    //         method: 'POST',
    //         headers: { authorization: "123" },
    //         url: resourceUrl,
    //         payload: companiesSuccessPayload
    //     }
    //     const res = await ServerInstanceObj.server.inject(injectOptions);

    //     let reponse = JSON.parse(res.payload)

    //     console.log(injectOptions.payload)
    //     console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
    //     console.log("secondlast",reponse['statusCode']);

    //     expect(reponse['statusCode']).to.equal(406);
    //     expect(reponse['isSuccess']).to.equal(false);
    //     expect(typeof (reponse['result'])).to.equal('object')

    // })

    // it('Failures', async (done) => {

    //     let ServerInstanceObj = await require('../tests/getServerInstance');
    //     console.log("Resource url", resourceUrl);
    //     const injectOptions = {
    //         method: 'POST',
    //         headers: { authorization: "" },
    //         url: resourceUrl,
    //         payload: companiesSuccessPayload
    //     }
    //     const res = await ServerInstanceObj.server.inject(injectOptions);

    //     let reponse = JSON.parse(res.payload)

    //     console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
    //     // console.log(reponse);

    //     expect(reponse['statusCode']).to.equal(406);
    //     expect(reponse['isSuccess']).to.equal(false);
    //     expect(typeof (reponse['result'])).to.equal('object')
        
    // })

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'POST',
            headers: { authorization: true },
            url: resourceUrl

        }
        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload)

        console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])

        expect(reponse['statusCode']).to.equal(406);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    })

    // it('Failures', async (done) => {

    //     let ServerInstanceObj = await require('../tests/getServerInstance');
    //     console.log("Resource url", resourceUrl);
    //     const injectOptions = {
    //         method: 'POST',
    //         url: resourceUrl,
    //         payload: companiesSuccessPayload
    //     }
    //     const res = await ServerInstanceObj.server.inject(injectOptions);

    //     let reponse = JSON.parse(res.payload)

    //     console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
    //     // console.log(reponse);
    //     console.log(reponse['statusCode']);

    //     expect(reponse['statusCode']).to.equal(406);
    //     expect(reponse['isSuccess']).to.equal(false);
    //     expect(typeof (reponse['result'])).to.equal('object')

    // })

});



//Get All Entry

describe('unit tests - companies Get All Entry', () => {

    it('Success', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl
        }

        const res = await ServerInstanceObj.server.inject(injectOptions);

        let response = JSON.parse(res.payload)


        console.log("URL And Message :-- ", injectOptions.url, " :-  ", response['message'])
        // console.log(reponse);

        _id = response['result']['list'][0]['companyId'];
        expect(JSON.stringify(obj)).to.equal(JSON.stringify(response['result']['list'][0]));

        expect(response['statusCode']).to.equal(200);
        expect(response['isSuccess']).to.equal(true);
        expect(typeof response['result']).to.equal('object')
        expect(typeof (response['result'])).to.equal('object')

    })
});

//Get Single  Entry

describe('unit tests - companies Get Single Entry', () => {

    it('Success', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl + "/" + _id
        }

        const res = await ServerInstanceObj.server.inject(injectOptions);

        let response = JSON.parse(res.payload)

        console.log("URL And Message :-- ", injectOptions.url, " :-  ", response['message'])
        // console.log(reponse);
        expect(JSON.stringify(obj)).to.equal(JSON.stringify(response['result']));
        expect(response['statusCode']).to.equal(200);
        expect(response['message']).to.equal("Success");
        expect(response['isSuccess']).to.equal(true);
        expect(typeof (response['result'])).to.equal('object')

    })

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);

        const injectOptions = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl + "/" + "aa"
        }
        
        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload)

        console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
        // console.log(reponse);

        expect(reponse['statusCode']).to.equal(406);
      //  expect(reponse['statusCode']).to.equal(500);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    }),

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);

        const injectOptions = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl + "/" + emptyId
        }
        
        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload)

        console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
        // console.log(reponse);

        expect(reponse['statusCode']).to.equal(406);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    })
});


//Update Entry
describe('unit tests - companies Update Entry', () => {

    it('Success', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'PUT',
            headers: { authorization: false },
            url: resourceUrl + "/" + _id,
            payload: companiesUpdatePayload
        }
        const res = await ServerInstanceObj.server.inject(injectOptions);

        let response = JSON.parse(res.payload)
        console.log("updatecompany_id",_id);
        console.log(injectOptions.payload);
        console.log("Update URL And Message :-- ", injectOptions.url, " :-  ", response['message'])
    //    console.log("resssult",reponse['result'][0]['companyId']);

        let id = response['result'][0]["companyId"];
        console.log(id);
      //  expect(JSON.stringify(obj)).to.equal(JSON.stringify(response['result'][0]));
        expect(response['statusCode']).to.equal(200);
        expect(response['isSuccess']).to.equal(true);
        expect(typeof (response['result'])).to.equal('object')

        // Check Entry present or not 
        const injectOptions2 = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl + "/" + id
        }

        const res1 = await ServerInstanceObj.server.inject(injectOptions2);

        let reponse1 = JSON.parse(res1.payload)
        console.log(injectOptions.payload)
        console.log("URL And Message :-- ", injectOptions2.url, " :-  ", reponse1['message'])
        console.log(reponse1['result']);
        
        expect(reponse1['statusCode']).to.equal(200);
        expect(reponse1['isSuccess']).to.equal(true);
        expect(typeof (reponse1['result'])).to.equal("object")
        expect(injectOptions['payload']['title'] == reponse1['result']['title']).to.equal(true);

    })


    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);

        const injectOptions = {
            method: 'PUT',
            headers: { authorization: 'abcd' },
            url: resourceUrl + "/" + "aa",
            payload: companiesFailurePayload
        }

        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload);
        console.log("Update URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])

        expect(reponse['statusCode']).to.equal(406);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    }),

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);

        const injectOptions = {
            method: 'PUT',
            headers: { authorization: 'abcd' },
            url: resourceUrl + "/" + emptyId,
            payload: companiesSuccessPayload
        }

        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload);
        console.log("Update URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])

        expect(reponse['statusCode']).to.equal(406);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    })

    for (i = 0; i < companiesFailurePayload.length; i++) {

        let payload = companiesFailurePayload[i];
        it('Failures', async (done) => {

            let ServerInstanceObj = await require('../tests/getServerInstance');
            console.log("Resource url", resourceUrl);
    
            const injectOptions = {
                method: 'PUT',
                headers: { authorization: false },
                url: resourceUrl + "/" + _id,
                payload: payload
            }
    
            const res = await ServerInstanceObj.server.inject(injectOptions);
    
            let reponse = JSON.parse(res.payload);
            console.log("Update URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
    
            expect(reponse['statusCode']).to.equal(406);
            expect(reponse['isSuccess']).to.equal(false);
            expect(typeof (reponse['result'])).to.equal('object')
    
        })
    }
});


//Delete entry

describe('unit tests - companies Delete Entry', () => {

    it('Success', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);
        const injectOptions = {
            method: 'DELETE',
            headers: { authorization: false },
            url: resourceUrl + "/" + _id
        }
        const res = await ServerInstanceObj.server.inject(injectOptions);

        //console.log("Res", res.payload);
        let reponse = JSON.parse(res.payload)
        console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
        // console.log(reponse);

        expect(reponse['statusCode']).to.equal(200);
        expect(reponse['isSuccess']).to.equal(true);
        expect(typeof (reponse['result'])).to.equal('object')

        // Check Entry present or not 
        const injectOptions2 = {
            method: 'GET',
            headers: { authorization: false },
            url: resourceUrl + "/" + _id
        }

        const res1 = await ServerInstanceObj.server.inject(injectOptions2);

        let reponse1 = JSON.parse(res1.payload)
        console.log("URL And Message :-- ", injectOptions2.url, " :-  ", reponse1['message'])
        // console.log(reponse1);

        expect(reponse1['statusCode']).to.equal(400);
        expect(reponse1['message']).to.equal("Entry Not Present");
        expect(reponse1['isSuccess']).to.equal(false);
        expect(typeof (reponse1['result'])).to.equal("object")

    })

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);

        const injectOptions = {
            method: 'DELETE',
            headers: { authorization: 'abcd' },
            url: resourceUrl + "/" + "aa",
        }

        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload);
        console.log("DELETE URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])

        expect(reponse['statusCode']).to.equal(406);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    }),

    it('Failures', async (done) => {

        let ServerInstanceObj = await require('../tests/getServerInstance');
        console.log("Resource url", resourceUrl);

        const injectOptions = {
            method: 'DELETE',
            headers: { authorization: false },
            url: resourceUrl + "/" + emptyId,
        }

        const res = await ServerInstanceObj.server.inject(injectOptions);

        let reponse = JSON.parse(res.payload);
        console.log("DELETE URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])

        expect(reponse['statusCode']).to.equal(406);
        expect(reponse['isSuccess']).to.equal(false);
        expect(typeof (reponse['result'])).to.equal('object')

    })

});
