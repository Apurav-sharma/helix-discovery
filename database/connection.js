import mongoose from "mongoose";
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            "mongodb+srv://apurav0711:kXLSO7w71BaWda0d@cluster0.loz7f.mongodb.net/?retryWrites=true&w=majority&appName=cluster0",
        );

        // console.log(MongoDB Connected: {conn.connection.host});
    } catch (error) {
        // console.log("Couldn't connect to MongoDB")
        console.error(error.message);
        process.exit(1);
    }
};
export default connectDB;
