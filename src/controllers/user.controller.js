import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import User from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponce.js";

const registerUser=asyncHandler( async(req, res)=>{

    const{fullname, username, email, password}=req.body;

    if(
        [fullname, username, email, password].some((field)=>field?.trim()==="")
    ){
       throw new ApiError(4000, "all field are required")
    }

    const existedUser=await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "user already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    const avatarUrl= await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl= await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarUrl){
        throw new ApiError(409, "avatar imageis require")
    }

    const user = await User.create({
        fullname,
        avatar: avatarUrl?.url,
        coverImage: coverImageUrl.url,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select('-password', "-refreshToken");

    if(!createdUser){
        throw new ApiError(500, "user not created");
        
    }

    return res.status(201).json(
       new ApiResponse(200, createdUser, 'user created successfully');
    )
})

export{
    registerUser
}