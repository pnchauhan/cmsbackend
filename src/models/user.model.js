import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema=new Schema(
    {
        username:{
            type:String,
            required: true,
            uinique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type:String,
            required: true,
            uinique: true,
            lowercase: true,
            trim: true,
        },
        fullname:{
            type:String,
            required: true,
            trim: true,
            index:true

        },
        avatar:{
            type: String,//cloudanary images
            required: true
        },
        coverImage:{
            type: String,//cloudanary images
        },
        watchHistory:[
            {
                type: Schema.type.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type: String,
            required:[true, 'Possword is required.']
        },
        refreshToken:{
            type: String,

        }
    }
,{timestamps:true}
)

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password=bcrypt.hash(this.password, 10);
        next()
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken=function(){

   return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            usename: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken=function(){

    return jwt.sign(
        {
            _id: this._id,
        
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

}

export const User=mongoose.model("User", userSchema);