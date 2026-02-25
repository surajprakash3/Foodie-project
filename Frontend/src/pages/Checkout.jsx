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
      await API.post("/orders", {
        deliveryAddress,
        paymentMethod,
      });

      toast.success("Order placed successfully 🎉");
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

          <div className={styles.summaryTotalRow}>
            <span>Total</span>
            <span className={styles.summaryTotal}>
              ₹{cart.totalAmount}
            </span>
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
              Online Payment (Mock)
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