import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import styles from "./AdminRestaurants.module.css";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRestaurants = async () => {
    try {
      const { data } = await API.get("/restaurants");
      setRestaurants(data);
    } catch {
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", address: "", isActive: true });
    setImageFile(null);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (restaurant) => {
    setForm({
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address,
      isActive: restaurant.isActive,
    });
    setEditId(restaurant._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("address", form.address);
    formData.append("isActive", form.isActive);
    if (imageFile) formData.append("image", imageFile);

    try {
      if (editId) {
        await API.put(`/restaurants/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Restaurant updated!");
      } else {
        await API.post("/restaurants", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Restaurant created!");
      }
      resetForm();
      fetchRestaurants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?"))
      return;
    try {
      await API.delete(`/restaurants/${id}`);
      toast.success("Restaurant deleted!");
      fetchRestaurants();
    } catch {
      toast.error("Failed to delete restaurant");
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
      <div className={styles.header}>
        <h1>Restaurants</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className={styles.addBtn}
        >
          <FiPlus size={18} />
          Add Restaurant
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editId ? "Edit Restaurant" : "Add Restaurant"}</h2>
              <button onClick={resetForm}>
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Restaurant Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
              />

              <textarea
                placeholder="Description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
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

              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>

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

      {restaurants.length === 0 ? (
        <p className={styles.empty}>
          No restaurants yet. Add one!
        </p>
      ) : (
        <div className={styles.tableContainer}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className={styles.imageBox}>
                      {r.image ? (
                        <img
                          src={r.image}
                          alt={r.name}
                        />
                      ) : (
                        "🏪"
                      )}
                    </div>
                  </td>
                  <td>{r.name}</td>
                  <td>{r.address}</td>
                  <td>
                    <span
                      className={
                        r.isActive
                          ? styles.active
                          : styles.inactive
                      }
                    >
                      {r.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <Link
                      to={`/admin/restaurants/${r._id}/foods`}
                      className={styles.menuBtn}
                    >
                      Menu
                    </Link>
                    <button
                      onClick={() => handleEdit(r)}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(r._id)
                      }
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurants;