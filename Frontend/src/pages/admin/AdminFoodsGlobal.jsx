import { useEffect, useState } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
  FiStar,
} from "react-icons/fi";
import styles from "./AdminFoodsGlobal.module.css";

const PREDEFINED_CATEGORIES = [
  "Pizza",
  "Burgers",
  "Fast Food",
  "Bakery",
  "Indian",
  "Drinks",
];

const CATEGORY_EMOJI = {
  Pizza: "🍕",
  Burgers: "🍔",
  "Fast Food": "🍟",
  Bakery: "🧁",
  Indian: "🍛",
  Drinks: "🥤",
};

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Pizza",
  rating: "4.0",
  isAvailable: true,
};

const Stars = ({ v }) => (
  <span className={styles.rating}>
    {[1, 2, 3, 4, 5].map((i) => (
      <FiStar
        key={i}
        size={13}
        style={{
          color: i <= Math.round(v) ? "#f59e0b" : "#d1d5db",
        }}
      />
    ))}
    <span className={styles.ratingValue}>
      {parseFloat(v).toFixed(1)}
    </span>
  </span>
);

const AdminFoodsGlobal = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFoods = async () => {
    try {
      const { data } = await API.get("/foods");
      setFoods(data);
    } catch {
      toast.error("Failed to load food items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (food) => {
    setForm({
      name: food.name,
      description: food.description || "",
      price: String(food.price),
      category: food.category,
      rating: String(food.rating ?? 4),
      isAvailable: food.isAvailable,
    });
    setEditId(food._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price required");
      return;
    }

    setSubmitting(true);
    const fd = new FormData();
    Object.keys(form).forEach((k) => fd.append(k, form[k]));
    if (imageFile) fd.append("image", imageFile);

    try {
      if (editId) {
        await API.put(`/foods/item/${editId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Updated successfully");
      } else {
        await API.post("/foods/create", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Created successfully");
      }

      closeForm();
      fetchFoods();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await API.delete(`/foods/item/${id}`);
      toast.success("Deleted");
      setFoods((prev) => prev.filter((f) => f._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  const visible = foods.filter((f) => {
    const matchCat =
      filterCat === "All" || f.category === filterCat;
    const matchSearch =
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className={styles.loaderWrapper}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Food Items</h1>
          <p>Manage all menu items</p>
        </div>

        <button onClick={openAdd} className={styles.addBtn}>
          <FiPlus size={18} /> Add Food
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="All">All Categories</option>
          {[...new Set(foods.map((f) => f.category))].map(
            (c) => (
              <option key={c} value={c}>
                {CATEGORY_EMOJI[c]} {c}
              </option>
            )
          )}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        {visible.length === 0 ? (
          <div className={styles.empty}>No food items found.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Food</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((food) => (
                <tr key={food._id}>
                  <td className={styles.foodCell}>
                    <div className={styles.foodImg}>
                      {food.image ? (
                        <img src={food.image} alt="" />
                      ) : (
                        CATEGORY_EMOJI[food.category]
                      )}
                    </div>
                    {food.name}
                  </td>
                  <td>{food.category}</td>
                  <td>₹{food.price}</td>
                  <td>
                    <Stars v={food.rating ?? 4} />
                  </td>
                  <td>
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
                  </td>
                  <td className={styles.actions}>
                    <button onClick={() => openEdit(food)}>
                      <FiEdit2 size={15} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(food._id, food.name)
                      }
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                {editId ? "Edit Food Item" : "Add Food Item"}
              </h2>
              <button onClick={closeForm}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
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

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              >
                {PREDEFINED_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_EMOJI[c]} {c}
                  </option>
                ))}
              </select>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(e.target.files[0])
                }
              />

              <button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoodsGlobal;