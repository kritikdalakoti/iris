export const metersSuccessPayload = {

    "modelName":"string",
    "manufacturingCompanyName":"string",
    "isActive" : 1,
    "isDeleted": 0  
}


export const metersUpdatePayload = {

    "modelName":"New Meter1 testing",
    "manufacturingCompanyName":"new Company testing",
    "isActive" : 1,
    "isDeleted": 0  
}

export const metersFailurePayload = [
    {

        "modelName":"testing",
        "manufacturingCompanyName": 11,
        "isActive" : 1,
        "isDeleted": 0  
    },
    {

        "modelName":"testing",
        "manufacturingCompanyName": "testing",
        "isActive" : 1,
        "isDeleted": "0q" 
    },
   
]