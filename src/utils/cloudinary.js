import { v2 as cloudinary } from 'cloudinary';
import { response } from 'express';
import fs from "fs";

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUDE_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async(localFilePath) =>{

    try {

        if(!localFilePath) return null;
        //upload the file on cloudnary
       const respose=await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file uploaded successful
        console.log("file uploaded on cloudnary", respose );

        return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)
        //remove file from local server hen upaloaded got failed
        return null;
    }

}

export{uploadOnCloudinary}

