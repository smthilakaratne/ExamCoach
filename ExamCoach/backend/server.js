
//  Import modules
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
// Import routes
import syllabusRoutes from './routes/syllabusRoutes.js';
import mockExamRoutes from './routes/mockExamRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userRoutes from './routes/userRoutes.js';
import forumRoutes from './routes/forumRoutes.js';


app.use(cors());
app.use(express.json());


//  Configure environment variables
dotenv.config();

//  Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};
connectDB();

// Use routes
app.use('/api/syllabus', syllabusRoutes);
app.use('/api/mock-exam', mockExamRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/forum', forumRoutes);

//  Initialize Express app
const app = express();

//  Middleware
app.use(express.json()); 

//  Check connection
app.get("/", (req, res) => {
  res.send("Server is running!");
});

//Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
