import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import toast from "react-hot-toast";
import styles from "./Checkout.module.css";

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim()) {
      return toast.error("Please enter delivery address");
    }

    if (!cart.items || cart.items.length === 0) {
      return toast.error("Cart is empty");
    }

    setLoading(true);

    try {
      // 1. Place the initial order in the database (Pending status)
      const { data: order } = await API.post("/orders", {
        deliveryAddress,
        paymentMethod,
      });

      if (paymentMethod === "Online") {
        // 2. Initialize Payment Gateway Checkout
        setLoading(true);
        toast.loading("Initializing Payment Gateway...", { id: "payment" });

        try {
          const { data: paymentIntent } = await API.post("/payments/checkout", {
            orderId: order._id,
            method: "Razorpay" // Defaulting to Razorpay for this demo, can make dynamic later
          });

          // In a real app, you would load the Razorpay SDK (window.Razorpay) script dynamically here
          // and open the portal. For demo purposes, we will mock a successful verification immediately.
          toast.success("Payment Gateway Initialized!", { id: "payment" });

          // Mocking a successful payment verification back to our server
          await API.post("/payments/verify", {
            orderId: order._id,
            gatewayPaymentId: "mock_pay_" + Date.now(),
            gateway: paymentIntent.gateway
          });

          toast.success("Payment successful! Order placed 🎉", { id: "payment" });
        } catch (paymentErr) {
          toast.error(paymentErr.response?.data?.message || "Payment initialization failed", { id: "payment" });
          return; // Stop flow, order remains Pending/unpaid
        }
      } else {
        toast.success("Order placed successfully via COD 🎉");
      }

      await fetchCart();
      navigate("/orders");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Cart is empty</h2>
        <p>Add items before checking out.</p>
        <button onClick={() => navigate("/")}>
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Checkout</h1>

      <div className={styles.grid}>
        <div className={styles.summary}>
          <h2>Order Summary</h2>

          <div className={styles.summaryList}>
            {cart.items.map((item) => {
              const food = item.foodId;
              if (!food) return null;

              return (
                <div key={food._id} className={styles.summaryItem}>
                  <span>
                    {food.name} × {item.quantity}
                  </span>
                  <span>
                    ₹{food.price * item.quantity}
                  </span>
                </div>
              );
            })}
          </div>

          <div className={styles.summaryTotalRow} style={{ borderTop: "1px solid #ddd", paddingTop: "12px", marginTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#666" }}>
              <span>Subtotal</span>
              <span>₹{cart.itemTotal || 0}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#666" }}>
              <span>Tax (5%)</span>
              <span>₹{cart.taxAmount || 0}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.9rem", color: "#666" }}>
              <span>Delivery Fee</span>
              <span>₹{cart.deliveryFee || 0}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "1.2rem", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ddd" }}>
              <span>Total</span>
              <span className={styles.summaryTotal}>
                ₹{cart.totalAmount || 0}
              </span>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className={styles.form}
        >
          <h2>Delivery Details</h2>

          <label>Delivery Address</label>
          <textarea
            value={deliveryAddress}
            onChange={(e) =>
              setDeliveryAddress(e.target.value)
            }
            rows={3}
            required
            placeholder="Enter full delivery address"
          />

          <label>Payment Method</label>

          <div className={styles.radioGroup}>
            <label>
              <input
                type="radio"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />
              Cash on Delivery
            </label>

            <label>
              <input
                type="radio"
                value="Online"
                checked={paymentMethod === "Online"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />
              Online Payment (Credit/Debit, UPI)
            </label>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;