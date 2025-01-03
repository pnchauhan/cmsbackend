import {asyncHandler} from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js";

export const verifyJWT= asyncHandler(async(req, res, next)=>{
   try {
    const token= req?.cookies?.accessToken ?? req.header("Authorization")?.replace("Bearer ", "");
 
     if(!token){
         return res.status(200).json({ status:"fail", message:"Unathorised User", data:[]}) 
     
     }
 
     const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     const user= await User.findById(decodedToken._id).select("-password -refreshToken");
     if(!user){
         return res.status(401).json({ status:"fail", message:"Invalid access token", data:[]})
     }
 
     req.user=user;
     next();
   } catch (error) {
    return res.status(404).json({ status:"fail", message:"something went wrong", data:[]})
   }

})