class ApiResponse{

    constructor(statusCode, data, message="succes"){

        this.success=statusCode
        this.statusCode=statusCode
        this.message=message
        this.data=data
    }
}

export { ApiResponse }