export const companyMetersSuccessPayload = {

    "meterId": 6,   
    "location" : "string",
    "uniqueSerialNumber" : "string",
    "name": "string",
    "techniciansId": ["string"],
    "meterParameters": ["string",],
    "isDeleted" : 0,
    "isActive" : 1 
}


export const companyMetersUpdatePayload = {

    "meterId": 6,   
    "location" : "back",
    "uniqueSerialNumber" : "1234abc",
    "name": "testmeter",
    "techniciansId": [1,2],
    "meterParameters": ["string"],
    "isDeleted" : 0,
    "isActive" : 1 
}

export const companyMetersFailurePayload = [
    {

        "meterId": "string",   
        "location" : "back",
        "uniqueSerialNumber" : "1234",
        "name": "testmeter",
        "techniciansId": [1,2],
        "meterParameters": ["string"],
        "isDeleted" : 0,
        "isActive" : 1 
    },
    {

        "meterId": "1122334455",   
        "location" : "back",
        "uniqueSerialNumber" : 1234,
        "name": "testmeter",
        "techniciansId": [1,2],
        "meterParameters": ["string"],
        "isDeleted" : 0,
        "isActive" : 1 
    }

]