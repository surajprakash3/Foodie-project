import { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState(null); // { lat, lng, address }

    useEffect(() => {
        // Try to load from localStorage first
        const saved = localStorage.getItem("userLocation");
        if (saved) {
            setLocation(JSON.parse(saved));
        } else {
            // Default to a central point if nothing is saved
            setLocation({
                lat: 28.6139,
                lng: 77.2090, // New Delhi default
                address: "New Delhi, India"
            });
        }
    }, []);

    const updateLocation = (newLocation) => {
        setLocation(newLocation);
        localStorage.setItem("userLocation", JSON.stringify(newLocation));
    };

    return (
        <LocationContext.Provider value={{ location, updateLocation }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);
