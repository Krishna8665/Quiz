import mongoose from "mongoose";
import  envConfig  from "./config";

const connectToDatabase = async () => {
    try {

         mongoose.connection.on("connected", () => {
            console.log("connected to db successfully")
        })
        await mongoose.connect(envConfig.mongodbString as string)
    } catch (error) {
        console.log("failed  to connect db",error)
        process.exit(1)
    }
}

export default connectToDatabase