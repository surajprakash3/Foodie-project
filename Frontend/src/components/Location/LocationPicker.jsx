import { useState } from "react";
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from "use-places-autocomplete";
import { FiMapPin } from "react-icons/fi";
import { useLocation } from "../../context/LocationContext";

const LocationPicker = () => {
    const { location, updateLocation } = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const {
        ready,
        value,
        suggestions: { status, data },
        setValue,
        clearSuggestions,
    } = usePlacesAutocomplete({
        requestOptions: {
            /* Define search scope here if needed */
        },
        debounce: 300,
    });

    const handleInput = (e) => {
        setValue(e.target.value);
        setIsOpen(true);
    };

    const handleSelect =
        ({ description }) =>
            () => {
                setValue(description, false);
                clearSuggestions();
                setIsOpen(false);

                // Get latitude and longitude via utility functions
                getGeocode({ address: description }).then((results) => {
                    const { lat, lng } = getLatLng(results[0]);
                    updateLocation({
                        address: description,
                        lat,
                        lng,
                    });
                });
            };

    return (
        <div style={{ position: "relative", zIndex: 50, display: "flex", alignItems: "center" }}>
            <button
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.1)",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    color: "inherit",
                    border: "none",
                    cursor: "pointer"
                }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <FiMapPin size={18} />
                <span style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {location?.address || "Wait..."}
                </span>
            </button>

            {isOpen && (
                <div style={{ position: "absolute", top: "120%", left: 0, background: "#fff", color: "#000", padding: "12px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "300px" }}>
                    <input
                        value={value}
                        onChange={handleInput}
                        disabled={!ready}
                        placeholder="Search address..."
                        style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px", marginBottom: "8px" }}
                        autoFocus
                    />

                    {status === "OK" && (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {data.map((suggestion) => {
                                const {
                                    place_id,
                                    structured_formatting: { main_text, secondary_text },
                                } = suggestion;

                                return (
                                    <li
                                        key={place_id}
                                        onClick={handleSelect(suggestion)}
                                        style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer", fontSize: "14px" }}
                                    >
                                        <strong>{main_text}</strong> <small style={{ color: "#666" }}>{secondary_text}</small>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
