export const companiesSuccessPayload = {

    "companyName" :"string",
    "noOfUsers" : 0,
    "city" : "string",
    "state" :"string",
    "country" : "string",
    "address" : "string",
    "isDeleted" : 0,
    "isActive" : 1
}


export const companiesUpdatePayload = {

    "companyName" :"Infosystem",
    "noOfUsers" :3,
    "city" : "pune",
    "state" :"maharashtra",
    "country" : "india",
    "address" : "baner",
    "isDeleted" : 0,
    "isActive" : 1
}

export const companiesFailurePayload = [
    {

        "companyName" :"string",
        "noOfUsers" : "3a",
        "city" : "baner",
        "state" :"maharashtra",
        "country" : "india",
        "address" : "baner",
        "isDeleted" : "0",
        "isActive" : 1
    },
    {

        "companyName" :11,
        "noOfUsers" :0,
        "city" : "pune",
        "state" :"maharashtra",
        "country" : "india",
        "address" : "pune",
        "isDeleted" : 0,
        "isActive" : 1
    },
    {

        "companyName" :"abc",
        "noOfUsers" :0,
        "city" : "pune",
        "state" :"maharashtra",
        "country" : "india",
        "address" : "pune",
        "isDeleted" : "0a",
        "isActive" : 1
    }

]