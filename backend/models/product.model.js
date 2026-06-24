import mongoose from "mongoose";

// NEW: a single selectable choice within an option group, e.g. "Oat Milk" (+0.75)
const optionChoiceSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        priceDelta: {
            type: Number,
            default: 0
        },
    },
    { _id: false }
);

// NEW: a group of choices, e.g. "Add Milk" (required, pick 1)
const optionGroupSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        required: {
            type: Boolean,
            default: false
        },
        multiSelect: {
            type: Boolean,
            default: false
        },
        choices: {
            type: [optionChoiceSchema],
            default: []
        },
    },
    { _id: false }
);

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
    description: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        default: ""
    },
    variant: {
        type: String,
        default: "None"
    },
    boxPrice: {
        type: Number,
        default: null
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isMustTry: {
        type: Boolean,
        default: false
    },
    options: {
        type: [optionGroupSchema],
        default: []
    },
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;