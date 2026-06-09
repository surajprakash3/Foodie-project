import { useEffect, useState } from "react";
import API from "../utils/api";
import { useLocation } from "../context/LocationContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiShoppingCart, FiStar, FiTrendingUp } from "react-icons/fi";
import styles from "./Home.module.css";
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

/* 🏪 Restaurant Card */
const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/restaurant/${restaurant._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.imageBox}>
        {restaurant.image ? (
          <img src={restaurant.image} alt={restaurant.name} />
        ) : (
          <span className={styles.emoji}>
            🏪
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3>{restaurant.name}</h3>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
          <StarRating rating={restaurant.rating || 4.2} />
          {restaurant.isPremium && (
            <span style={{ background: "#ffd700", color: "#000", fontSize: "12px", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>
              💎 Premium
            </span>
          )}
        </div>

        <p className={styles.description} style={{ marginTop: "12px", fontSize: "0.9rem", color: "#666" }}>
          {restaurant.address}
        </p>

        <div className={styles.bottom} style={{ marginTop: "16px", borderTop: "1px solid #eee", paddingTop: "12px" }}>
          <span style={{ fontSize: "0.9rem", color: "#444" }}>
            ⏱️ {restaurant.avgPreparationTime || 30} mins
          </span>
          <span className={styles.status} style={{ color: restaurant.status === 'Open' ? 'green' : 'red', fontWeight: 600 }}>
            {restaurant.status}
          </span>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { location } = useLocation();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearby = async () => {
      try {
        setLoading(true);
        let url = "/restaurants/nearby";
        if (location && location.lat && location.lng) {
          url += `?lat=${location.lat}&lng=${location.lng}&distance=15`;
        }

        const { data } = await API.get(url);
        // Only show Open or Busy restaurants by default, hide Closed usually (or just sort them to bottom)
        const sorted = data.sort((a, b) => {
          if (a.isPremium !== b.isPremium) return b.isPremium ? 1 : -1; // Premium first
          return 0;
        });

        setRestaurants(sorted);
      } catch (err) {
        toast.error("Could not load nearby restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [location]);

  const trendingRestaurants = [...restaurants]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

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
            <FiTrendingUp /> Top Rated Near You
          </h2>

          <div className={styles.trendingScroll}>
            {trendingRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
              />
            ))}
          </div>
        </div>

        {/* HIGHLIGHT BLOCK */}
        <div className={styles.highlightBlock}>
          <h2>
            Explore Restaurants
          </h2>
          <p>
            {location ? `Showing delivery options near ${location.address}` : "Enter your location above to see accurate delivery times."}
          </p>
        </div>

        {/* GRID */}
        <div
          className={styles.grid}
          id="menu"
        >
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
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