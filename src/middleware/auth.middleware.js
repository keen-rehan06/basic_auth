import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const regisetrMiddleWare = async (req, res, next) => {
  try {
    const { name, username, password, email } = req.body;
    const user = await userModel.findOne({ email });
    if (user)
      return res
        .status(401)
        .send({ message: "User Already Exist!", success: false });
    if (!name || !username || !password || !email)
      return res
        .status(401)
        .send({ message: "All fields are required", success: false });
    next();
  } catch (error) {
    return res
      .status(500)
      .send({ success: false, message: "Server Error:", error });
  }
};

export const loginMiddleware = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user)
      return res
        .status(404)
        .send({ message: "User not found!!", success: false });
    if (!email || !password)
      return res
        .status(401)
        .send({ message: "All feilds are required!", success: false });
    next();
  } catch (error) {
    return res.status(500).send({ message: error.message, success: false });
  }
};

export const isLoggedIn = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    req.user = user;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Access Token has expired",
      });
    }
 console.log(error)
 console.log(error.message)
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};