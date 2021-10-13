// export { };

// const Code = require('@hapi/code');
// const Lab = require('@hapi/lab');

// import {companyMetersFailurePayload,companyMetersSuccessPayload,companyMetersUpdatePayload} from '../tests/payloads/company-meters-payloads'
// const { describe, it } = exports.lab = Lab.script();
// const { expect } = Code;


// var _id;
// var i;
// var companyId;
// console.log("I am in testing file, ServerInstance");




// describe('unit tests - company-meters details Get all Entry For companyId', () => {

//     let resource = "company-meters";
    
//     let version = "/v1.0.0";

//     it('Success', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", "/api"+version+"/companies");
//         const injectOptions = {
//             method: 'GET',
//             headers: { authorization: false },
//             url:  "/api"+version+"/companies"
//         }

//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)


//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//         // console.log(reponse);

//         companyId = reponse['result']['list'][0]['companyId'];
//         console.log("/////companyId",companyId);
//         expect(reponse['statusCode']).to.equal(200);
//         expect(reponse['isSuccess']).to.equal(true);
//         expect(typeof reponse['result']).to.equal('object')
//         expect(typeof (reponse['result'])).to.equal('object')
//         let baseUrl = `/companies/${companyId}/`;
//         let resourceUrl = "/api" + version + baseUrl + resource;

//   // path check
//   describe('unit tests - company-meters Api Path Check', () => {

//     it('Failures', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         const injectOptions = {
//             method: 'POST',
//             headers: { authorization: false },
//             url: "/api"+version+"companies/{companyId}/"+resource,
//             payload: companyMetersSuccessPayload
//         }
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)

//    //     console.log(injectOptions.payload)
//     //    console.log("Companies API Path Check URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//   //    console.log("path check",reponse['statusCode']);

//         expect(reponse['statusCode']).to.equal(404);

//     })
// });

// //Create entry

// describe('unit tests - company-meters Create Entry', () => {

//     it('Success', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         const injectOptions = {
//             method: 'POST',
//             headers: { authorization: false },
//             url: resourceUrl,
//             payload: companyMetersSuccessPayload
//         }
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)

//        console.log(injectOptions.payload)
//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//         // console.log(reponse);
//         console.log("ressult",reponse['result']['companyMeterId']);
//         var id = reponse['result']['companyMeterId'];
//        // console.log("id",id)

//         expect(reponse['statusCode']).to.equal(201);
//         expect(reponse['isSuccess']).to.equal(true);
//         expect(typeof (reponse['result'])).to.equal('object')

//         // Check Entry present or not 
//         const injectOptions2 = {
//             method: 'GET',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + id
//         }
//         const res1 = await ServerInstanceObj.server.inject(injectOptions2);

//         let reponse1 = JSON.parse(res1.payload)

//       //  console.log("response1",res1.result);
//       //  console.log(injectOptions.payload)
//         console.log("URL And Message :-- ", injectOptions2.url, " :-  ", reponse1['message'])

//         expect(reponse1['statusCode']).to.equal(200);
//         expect(reponse1['isSuccess']).to.equal(true);
//         expect(typeof (reponse['result'])).to.equal('object')
//     })

//     for (i = 0; i < companyMetersFailurePayload.length; i++) {

//         let payload = companyMetersFailurePayload[i];

//         it('Failures', async (done) => {

//             let ServerInstanceObj = await require('../tests/getServerInstance');
//             console.log("Resource url", resourceUrl);
//             const injectOptions = {
//                 method: 'POST',
//                 headers: { authorization: true },
//                 url: resourceUrl,
//                 payload: payload
//             }
//             const res = await ServerInstanceObj.server.inject(injectOptions);

//             let reponse = JSON.parse(res.payload)

//             console.log(injectOptions.payload)
//             console.log("URL And Message payload number :-- ", injectOptions.url, " :-  ", reponse['message'])
//             console.log(reponse['result']);
//             console.log("thirdlast",reponse['statusCode']);
//             expect(reponse['statusCode']).to.equal(406);
//             expect(reponse['isSuccess']).to.equal(false);
//             expect(typeof (reponse['result'])).to.equal('object')

