import express from 'express';
import dotenv from 'dotenv';   
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.route.js';
import contactRoutes from './routes/contact.route.js';
import userRoutes from './routes/user.route.js';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:5173", 
    credentials: true, 
};

app.use(cors(corsOptions));

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

// Importing routes
app.use("/api/products", productRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);

// Serve the uploads folder as static
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'))); 

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        process.exit(1); // Exit the process with failure
    }
});