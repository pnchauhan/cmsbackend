const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise
        .resolve(requestHandler(req, res, next()))
        .catch((error)=>next(error))//we can also use reject on place of catch
    }
}

export{asyncHandler}


// const asyncHandler= (fn)=>async(req, res, next) =>{

//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code ?? 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }