import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURL = process.env.MONGODB_URL;
    console.log(`Connecting to MongoDB at: ${mongoURL}`);

    await mongoose.connect(mongoURL, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;