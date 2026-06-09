import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import styles from "./AdminFoods.module.css";

const AdminFoods = () => {
  const { id: restaurantId } = useParams();

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    isAvailable: true,
    isVeg: true,
    discount: 0,
    preparationTime: 15,
  });

  const fetchData = async () => {
    try {
      const [resData, foodData] = await Promise.all([
        API.get(`/restaurants/${restaurantId}`),
        API.get(`/foods/${restaurantId}`),
      ]);

      setRestaurant(resData.data);
      setFoods(foodData.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      isAvailable: true,
      isVeg: true,
      discount: 0,
      preparationTime: 15,
    });
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (food) => {
    setForm({
      name: food.name,
      price: food.price,
      category: food.category,
      isAvailable: food.isAvailable,
      isVeg: food.isVeg !== undefined ? food.isVeg : true,
      discount: food.discount || 0,
      preparationTime: food.preparationTime || 15,
    });
    setEditId(food._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("isAvailable", form.isAvailable);
    formData.append("isVeg", form.isVeg);
    formData.append("discount", form.discount);
    formData.append("preparationTime", form.preparationTime);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editId) {
        await API.put(`/foods/item/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Food updated!");
      } else {
        await API.post(`/foods/${restaurantId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Food created!");
      }

      resetForm();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (foodId) => {
    if (!window.confirm("Delete this food item?")) return;

    try {
      await API.delete(`/foods/item/${foodId}`);
      toast.success("Deleted successfully");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <Link to="/admin/restaurants" className={styles.backBtn}>
          <FiArrowLeft size={18} />
        </Link>

        <div>
          <h1 className={styles.title}>
            {restaurant?.name || "Restaurant"} Menu
          </h1>
          <p className={styles.subtitle}>{foods.length} items</p>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => {
          resetForm();
          setShowForm(true);
        }}
        className={styles.addBtn}
      >
        <FiPlus size={18} />
        Add Food
      </button>

      {/* Modal */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editId ? "Edit Food" : "Add Food"}</h2>
              <button onClick={resetForm}>
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Food Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <input
                type="number"
                placeholder="Price"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                required
              />

              <input
                type="text"
                placeholder="Category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files[0])
                }
              />

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.isAvailable}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isAvailable: e.target.checked,
                      })
                    }
                  />
                  Available
                </label>
                <label className={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.isVeg}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isVeg: e.target.checked,
                      })
                    }
                  />
                  Vegetarian
                </label>
              </div>

              <div className={styles.numberRow}>
                <label>
                  Discount (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) =>
                      setForm({ ...form, discount: e.target.value })
                    }
                  />
                </label>
                <label>
                  Prep Time (mins)
                  <input
                    type="number"
                    min="1"
                    value={form.preparationTime}
                    onChange={(e) =>
                      setForm({ ...form, preparationTime: e.target.value })
                    }
                  />
                </label>
              </div>

              <button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editId
                    ? "Update"
                    : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {foods.length === 0 ? (
        <p className={styles.empty}>No food items yet.</p>
      ) : (
        <div className={styles.grid}>
          {foods.map((food) => (
            <div key={food._id} className={styles.card}>
              <div className={styles.imageBox}>
                {food.image ? (
                  <img src={food.image} alt={food.name} />
                ) : (
                  "🍽️"
                )}
              </div>

              <div className={styles.cardContent}>
                <h3>{food.name}</h3>
                <p className={styles.price}>₹{food.price}</p>
                <span className={styles.category}>
                  {food.category}
                </span>

                <span
                  className={
                    food.isAvailable
                      ? styles.available
                      : styles.unavailable
                  }
                >
                  {food.isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>

                <div className={styles.actions}>
                  <button
                    onClick={() => handleEdit(food)}
                  >
                    <FiEdit2 size={14} />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(food._id)
                    }
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFoods;