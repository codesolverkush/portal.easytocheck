import { useState, useEffect } from "react";

export default function LocationCapture() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    address: null,
  });
  const [error, setError] = useState(null);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude; 

          // Update the location state with latitude and longitude
          setLocation({
            latitude: lat,
            longitude: lon,
            address: "Fetching address...",
          });
          setError(null);

          // Fetch the address using the Nominatim API
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
            );
            const data = await response.json();
            if (data.error) {
              setError("Unable to fetch address.");
            } else {
              const address = data.display_name;
            //   const state = address.state || "Unknown State";
            //   const country = address.country || "Unknown Country";
            const displayName = address || "Unknown Location";
              setLocation((prevLocation) => ({
                ...prevLocation,
                address: `${displayName}`,
              }));
            }
          } catch (err) {
            setError("Error fetching address.");
          }
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          backgroundColor: "white",
        }}
      >
        <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>Your Current Location</h2>
        {error ? (
          <p style={{ color: "red", marginTop: "10px" }}>{error}</p>
        ) : (
          <div style={{ marginTop: "10px" }}>
            <p>Latitude: {location.latitude || "Fetching..."}</p>
            <p>Longitude: {location.longitude || "Fetching..."}</p>
            <p>Address: {location.address || "Fetching address..."}</p>
          </div>
        )}
        <button
          onClick={fetchLocation}
          style={{
            marginTop: "20px",
            padding: "10px 15px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "none",
            backgroundColor: "blue",
            color: "white",
            cursor: "pointer",
          }}
        >
          Refresh Location
        </button>
      </div>
    </div>
  );
}
