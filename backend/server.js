import express from 'express';
import dotenv from 'dotenv';   
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.route.js';
import contactRoutes from './routes/contact.route.js';
import userRoutes from './routes/user.route.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use(cors());



const PORT = process.env.PORT || 3001;

// Importing routes
app.use("/api/products", productRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/users", userRoutes)

app.listen(PORT, async () => {
    try {
        await connectDB();
        console.log(`Server running on port ${PORT}`);
    } catch (error) {
        console.error('Error connecting to the database:', error.message);
        process.exit(1); // Exit the process with failure
    }
});

