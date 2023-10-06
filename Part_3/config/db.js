import mongoose from 'mongoose';
import colors from 'colors';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connection success: ${conn.connection.host}`.bgGreen.white);
  } catch (error) {
    console.error(`Error in MongoDB: ${error}`.bgRed.white);
    process.exit(1); 
  }
};

export default connectDB;
