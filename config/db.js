import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(process.env.mongodb)
    .then(() => console.log("DB Connected"));
};
