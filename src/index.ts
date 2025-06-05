// external dependencies
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

// internal dependencies
import prRoutes from "./routes/prRoutes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", prRoutes);

app.get('/health', (_, res) => {
  console.log('Health check endpoint hit');
  res.json({ status: 'ok' });
});

mongoose.connect(process.env.MONGO_URI || '', {})
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
