import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import { 
    generateAccessToken,
    generateRefreshToken,
    generateToken,
     } from "../config/generateToken.js";

export const registerUser = async (req,res) => {
    try {
        const {name,username,email,password} = req.body;
        const hash = await bcrypt.hash(password,10);
        const user = await userModel.create({
            name,
            username,
            email,
            password:hash
        });
        const newuser = await userModel.findById(user._id).select("-password");
        const token = generateToken(user);
        res.cookie("token",token)
        newuser.token = token
        await newuser.save();
       return res.status(200)
       .send({message:"User Created SuccessFully!!",success:true,user:newuser,token})
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({message:"Server Error",error:error.message})
    }
}

export const verification = async(req,res) => {
    try {
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            return res.status(401).send({message:"The registration token has expired"})
        }
        const token = authHeader.split(" ")[1];
        let decoded;
        try {
            decoded = jwt.verify(token,process.env.JWT_SECRET);
        } catch (error) {
            if (err.name === "TokenExpiredError") {
                return res.status(400).json({
                    success: false,
                    message: "The registration token has expired"
                })
            }
            return res.status(400).json({
                success: false,
                message: "Token verification failed"
            })
        }
         const user = await userModel.findById(decoded.id);
           if(!user) {
             res.status(404).send({message:"User not found",success:false});
        }
           user.token = null;
           user.isVerified = true;
           await user.save();
           return res.status(200).send({message:`User ${user.name} is verified Successfully!!`,success:true})
    } catch (error) {
        return res.status(500).send({message:"Server Error",success:false});    
    }
}

export const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body;
        const user = await userModel.findOne({email});
        const comparePassword = await bcrypt.compare(password,user.password);
        if(!comparePassword) return res.status(401).send({message:"password is incorrect",success:false})
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        user.refreshtoken = refreshToken;
        user.isLoggedin = true
        await user.save();
        const options = {
            httpOnly: true,
            secure: false
        }
        console.log("hogaya");
        
        return res
        .status(200)
        .cookie("accesstoken",accessToken,options)
        .cookie("refreshtoken",refreshToken,options)
        .send({message:`Welcome back ${user.name}`,success:true,user:user,accessToken,refreshToken})
    } catch (error) {
        console.log(error.message)
        return res.status(500).send({message:"Server error",success:false})
    }
}

export const logoutUser = async (req,res) => {
    try {
        const user = req.user.id;
        const newUser = await userModel.findById(user);
        newUser.refreshtoken = null;
        newUser.isLoggedin = false;
        await newUser.save()
        res.clearCookie("accesstoken");
        res.clearCookie("refreshtoken");
        res.clearCookie("token");
        res.status(200).send({message:"User logout!!",success:true});
    } catch (error) {
        return res.status(500).send({message:"Internal Server Error",error:error.message})
    }
}
export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshtoken || req.body?.refreshtoken;

    if (!incomingRefreshToken) {
        console.log(incomingRefreshToken)
      return res.status(401).json({
        message: "Unauthorized request",
        success: false,
      });
    }

    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Match token with DB
    if (incomingRefreshToken !== user.refreshtoken) {
      return res.status(403).json({
        message: "Refresh token expired or already used",
        success: false,
      });
    }

    // Generate new tokens
    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save new refresh token in DB
    user.refreshtoken = newRefreshToken;
    await user.save();

    const options = {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        message: "Access token refreshed successfully",
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
      });

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired refresh token",
      success: false,
    });
  }
};