//         })
//     }

//     // it('Failures', async (done) => {

//     //     let ServerInstanceObj = await require('../tests/getServerInstance');
//     //     console.log("Resource url", resourceUrl);
//     //     const injectOptions = {
//     //         method: 'POST',
//     //         headers: { authorization: "123" },
//     //         url: resourceUrl,
//     //         payload: companiesSuccessPayload
//     //     }
//     //     const res = await ServerInstanceObj.server.inject(injectOptions);

//     //     let reponse = JSON.parse(res.payload)

//     //     console.log(injectOptions.payload)
//     //     console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//     //     console.log("secondlast",reponse['statusCode']);

//     //     expect(reponse['statusCode']).to.equal(406);
//     //     expect(reponse['isSuccess']).to.equal(false);
//     //     expect(typeof (reponse['result'])).to.equal('object')

//     // })

//     // it('Failures', async (done) => {

//     //     let ServerInstanceObj = await require('../tests/getServerInstance');
//     //     console.log("Resource url", resourceUrl);
//     //     const injectOptions = {
//     //         method: 'POST',
//     //         headers: { authorization: "" },
//     //         url: resourceUrl,
//     //         payload: companiesSuccessPayload
//     //     }
//     //     const res = await ServerInstanceObj.server.inject(injectOptions);

//     //     let reponse = JSON.parse(res.payload)

//     //     console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//     //     // console.log(reponse);

//     //     expect(reponse['statusCode']).to.equal(406);
//     //     expect(reponse['isSuccess']).to.equal(false);
//     //     expect(typeof (reponse['result'])).to.equal('object')
        
//     // })

//     it('Failures', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         const injectOptions = {
//             method: 'POST',
//             headers: { authorization: true },
//             url: resourceUrl

//         }
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)

//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//          console.log("lassttt",reponse['statusCode']);

//         expect(reponse['statusCode']).to.equal(406);
//         expect(reponse['isSuccess']).to.equal(false);
//         expect(typeof (reponse['result'])).to.equal('object')

//     })

//     // it('Failures', async (done) => {

//     //     let ServerInstanceObj = await require('../tests/getServerInstance');
//     //     console.log("Resource url", resourceUrl);
//     //     const injectOptions = {
//     //         method: 'POST',
//     //         url: resourceUrl,
//     //         payload: companiesSuccessPayload
//     //     }
//     //     const res = await ServerInstanceObj.server.inject(injectOptions);

//     //     let reponse = JSON.parse(res.payload)

//     //     console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//     //     // console.log(reponse);
//     //     console.log(reponse['statusCode']);

//     //     expect(reponse['statusCode']).to.equal(406);
//     //     expect(reponse['isSuccess']).to.equal(false);
//     //     expect(typeof (reponse['result'])).to.equal('object')

//     // })

// });



// //Get All Entry

// describe('unit tests - company-meters Get All Entry', () => {

//     it('Success', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         const injectOptions = {
//             method: 'GET',
//             headers: { authorization: false },
//             url: resourceUrl
//         }
        
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)

//         console.log(res.payload);
//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//         console.log(reponse);

//         _id = reponse['result']['list'][0]['companyMeterId'];
//         console.log("companyMeterId",reponse);
//         expect(reponse['statusCode']).to.equal(200);
//         expect(reponse['isSuccess']).to.equal(true);
//         expect(typeof reponse['result']).to.equal('object')
//         expect(typeof (reponse['result'])).to.equal('object')

//     })
// });


// //Get Single  Entry

// describe('unit tests - company-meters Get Single Entry', () => {

//     it('Success', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         const injectOptions = {
//             method: 'GET',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + _id
//         }

//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)

//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//         // console.log(reponse);

//         expect(reponse['statusCode']).to.equal(200);
//         expect(reponse['message']).to.equal("Success");
//         expect(reponse['isSuccess']).to.equal(true);
//         expect(typeof (reponse['result'])).to.equal('object')

