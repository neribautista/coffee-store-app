import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0.0
    },
    image: {
        type: String, 
        required: true
    },
}, {
    timestamps: true // This will add createdAt and updatedAt fields automatically
});



const Product = mongoose.model('Product', productSchema);


export default Product;