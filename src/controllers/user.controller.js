import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.send(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler(async (req, res) =>{
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email, username, password} = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    
    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials")
    }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler( async(req, res) =>{
    const incomingRefreshToken=req.cookies.refreshToken ?? body.req.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError('401', "Unauthorise token")
    }

    const decoded=jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET)

    try {
        const user = User.findById(decoded?._id);
    
        if(!user){
            throw new ApiError('401', "Invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError('401', "Invalid refresh token or expired")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const{accessToken, newrefreshToken}=await generateAccessAndRefereshTokens(user?._id)
    
        res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken:newrefreshToken},
                "Access token refresh"
            )
        )
    } catch (error) {
        throw new ApiError('401', error?.message ?? "Invalid refresh token or expired")
        
    }

})

const changeCurrentPassword=asyncHandler(async(req, res)=>{

        const{oldPassword, newPassword}= req.body;
        const user= await User.findById(req?.user?._id)
        const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

        if(!isPasswordCorrect){
            throw new ApiError('400', "Invalid Password")
        }

        user.password=newPassword
        await user.save({validateBeforeSave:false})

        res
        .status(200)
        .json(new ApiResponse(200,{}, "Password Changed successfully."))
})

const getCurrentUser =asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user,"feched succefully"))
})

const updateAccountDetails = asyncHandler(async(req, res)=>{

    const {fullName, email}=req.body;
    if (!fullName ?? !email) {
        throw new ApiError(400, "Enter requred field")
    }

    const user=await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200,user, "accound details updated successfully"))
})

const updateAvatarImage= asyncHandler(async(req, res)=>{

    const avatarLocalPath=req?.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avtar=await uploadOnCloudinary(avatarLocalPath);

    if(!avtar.url){
        throw new ApiError(400, "Avatar file url is missing")
    }

    const user=await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set:{
                avatar:avtar?.url
            }
        },
        {new:true}
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avtar image updated successfully"))
})

const updateUserCoverImage= asyncHandler(async(req, res)=>{

    const userCoverLocalPath=req?.file?.path;
    if (!userCoverLocalPath) {
        throw new ApiError(400, "userCover file is missing")
    }

    const coverImg=await uploadOnCloudinary(userCoverLocalPath);

    if(!coverImg.url){
        throw new ApiError(400, "userCover file url is missing")
    }

    const user=await User.findByIdAndUpdate(
        req?.user?._id,
        {
            $set:{
                coverImage:coverImg?.url
            }
        },
        {new:true}
    ).select('-password')

    return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
    const{username} =req.params;
    if (!username?.trim()) {
        throw new ApiError(400,"User name is missing")
    }

    const channel= await User.aggregate([
        {
            $match:{
                username:username.toLowerCase()
            },
        },
        {
            $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subcriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribeTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{ 
                    $size:"$subscribers"
                },
                subscribeToCount:{ 
                    $size:"$subscribeTo"
                },
                isSubscribed:{
                    //$in:[mongoose.Types.ObjectId(req?.user?._id), "$subscribers.subscriber"]
                    $cond:{
                        if:{
                            $in:[req?.user?._id, "$subscribers.subscriber"]
                        },
                        then:true,
                        else:false
                    }

                }
            }
        },
        {
            $project:{
                fullName:1,
                username:1,
                subscribersCount:1,
                subscribeToCount:1,
                isSubscribed:1,
                avatar:1,
                coverImage:1,
                email:1,
            }
        }
    ])

    if (!channel?.length) {
        throw new ApiError(404, "Channel not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "Channel fetched successfully"))

})

const getWatchHistory= asyncHandler(async(req, res)=>{

    const user= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req?.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                //$arrayElemAt:["$owner", 0]
                                $first:"$owner"
                            }
                        }
                    }
                ]
            }
        },
        
    ])

    if(!user?.length){
        throw new ApiError(404, "User not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user[0], "Watch history fetched successfully"))
   
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatarImage,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}