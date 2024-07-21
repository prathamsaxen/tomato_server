import mongoose from "mongoose";

 export const connectDB = async()=>{
    await mongoose.connect('mongodb+srv://priyamwadapriya:33858786@cluster0.1dwjz5y.mongodb.net/food-del').then(()=>console.log("DB Connected"))
 }
    
 
