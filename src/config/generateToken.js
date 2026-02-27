import jwt from "jsonwebtoken"

export const generateToken = (user) => {
    return  jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET)
}

export const generateAccessToken = (user) => {
    return  jwt.sign({id:user._id,email:user.email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY='1h'})
}

export const generateRefreshToken = (user) => {
    return  jwt.sign({id:user._id,email:user.email},process.env.REFRESH_TOKEN_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
}