export const shiftsSuccessPayload = {

    "name": "string",
    "startTime": "string",
    "endTime": "string",
    "isActive": 1,
    "isDeleted": 0
}


export const shiftsUpdatePayload = {

    "name": "morning-eve",
    "startTime": "string",
    "endTime": "string",
    "isActive": 1,
    "isDeleted": 0
}

export const shiftsFailurePayload = [
    {

        "name": "string",
        "startTime": "string",
        "endTime": "string",
        "isActive": "1a",
        "isDeleted": "0"
    },
    {

        "name": 11,
        "startTime": "string",
        "endTime": "string",
        "isActive": 1,
        "isDeleted": 0
    }

]