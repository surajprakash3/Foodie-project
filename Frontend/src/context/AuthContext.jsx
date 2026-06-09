import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await API.post("/auth/register", { name, email, password });
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const isSuperAdmin = user?.role === "SuperAdmin";
  const isRestaurantAdmin = user?.role === "RestaurantAdmin";
  const isDeliveryAdmin = user?.role === "DeliveryAdmin";
  const isDeliveryBoy = user?.role === "DeliveryBoy";
  const isAdmin = isSuperAdmin || isRestaurantAdmin || isDeliveryAdmin;

  return (
    <AuthContext.Provider value={{
      user, login, register, logout, loading,
      isAdmin, isSuperAdmin, isRestaurantAdmin, isDeliveryAdmin, isDeliveryBoy
    }}>
      {children}
    </AuthContext.Provider>
  );
};
