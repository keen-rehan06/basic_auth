import express from "express"
import {isLoggedIn, loginMiddleware, regisetrMiddleWare} from "../middleware/auth.middleware.js"
import {loginUser, logoutUser, refreshAccessToken, registerUser, verification} from "../controllers/auth.controller.js"

const app = express.Router();

app.post("/register",regisetrMiddleWare,registerUser);
app.post("/verify",verification);
app.post("/refresh",refreshAccessToken)
app.post("/login",loginMiddleware,loginUser);   
app.get("/logout",isLoggedIn,logoutUser);

export default app;