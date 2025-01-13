import { Router } from "express";
import { 
    changeCurrentPassword,
    getUserChannelProfile,
    updateUserCoverImage,
    updateAccountDetails,
    refreshAccessToken,
    updateAvatarImage,
    getCurrentUser,
    registerUser, 
    logoutUser,
    loginUser, 
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
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatarImage)
router.route("/get-user-channel/:userame").get(verifyJWT, getUserChannelProfile)
router.route("/change-password").post(verifyJWT,  changeCurrentPassword)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/get-watchHistory").get(verifyJWT, getWatchHistory)
router.route("/get-user").get(verifyJWT, getCurrentUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/logout").post(verifyJWT,  logoutUser)

export default router