import express from 'express';
import dotenv from 'dotenv';   
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.route.js';
import contactRoutes from './routes/contact.route.js';
import userRoutes from './routes/user.route.js';
import orderRoutes from './routes/order.route.js';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: process.env.CLIENT_URL || process.env.LOCAL_URL,
    credentials: true, 
};
app.use(cors(corsOptions));

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const PORT = process.env.PORT || 3001;

// Importing routes
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});