//     })

//     it('Failures', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);

//         const injectOptions = {
//             method: 'GET',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + "aa"
//         }
        
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)

//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//         // console.log(reponse);

//      //   expect(reponse['statusCode']).to.equal(406);
//         expect(reponse['statusCode']).to.equal(406);
//         expect(reponse['isSuccess']).to.equal(false);
//         expect(typeof (reponse['result'])).to.equal('object')

//     })
// });


// //Update Entry
// describe('unit tests - company-meters Update Entry', () => {

//     it('Success', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         console.log("_updattteid", _id);
//         const injectOptions = {
//             method: 'PUT',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + _id,
//             payload: companyMetersUpdatePayload
//         }
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload)
//         console.log("updatecompany_id",_id);
//         console.log(injectOptions.payload);
//         console.log("Update URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//     //    console.log("resssult",reponse['result'][0]['companyMeterId']);

//         let id = reponse['result'][0]["companyMeterId"];
//         console.log(id);
//         expect(reponse['statusCode']).to.equal(200);
//         expect(reponse['isSuccess']).to.equal(true);
//         expect(typeof (reponse['result'])).to.equal('object')

//         // Check Entry present or not 
//         const injectOptions2 = {
//             method: 'GET',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + id
//         }

//         const res1 = await ServerInstanceObj.server.inject(injectOptions2);

//         let reponse1 = JSON.parse(res1.payload)
//         console.log(injectOptions.payload)
//         console.log("URL And Message :-- ", injectOptions2.url, " :-  ", reponse1['message'])
//         console.log(reponse1['result']);

//         expect(reponse1['statusCode']).to.equal(200);
//         expect(reponse1['isSuccess']).to.equal(true);
//         expect(typeof (reponse1['result'])).to.equal("object")
//         expect(injectOptions['payload']['title'] == reponse1['result']['title']).to.equal(true);

//     })

//     it('Failures', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);

//         const injectOptions = {
//             method: 'PUT',
//             headers: { authorization: 'abcd' },
//             url: resourceUrl + "/" + "aa",
//             payload: companyMetersFailurePayload
//         }

//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         let reponse = JSON.parse(res.payload);
//         console.log("Update URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])

//         expect(reponse['statusCode']).to.equal(406);
//         expect(reponse['isSuccess']).to.equal(false);
//         expect(typeof (reponse['result'])).to.equal('object')

//     })
// });




// //Delete entry

// describe('unit tests - company-meters Delete Entry', () => {

//     it('Success', async (done) => {

//         let ServerInstanceObj = await require('../tests/getServerInstance');
//         console.log("Resource url", resourceUrl);
//         const injectOptions = {
//             method: 'DELETE',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + _id
//         }
//         const res = await ServerInstanceObj.server.inject(injectOptions);

//         //console.log("Res", res.payload);
//         let reponse = JSON.parse(res.payload)
//         console.log("URL And Message :-- ", injectOptions.url, " :-  ", reponse['message'])
//         // console.log(reponse);

//         expect(reponse['statusCode']).to.equal(200);
//         expect(reponse['isSuccess']).to.equal(true);
//         expect(typeof (reponse['result'])).to.equal('object')

//         // Check Entry present or not 
//         const injectOptions2 = {
//             method: 'GET',
//             headers: { authorization: false },
//             url: resourceUrl + "/" + _id
//         }

//         const res1 = await ServerInstanceObj.server.inject(injectOptions2);

//         let reponse1 = JSON.parse(res1.payload)
//         console.log("URL And Message :-- ", injectOptions2.url, " :-  ", reponse1['message'])
//         // console.log(reponse1);

//         expect(reponse1['statusCode']).to.equal(400);
//         expect(reponse1['message']).to.equal("Entry Not Present");
//         expect(reponse1['isSuccess']).to.equal(false);
//         expect(typeof (reponse1['result'])).to.equal("object")

//         })
//     });

//     });
// });