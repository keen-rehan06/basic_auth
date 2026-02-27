import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isLoggedin:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String,
        default:null
    },
    otpExpiry:{
        type:String,
        default:null
    },
    token:{
      type:String,
      default:null
    },
    refreshtoken:{
        type:String,
        default:null
    }
})

const userModel = new mongoose.model("user",userSchema);

export default userModel;