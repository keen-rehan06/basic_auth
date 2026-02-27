import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(`mongodb://127.0.0.1:27017/test`)
        console.log("MongoDb Connected Successfully!")
    } catch (error) {
        console.log("MongoDb Connection failed:",error)
    }
}

export default connectDb