import { Router } from "express";
import { 
    loginUser, 
    logoutUser,
    registerUser, 
   refreshAccessToken,
   changeCurrentPassword,
   updateUserCoverImage,
   updateAccountDetails,
   updateAvatarImage,
   getCurrentUser,
   getUserChannelProfile

   
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"



const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,  changeCurrentPassword)
router.route("/get-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatarImage)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/get-user-channel/:userame").get(verifyJWT, getUserChannelProfile)
router.route("/get-watchHistory").get(verifyJWT, getWatchHistory)
export default router