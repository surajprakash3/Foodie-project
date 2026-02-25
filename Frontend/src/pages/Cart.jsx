import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from "react-icons/fi";
import styles from "./Cart.module.css";

const Cart = () => {
  const { cart, addToCart, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = async (foodId, currentQty, delta) => {
    const newQty = currentQty + delta;
    try {
      if (newQty <= 0) {
        await removeFromCart(foodId);
        toast.success("Item removed");
      } else {
        await addToCart(foodId, newQty);
      }
    } catch {
      toast.error("Failed to update cart");
    }
  };

  const handleRemove = async (foodId) => {
    try {
      await removeFromCart(foodId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <FiShoppingBag size={64} className={styles.emptyIcon} />
        <h2>Your cart is empty</h2>
        <p>Add some delicious items from our restaurants!</p>
        <button
          onClick={() => navigate("/")}
          className={styles.emptyBtn}
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Your Cart</h1>

      <div className={styles.list}>
        {cart.items.map((item) => {
          const food = item.foodId;
          if (!food) return null;

          return (
            <div key={food._id} className={styles.item}>
              <div className={styles.image}>
                {food.image ? (
                  <img src={food.image} alt={food.name} />
                ) : (
                  <div className={styles.image}>🍽️</div>
                )}
              </div>

              <div className={styles.content}>
                <h3>{food.name}</h3>
                <p className={styles.price}>₹{food.price}</p>
              </div>

              <div className={styles.qty}>
                <button
                  onClick={() =>
                    handleQuantityChange(food._id, item.quantity, -1)
                  }
                >
                  <FiMinus size={14} />
                </button>

                <span>{item.quantity}</span>

                <button
                  onClick={() =>
                    handleQuantityChange(food._id, item.quantity, 1)
                  }
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <div className={styles.total}>
                ₹{food.price * item.quantity}
              </div>

              <button
                onClick={() => handleRemove(food._id)}
                className={styles.remove}
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Total</span>
          <span className={styles.summaryTotal}>
            ₹{cart.totalAmount}
          </span>
        </div>

        <button
          onClick={() => navigate("/checkout")}
          className={styles.checkoutBtn}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;