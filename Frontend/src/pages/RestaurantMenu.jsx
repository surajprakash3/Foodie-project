import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiPlus, FiMapPin } from "react-icons/fi";
import styles from "./RestaurantMenu.module.css";

const RestaurantMenu = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resRes, foodRes] = await Promise.all([
          API.get(`/restaurants/${id}`),
          API.get(`/foods/${id}`),
        ]);

        setRestaurant(resRes.data);
        setFoods(foodRes.data.filter((f) => f.isAvailable));
      } catch {
        toast.error("Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = async (foodId) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    setAddingId(foodId);

    try {
      await addToCart(foodId, 1);
      toast.success("Added to cart 🛒");
    } catch {
      toast.error("Failed to add");
    } finally {
      setAddingId(null);
    }
  };

  const categories = foods.reduce((acc, food) => {
    if (!acc[food.category]) acc[food.category] = [];
    acc[food.category].push(food);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!restaurant) {
    return <div className={styles.empty}>Restaurant not found</div>;
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.headerImg}>
          {restaurant.image ? (
            <img src={restaurant.image} alt={restaurant.name} />
          ) : (
            <div className={styles.headerIcon}>🏪</div>
          )}
        </div>

        <div className={styles.headerContent}>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
          <div className={styles.address}>
            <FiMapPin size={14} />
            <span>{restaurant.address}</span>
          </div>
        </div>
      </div>

      {Object.keys(categories).length === 0 ? (
        <p className={styles.empty}>No menu items available.</p>
      ) : (
        Object.entries(categories).map(([category, items]) => (
          <div key={category} className={styles.category}>
            <h2>{category}</h2>

            <div className={styles.grid}>
              {items.map((food) => (
                <div key={food._id} className={styles.card}>
                  <div className={styles.cardImg}>
                    {food.image ? (
                      <img src={food.image} alt={food.name} />
                    ) : (
                      <div className={styles.cardIcon}>🍽️</div>
                    )}
                  </div>

                  <div className={styles.cardContent}>
                    <h3>{food.name}</h3>
                    <p className={styles.price}>₹{food.price}</p>

                    <button
                      onClick={() => handleAddToCart(food._id)}
                      disabled={addingId === food._id}
                      className={styles.button}
                    >
                      <FiPlus size={16} />
                      {addingId === food._id ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RestaurantMenu;