import express from "express"
import connectDb from "./src/database/db.js";
import userRoute from "./src/routes/user.route.js"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
dotenv.config("./.env")

const app = express();

(async()=>{
    try {
        await connectDb();
    } catch (error) {
        console.log("MongoDb Connection failed:",error)
    }
})();

app.use(express.json({}))
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());
app.use("/",userRoute)

app.get("/",function(req,res) {
    console.log("Home Page");
    res.status(200).send({message:"Home Page",success:true})
    console.log(req.user._id)
})


app.listen(3000, ()=> {
console.log(`App is running on port 3000`)
})
