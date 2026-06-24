import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../styles/AdminOrdersPage.css";

const STATUS_OPTIONS = ["Pending", "Processing", "Out for Delivery", "Completed", "Cancelled"];
const TERMINAL_STATUSES = ["Completed", "Cancelled"];

// Custom dropdown replacing the native <select>, anchored under its own
// trigger so it can't render as a stray OS-styled popup. Disabled entirely
// once an order is Completed or Cancelled — terminal states shouldn't be
// editable further.
//
// The options menu is rendered via a portal directly into document.body,
// positioned with `position: fixed` using the trigger's live bounding box.
// This is necessary because the dropdown lives inside a <table> that needs
// overflow handling for its rounded corners (and, on mobile, horizontal
// scrolling) — any ancestor with `overflow: hidden` or `overflow-x: auto`
// would otherwise visually clip the menu, regardless of z-index.
const StatusDropdown = ({ value, onChange, disabled }) => {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!open) updateMenuPosition();
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;

    // The menu is rendered via a portal into document.body, so it is NOT a
    // DOM descendant of containerRef — it must be checked separately, or
    // every click inside the menu registers as "outside" and closes the
    // dropdown before the option's own onClick can fire.
    const handleClickOutside = (e) => {
      if (containerRef.current && containerRef.current.contains(e.target)) return;
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };
    // Recompute position on scroll/resize so the menu tracks its trigger
    // even inside the table's horizontally-scrolling mobile container.
    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  return (
    <div className="status-dropdown" ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`status-dropdown-trigger ${disabled ? "disabled" : ""}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span>{value}</span>
        {!disabled && <span className={`status-dropdown-caret ${open ? "open" : ""}`}>▾</span>}
      </button>

      {open &&
        !disabled &&
        createPortal(
          <ul
            ref={menuRef}
            className="status-dropdown-menu status-dropdown-menu-portal"
            style={{
              position: "fixed",
              top: menuPosition.top,
              left: menuPosition.left,
              minWidth: menuPosition.width,
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <li
                key={option}
                className={`status-dropdown-item ${option === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option === value && <span className="status-dropdown-check">✓</span>}
                <span>{option}</span>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </div>
  );
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  // Local draft tracking-link text per order id, used both for the
  // post-confirmation "edit existing link" row and the pre-confirmation
  // gate below.
  const [trackingDrafts, setTrackingDrafts] = useState({});
  // Tracks orders where the admin has picked "Out for Delivery" in the
  // dropdown but hasn't yet confirmed a tracking link. The status itself
  // is NOT changed on the server until confirmation succeeds — selecting
  // the option only opens this inline gate.
  const [pendingDeliveryConfirm, setPendingDeliveryConfirm] = useState({});
  const [linkErrors, setLinkErrors] = useState({});

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedOrders = data.data || [];
        setOrders(fetchedOrders);

        setTrackingDrafts((prev) => {
          const next = { ...prev };
          fetchedOrders.forEach((order) => {
            if (next[order._id] === undefined) {
              next[order._id] = order.trackingUrl || "";
            }
          });
          return next;
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrder = async (orderId, payload) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        fetchOrders();
      } else {
        alert("Failed to update order.");
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    if (newStatus === "Out for Delivery") {
      // Don't update the server yet — open the inline link gate first.
      setPendingDeliveryConfirm((prev) => ({ ...prev, [orderId]: true }));
      setLinkErrors((prev) => ({ ...prev, [orderId]: "" }));
      return;
    }
    // Selecting any other status directly (e.g. changing their mind and
    // picking Cancelled while the link gate was open) should clear any
    // stale pending-confirm gate so it doesn't linger after the order
    // moves to a different status.
    setPendingDeliveryConfirm((prev) => ({ ...prev, [orderId]: false }));
    setLinkErrors((prev) => ({ ...prev, [orderId]: "" }));
    updateOrder(orderId, { status: newStatus });
  };

  const handleTrackingDraftChange = (orderId, value) => {
    setTrackingDrafts((prev) => ({ ...prev, [orderId]: value }));
    setLinkErrors((prev) => ({ ...prev, [orderId]: "" }));
  };

  const handleConfirmDeliveryLink = (orderId) => {
    const url = (trackingDrafts[orderId] || "").trim();
    if (!url) {
      setLinkErrors((prev) => ({
        ...prev,
        [orderId]: "Paste a tracking link before confirming.",
      }));
      return;
    }
    // Status and trackingUrl are set together, atomically, only now.
    updateOrder(orderId, { status: "Out for Delivery", trackingUrl: url });
    setPendingDeliveryConfirm((prev) => ({ ...prev, [orderId]: false }));
  };

  const handleCancelDeliveryConfirm = (orderId) => {
    setPendingDeliveryConfirm((prev) => ({ ...prev, [orderId]: false }));
    setLinkErrors((prev) => ({ ...prev, [orderId]: "" }));
  };

  const handleSaveTrackingUrl = (orderId) => {
    const url = (trackingDrafts[orderId] || "").trim();
    updateOrder(orderId, { trackingUrl: url });
  };

  return (
    <div className="admin-orders-container">
      <h1 className="admin-orders-title">All Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Fulfillment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isTerminal = TERMINAL_STATUSES.includes(order.status);
              const isOutForDelivery = order.status === "Out for Delivery";

              return (
                <tr key={order._id}>
                  <td>#{order._id.slice(-6)}</td>
                  <td>
                    {order.user?.first_name} {order.user?.last_name}
                  </td>
                  <td>
                    {order.items.map((item) => `${item.name} x${item.quantity}`).join(", ")}
                  </td>
                  <td>₱{order.totalPrice.toFixed(2)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>
                    <span className={`fulfillment-tag fulfillment-${order.fulfillmentMethod?.toLowerCase()}`}>
                      {order.fulfillmentMethod}
                    </span>
                    {order.fulfillmentMethod === "Delivery" && order.deliveryAddress && (
                      <p className="admin-delivery-address">{order.deliveryAddress}</p>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase().replace(/\s+/g, "-")}`}>
                      {order.status}
                    </span>
                    <div className="status-action">
                      <StatusDropdown
                        value={order.status}
                        onChange={(newStatus) => handleStatusChange(order._id, newStatus)}
                        disabled={isTerminal}
                      />
                    </div>

                    {/* Gate: shown right after picking "Out for Delivery" in
                        the dropdown, BEFORE the status actually changes.
                        Confirming requires a non-empty link; cancelling
                        reverts to the dropdown with no change made. */}
                    {pendingDeliveryConfirm[order._id] && (
                      <div className="tracking-input-row tracking-confirm-row">
                        <input
                          type="text"
                          className="tracking-input"
                          placeholder="Paste Grab/Lalamove link"
                          value={trackingDrafts[order._id] ?? ""}
                          onChange={(e) => handleTrackingDraftChange(order._id, e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="tracking-save-btn"
                          onClick={() => handleConfirmDeliveryLink(order._id)}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="tracking-cancel-btn"
                          onClick={() => handleCancelDeliveryConfirm(order._id)}
                        >
                          Cancel
                        </button>
                        {linkErrors[order._id] && (
                          <p className="tracking-error">{linkErrors[order._id]}</p>
                        )}
                      </div>
                    )}

                    {/* Once already "Out for Delivery", show the normal
                        editable link row (update or open the saved link). */}
                    {!pendingDeliveryConfirm[order._id] && isOutForDelivery && (
                      <div className="tracking-input-row">
                        <input
                          type="text"
                          className="tracking-input"
                          placeholder="Paste Grab/Lalamove link"
                          value={trackingDrafts[order._id] ?? ""}
                          onChange={(e) => handleTrackingDraftChange(order._id, e.target.value)}
                        />
                        <button
                          type="button"
                          className="tracking-save-btn"
                          onClick={() => handleSaveTrackingUrl(order._id)}
                        >
                          Save
                        </button>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="tracking-view-link"
                          >
                            Open
                          </a>
                        )}
                      </div>
                    )}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminOrdersPage;
