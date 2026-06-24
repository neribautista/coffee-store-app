import mongoose from "mongoose";

// One selected choice carried over from the product customization popup,
// e.g. { groupName: "Add Milk", choiceName: "Oat Milk", priceDelta: 0.75 }
const selectedOptionSchema = mongoose.Schema(
  {
    groupName: { type: String },
    choiceName: { type: String },
    priceDelta: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        image: { type: String },
        quantity: { type: Number, required: true, default: 1 },
        selectedOptions: { type: [selectedOptionSchema], default: [] },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    status: {
      type: String,
      required: true,
      // NEW: "Out for Delivery" — admin sets this manually once they paste
      // a Grab/Lalamove tracking link, marking the rider as en route.
      enum: ["Pending", "Processing", "Out for Delivery", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["GCash", "GoTyme"],
      default: "GCash",
    },
    fulfillmentMethod: {
      type: String,
      required: true,
      enum: ["Delivery", "Pickup"],
      default: "Pickup",
    },
    deliveryAddress: {
      type: String,
      required: function () {
        return this.fulfillmentMethod === "Delivery";
      },
      default: "",
    },
    // NEW: Grab/Lalamove (or any rider service) tracking link, pasted by
    // admin once a delivery rider has been booked. Only meaningful when
    // fulfillmentMethod is "Delivery".
    trackingUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;