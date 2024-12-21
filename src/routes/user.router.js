import { Router } from "express";
import {loginUser, registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const routes= Router();

routes.route('/register').post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

routes.route('/login').post(loginUser);



export default routes