import { useEffect, useState } from "react";
import API from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { FiShoppingCart, FiStar, FiTrendingUp } from "react-icons/fi";
import styles from "./Home.module.css";

const CATEGORY_META = {
  Pizza: { emoji: "🍕" },
  Burgers: { emoji: "🍔" },
  "Fast Food": { emoji: "🍟" },
  Bakery: { emoji: "🧁" },
  Indian: { emoji: "🍛" },
  Drinks: { emoji: "🥤" },
};

const DEFAULT_META = { emoji: "🍽️" };

/* ⭐ Star Rating */
const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  return (
    <div className={styles.rating}>
      {[1, 2, 3, 4, 5].map((i) => (
        <FiStar
          key={i}
          size={13}
          className={i <= full ? styles.starFull : styles.starEmpty}
        />
      ))}
      <span className={styles.ratingText}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

/* 🍔 Food Card */
const FoodCard = ({ food, onAddToCart, addingId }) => {
  const meta = CATEGORY_META[food.category] || DEFAULT_META;

  return (
    <div className={styles.card}>
      <div className={styles.imageBox}>
        {food.image ? (
          <img src={food.image} alt={food.name} />
        ) : (
          <span className={styles.emoji}>
            {meta.emoji}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3>{food.name}</h3>

        {food.description && (
          <p className={styles.description}>
            {food.description}
          </p>
        )}

        <StarRating rating={food.rating || 4.0} />

        <div className={styles.bottom}>
          <span className={styles.price}>
            ₹{food.price}
          </span>

          <button
            onClick={() => onAddToCart(food._id)}
            disabled={addingId === food._id}
            className={styles.addBtn}
          >
            <FiShoppingCart size={14} />
            {addingId === food._id
              ? "Adding..."
              : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] =
    useState([]);
  const [activeCategory, setActiveCategory] =
    useState("All");
  const [loading, setLoading] =
    useState(true);
  const [addingId, setAddingId] =
    useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } =
          await API.get("/foods");
        setFoods(data);
        const cats = [
          ...new Set(
            data.map((f) => f.category)
          ),
        ].sort();
        setCategories(cats);
      } catch {
        toast.error("Could not load menu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleAddToCart = async (
    foodId
  ) => {
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

  const displayFoods =
    activeCategory === "All"
      ? foods
      : foods.filter(
          (f) =>
            f.category === activeCategory
        );

  const trendingFoods = [...foods]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        {/* HERO */}
        <div className={styles.hero}>
          <div className={styles.heroGlass}>
            <h1>
              Discover Premium
              <span> Dining</span>
            </h1>
            <p>
              Crafted meals, lightning-fast delivery,
              and a seamless digital experience.
            </p>
            <button
              className={styles.heroBtn}
              onClick={() =>
                document
                  .getElementById("menu")
                  .scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              Explore Menu
            </button>
          </div>
        </div>

        {/* WHY SECTION */}
        <div className={styles.whySection}>
          <h2 className={styles.sectionTitle}>
            Why Choose Us
          </h2>

          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <h3>🚀 Ultra Fast Delivery</h3>
              <p>
                Our smart routing ensures your
                food arrives hot and fresh.
              </p>
            </div>

            <div className={styles.whyCard}>
              <h3>🍽️ Premium Quality</h3>
              <p>
                Handpicked ingredients and
                curated dishes.
              </p>
            </div>

            <div className={styles.whyCard}>
              <h3>💳 Secure Payments</h3>
              <p>
                Safe transactions with multiple
                payment options.
              </p>
            </div>
          </div>
        </div>

        {/* TRENDING */}
        <div className={styles.trending}>
          <h2>
            <FiTrendingUp /> Trending Now
          </h2>

          <div className={styles.trendingScroll}>
            {trendingFoods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                onAddToCart={
                  handleAddToCart
                }
                addingId={addingId}
              />
            ))}
          </div>
        </div>

        {/* HIGHLIGHT BLOCK */}
        <div className={styles.highlightBlock}>
          <h2>
            Elevate Your Dining Experience
          </h2>
          <p>
            We blend technology with culinary
            excellence to deliver a seamless
            ordering experience.
          </p>
        </div>

        {/* CATEGORY */}
        <div className={styles.categories}>
          {["All", ...categories].map(
            (cat) => {
              const isActive =
                activeCategory === cat;
              const meta =
                CATEGORY_META[cat] ||
                DEFAULT_META;

              return (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(cat)
                  }
                  className={`${styles.categoryBtn} ${
                    isActive
                      ? styles.activeCategory
                      : ""
                  }`}
                >
                  {meta.emoji} {cat}
                </button>
              );
            }
          )}
        </div>

        {/* GRID */}
        <div
          className={styles.grid}
          id="menu"
        >
          {displayFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              onAddToCart={
                handleAddToCart
              }
              addingId={addingId}
            />
          ))}
        </div>

        {/* TESTIMONIALS */}
        <div className={styles.testimonials}>
          <h2 className={styles.sectionTitle}>
            What Our Customers Say
          </h2>

          <div className={styles.testimonialGrid}>
            <div className={styles.testimonialCard}>
              <p>
                "Absolutely amazing food and
                fast delivery!"
              </p>
              <span>
                — Rahul Sharma
              </span>
            </div>

            <div className={styles.testimonialCard}>
              <p>
                "The interface is smooth and
                modern."
              </p>
              <span>
                — Priya Mehta
              </span>
            </div>

            <div className={styles.testimonialCard}>
              <p>
                "Best online dining platform
                I’ve used."
              </p>
              <span>
                — Aman Verma
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h2>
            Stay Updated with New Dishes 🍕
          </h2>
          <p>
            Subscribe for exclusive offers
            and updates.
          </p>
          <div className={styles.ctaInputRow}>
            <input
              type="email"
              placeholder="Enter your email"
            />
            <button>
              Subscribe
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;