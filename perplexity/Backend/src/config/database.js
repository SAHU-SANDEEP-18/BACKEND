import mongoose from "mongoose";

function connectToDB(){
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to DB")
    })
    .catch(err=>{
        console.log("Enter connecting to DB", err)
    })
}

export default connectToDB;