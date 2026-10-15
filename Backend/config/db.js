import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/urlshortener';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.log('MongoDB connection warning:', err.message);
  }
};

export default connectDB;










// const connectDB = async () => {
//   try {
//     const mongoURI = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/urlshortener';
//     console.log(`Connecting to MongoDB at: ${mongoURI}`);
//     await mongoose.connect(mongoURI, {
//       serverSelectionTimeoutMS: 2000 // Fast timeout if Mongo service isn't active
//     });
//     console.log('MongoDB connected successfully');
//   } catch (err) {
//     console.error('MongoDB connection error:', err.message);
//   }
// };

// export default connectDB;
