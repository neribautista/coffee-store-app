import React, { useState, useEffect } from "react";
import "../styles/OrdersPage.css";

// Step sequence differs by fulfillment method:
// Pickup:   Preparing -> Ready for Pickup -> Completed
// Delivery: Preparing -> Ready for Delivery -> On its Way -> Delivered
//
// Each step maps to the backend `status` value at which it becomes "reached".
// A step is "active" (filled, current stage) if it's the highest reached
// step and the order isn't yet Completed; it's "done" if a later step has
// already been reached.
const getSteps = (fulfillmentMethod) => {
  if (fulfillmentMethod === "Delivery") {
    return [
      { label: "Preparing", statuses: ["Pending"] },
      { label: "Ready for Delivery", statuses: ["Processing"] },
      { label: "On its Way", statuses: ["Out for Delivery"] },
      { label: "Delivered", statuses: ["Completed"] },
    ];
  }
  return [
    { label: "Preparing", statuses: ["Pending"] },
    { label: "Ready for Pickup", statuses: ["Processing", "Out for Delivery"] },
    { label: "Completed", statuses: ["Completed"] },
  ];
};

const STATUS_ORDER = ["Pending", "Processing", "Out for Delivery", "Completed"];

const OrderProgressTracker = ({ order }) => {
  const steps = getSteps(order.fulfillmentMethod);
  const currentIndex = STATUS_ORDER.indexOf(order.status);

  // For each step, find the EARLIEST status that satisfies it, so a step
  // counts as "reached" as soon as the order hits any of its qualifying
  // statuses (important for Pickup's "Ready for Pickup" step, which maps to
  // two different backend statuses).
  const stepReachedIndex = steps.map((step) => {
    const indices = step.statuses.map((s) => STATUS_ORDER.indexOf(s));
    return Math.min(...indices);
  });

  return (
    <div className="order-tracker">
      {steps.map((step, i) => {
        const reached = currentIndex >= stepReachedIndex[i];
        const isCurrent =
          reached && (i === steps.length - 1 || currentIndex < stepReachedIndex[i + 1]);
        const isOnItsWayStep = step.label === "On its Way";

        return (
          <React.Fragment key={step.label}>
            <div className="tracker-step">
              <div
                className={`tracker-dot ${reached ? "reached" : ""} ${
                  isCurrent && order.status !== "Completed" ? "current" : ""
                }`}
              >
                {reached && "✓"}
              </div>
              <span className={`tracker-label ${reached ? "reached" : ""}`}>{step.label}</span>

              {/* Tracking link surfaces right at the "On its Way" step once
                  the admin has pasted one and the order has reached it. */}
              {isOnItsWayStep && reached && order.trackingUrl && (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tracker-track-link"
                >
                  Track Delivery
                </a>
              )}
            </div>
            {i < steps.length - 1 && (
              <div className={`tracker-connector ${reached ? "reached" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/orders/myorders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="orders-container">
      <h1 className="orders-title">Your Order History</h1>
      {orders.length === 0 ? (
        <p className="orders-empty">No orders yet.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order._id.slice(-6)}</span>
                <span className={`order-status status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="order-item-main">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₱{(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <ul className="order-item-options">
                        {item.selectedOptions.map((opt, i) => (
                          <li key={i}>
                            {opt.choiceName}
                            {opt.priceDelta > 0 && ` (+₱${opt.priceDelta.toFixed(2)})`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress tracker — shown for any order still in the active
                  flow (Pending / Processing / Out for Delivery). Cancelled
                  and Completed orders skip the tracker, matching the
                  reference design where only the in-progress order shows it. */}
              {!["Completed", "Cancelled"].includes(order.status) && (
                <OrderProgressTracker order={order} />
              )}

              <div className="order-footer">
                <span>Payment: {order.paymentMethod}</span>
                <span className="order-total">
                  Total: ₱{order.totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="order-fulfillment">
                <span className={`fulfillment-badge fulfillment-${order.fulfillmentMethod?.toLowerCase()}`}>
                  {order.fulfillmentMethod === "Delivery" ? "Delivery" : "Store Pickup"}
                </span>
                {order.fulfillmentMethod === "Delivery" && order.deliveryAddress && (
                  <p className="order-delivery-address">{order.deliveryAddress}</p>
                )}
              </div>

              <p className="order-date">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
