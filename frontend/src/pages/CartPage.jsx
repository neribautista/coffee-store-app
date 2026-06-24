import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CartPage.css";
import { getCart, setCart } from "../utils/cartStorage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("GCash");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("Pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isLoaded, setIsLoaded] = useState(false); // Track if cart is loaded
  const navigate = useNavigate();

  // Load cart from localStorage on mount
  useEffect(() => {
    setCartItems(getCart());
    setIsLoaded(true); // Mark as loaded
  }, []);

  // Save cart to localStorage only after initial load. Using setCart (not
  // a raw localStorage.setItem) ensures Navbar's cart badge updates the
  // moment quantity/remove changes happen here too.
  useEffect(() => {
    if (isLoaded) {
      setCart(cartItems);
    }
  }, [cartItems, isLoaded]);

  // Cart lines are keyed by id + optionsKey (set in MenuPage when adding to
  // cart), since the same product with different options (e.g. Oat Milk vs
  // Almond Milk Latte) needs to be tracked as separate lines.
  const handleQuantityChange = (id, optionsKey, quantity) => {
    if (quantity < 1) return;
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.optionsKey === optionsKey ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id, optionsKey) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.id === id && item.optionsKey === optionsKey))
    );
  };

  // Per-line total = unit price (already includes selected option add-ons) * quantity
  const calculateLineTotal = (item) => item.price * item.quantity;

  // Mockup breaks Subtotal into base price only, with option add-ons shown
  // as their own line — so we need basePrice separately from the resolved price.
  const baseSubtotal = cartItems.reduce(
    (total, item) => total + (item.basePrice ?? item.price) * item.quantity,
    0
  );
  const optionsAddonTotal = cartItems.reduce((total, item) => {
    const addonPerUnit = (item.selectedOptions || []).reduce(
      (sum, opt) => sum + (Number(opt.priceDelta) || 0),
      0
    );
    return total + addonPerUnit * item.quantity;
  }, 0);
  const subtotal = baseSubtotal + optionsAddonTotal; // equals sum of full line totals
  const deliveryFee = fulfillmentMethod === "Delivery" ? 0 : 0; // adjust here if a real delivery fee is added later
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (fulfillmentMethod === "Delivery" && !deliveryAddress.trim()) {
      alert("Please enter a delivery address.");
      return;
    }

    const orderData = {
      items: cartItems.map((item) => ({
        product: item.id,
        name: item.name,
        price: item.price, // per-unit price, already includes selected option add-ons
        image: item.image,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || [],
      })),
      totalPrice: total,
      paymentMethod,
      fulfillmentMethod,
      deliveryAddress: fulfillmentMethod === "Delivery" ? deliveryAddress.trim() : "",
    };

    try {
      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert("Order placed successfully!");
        setCart([]); // clears localStorage AND notifies Navbar's badge
        setCartItems([]);
        navigate("/orders");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="cart-page">
      <h1 className="cart-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p className="cart-empty">Your cart is empty. Add some items!</p>
      ) : (
        <div className="cart-layout">
          {/* Unified card: header + item rows + cart total */}
          <div className="cart-card">
            <h2 className="cart-card-title">Your Cart</h2>
            <div className="cart-card-divider" />

            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.optionsKey}`} className="cart-item-row">
                  <img
                    src={`http://localhost:3001/uploads/${item.image}`}
                    alt={item.name}
                    className="cart-item-image"
                  />

                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="cart-item-options">
                        {item.selectedOptions.map((opt, i) => (
                          <span key={i} className="cart-item-option-line">
                            {opt.choiceName}
                            {opt.priceDelta > 0 && (
                              <span className="cart-item-option-price">
                                {" "}
                                +₱{opt.priceDelta.toFixed(2)}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="cart-item-price">₱{calculateLineTotal(item).toFixed(2)}</div>

                  <div className="cart-item-controls">
                    <div className="quantity-stepper">
                      <button
                        className="stepper-btn"
                        onClick={() =>
                          handleQuantityChange(item.id, item.optionsKey, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span className="stepper-value">{item.quantity}</span>
                      <button
                        className="stepper-btn"
                        onClick={() =>
                          handleQuantityChange(item.id, item.optionsKey, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>

                    <button
                      className="cart-item-remove-btn"
                      onClick={() => handleRemoveItem(item.id, item.optionsKey)}
                      aria-label="Remove item"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-card-divider" />
            <div className="cart-card-total-row">
              <span>Total:</span>
              <span className="cart-card-total-value">₱{subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Side-by-side: payment/fulfillment card + price breakdown card */}
          <div className="cart-bottom-row">
            <div className="cart-card cart-options-card">
              <h3 className="cart-card-subtitle">Payment Method</h3>
              <div className="radio-list">
                {["GCash", "GoTyme"].map((method) => (
                  <label key={method} className="radio-row">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    <span className="radio-custom" />
                    <span>{method}</span>
                  </label>
                ))}
              </div>

              <h3 className="cart-card-subtitle cart-card-subtitle-spaced">Delivery or Pickup</h3>
              <div className="radio-list">
                {["Pickup", "Delivery"].map((method) => (
                  <label key={method} className="radio-row">
                    <input
                      type="radio"
                      name="fulfillmentMethod"
                      value={method}
                      checked={fulfillmentMethod === method}
                      onChange={() => setFulfillmentMethod(method)}
                    />
                    <span className="radio-custom" />
                    <span>{method}</span>
                  </label>
                ))}
              </div>

              {fulfillmentMethod === "Delivery" && (
                <textarea
                  className="delivery-address-input"
                  placeholder="Enter your delivery address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="cart-card cart-summary-card">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₱{baseSubtotal.toFixed(2)}</span>
              </div>
              {optionsAddonTotal > 0 && (
                <div className="summary-row">
                  <span>Add-ons</span>
                  <span>₱{optionsAddonTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>{fulfillmentMethod === "Delivery" ? "Delivery Fee" : "Pickup"}</span>
                <span>{fulfillmentMethod === "Delivery" ? `₱${deliveryFee.toFixed(2)}` : "—"}</span>
              </div>
              <div className="cart-card-divider" />
              <div className="summary-row summary-row-total">
                <span>Total</span>
                <span>₱{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button className="place-order-btn" onClick={handleCheckout}>
            Place Order
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
