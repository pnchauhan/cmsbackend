import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/apiResponse.js";

const generateAccessAndRefreshTOken=async(userId)=>{

    try{

        const user=await User.findById({userId});
        const accessToken= await user.generateAccessToken();
        const refreshToken= await generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken, refreshToken}

    }catch(error){
        return res.status(401).json({ status:"fail", message:"Someething went wrong while generating Access and Refresh token", data:[]}) 
    }
}

const registerUser=asyncHandler( async(req, res)=>{

    const { fullName, username, email, password } = req.body;

    
    if(
        [fullName, username, email, password].some((field)=>field?.trim()==="")
    ){
       throw new ApiError(4000, "all field are required")
    }


    const existedUser=await User.findOne({
        $or:[{username}, {email}]
    })

    if(existedUser){
       
       throw new ApiError(409, "user already exist")
        
    }
  
    
    const avatarLocalPath =req.files?.avatar[0]?.path;
 
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath =req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatarUrl= await uploadOnCloudinary(avatarLocalPath);
    const coverImageUrl= await uploadOnCloudinary(coverImageLocalPath);

    if(!avatarUrl){
        throw new ApiError(409, "avatar imageis require")
    }
 
   
    const user = await User.create({
        fullName,
        avatar: avatarUrl?.url ?? "",
        coverImage: coverImageUrl.url ?? "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser= await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "user not created");
        
    }

    return res.send(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser= asyncHandler(async(req, res)=>{

    const { email, username, password} = req.body;

    if(username=="" ?? password==""){
        return res.status(200).json({ status:"fail", message:"Fild are requred", data:[]})
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        return res.status(404).json({ status:"fail", message:"User does not exist", data:[]}) 
    }

    const isPasswordValid=user.isPasswordValid(password);
    if(!isPasswordValid){
        return res.status(401).json({ status:"fail", message:"Password incorrect", data:[]}) 
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshTOken(user._id );
    const loggedInUser = await User.findById({_id}).select('-password -refreshToken');

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookies("accessToken", accessToken, options)
    .cookies("refreshToken", refreshToken, options)
    .json({status:"success", mesages:"User logged In successfully", data:{loggedInUser,accessToken, refreshToken}})

})

const loggedOutUser=asyncHandler(async(req, res)=>{

    const user= await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options={
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearcookies("accessToken", options)
    .clearcookies("refreshToken", options)
    .json({status:"success", mesages:"User logged out successfully", data:[]})


})

export{
    loggedOutUser,
    registerUser,
    
    loginUser,
}

