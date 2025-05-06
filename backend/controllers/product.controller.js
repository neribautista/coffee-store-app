import Product from '../models/product.model.js'; 
import mongoose from 'mongoose';

//Product Controllers

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
    const { name, price } = req.body;
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);
    
    if (!name || !price || !req.file) {
      return res.status(400).json({ message: "Missing required fields: name, price, image" });
    }
  
    const product = {
      name,
      price,
      image: req.file.filename, // Save only the filename
    };
  
    const newProduct = new Product(product);
  
    try {
      await newProduct.save(); // Save the product to the database
      res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
      console.error("Error saving product:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price } = req.body;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }
  
    const updatedProduct = {
      name,
      price,
      image: req.file ? req.file.filename : undefined, // Update the image if a new file is uploaded
    };
  
    try {
      const product = await Product.findByIdAndUpdate(id, updatedProduct, { new: true });
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

export const deleteProduct = async (req, res) => {
    const { id } = req.params;

    // Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id" });
    }

    try {
        // Delete the product from the database
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