import Product from '../models/product.model.js'; 
import mongoose from 'mongoose';

// Helper: parse the `options` field, which arrives as a JSON string inside
// multipart/form-data (since it travels alongside the image file upload).
const parseOptions = (rawOptions) => {
    if (!rawOptions) return undefined; // undefined = "don't touch this field"
    try {
        const parsed = JSON.parse(rawOptions);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (error) {
        return null; // null = "was sent but invalid JSON"
    }
};

// Product Controllers

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}); 
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Server error' }); 
    }
};

export const createProduct = async (req, res) => {
    const { name, price, description, category, variant, boxPrice, isBestSeller, isMustTry, options } = req.body;

    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    
    if (!name || !price || !req.file) {
        return res.status(400).json({ message: "Missing required fields: name, price, image" });
    }

    const parsedOptions = parseOptions(options);
    if (parsedOptions === null) {
        return res.status(400).json({ success: false, message: "Invalid options format" });
    }

    const newProduct = new Product({
        name,
        price,
        image: req.file.filename,
        description: description || "",
        category: category || "",
        variant: variant || "None",
        boxPrice: boxPrice ? parseFloat(boxPrice) : null,
        isBestSeller: isBestSeller === "true",
        isMustTry: isMustTry === "true",
        options: parsedOptions || [],
    });

    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error saving product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, category, variant, boxPrice, isBestSeller, isMustTry, options } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    const parsedOptions = parseOptions(options);
    if (parsedOptions === null) {
        return res.status(400).json({ success: false, message: "Invalid options format" });
    }

    const updatedFields = {
        name,
        price,
        description: description || "",
        category: category || "",
        variant: variant || "None",
        boxPrice: boxPrice ? parseFloat(boxPrice) : null,
        isBestSeller: isBestSeller === "true",
        isMustTry: isMustTry === "true",
    };

    // Only overwrite options if the form actually sent the field
    if (parsedOptions !== undefined) {
        updatedFields.options = parsedOptions;
    }

    // Only update image if a new file was uploaded
    if (req.file) {
        updatedFields.image = req.file.filename;
    }

    try {
        const product = await Product.findByIdAndUpdate(id, updatedFields, { new: true });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};