import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import L from "leaflet";

// 🟣 Fix marker icons for React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function App() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(coords);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }, []);

  // 📍 Predefined nearby taxi ranks
  const getNearbyRanks = (lat: number, lon: number) => [
    { name: "Main Street Taxi Rank", coords: [lat + 0.005, lon - 0.003] as [number, number] },
    { name: "Central Station Rank", coords: [lat - 0.004, lon + 0.004] as [number, number] },
    { name: "Market Square Rank", coords: [lat + 0.002, lon + 0.006] as [number, number] },
  ];

  // 🚗 Draw route when destination selected
  useEffect(() => {
    if (!mapRef.current || !position || !destination) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(position[0], position[1]),
        L.latLng(destination[0], destination[1]),
      ],
      lineOptions: { styles: [{ color: "#8B5CF6", weight: 5 }] },
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.removeControl(routingControl);
    };
  }, [destination, position]);

  return (
    <div className="relative h-screen w-screen bg-white">
      {position ? (
        <>
          {/* 🗺️ Map */}
          <MapContainer
            center={position}
            zoom={14}
            className="h-full w-full"
            whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Current location */}
            <Marker position={position as [number, number]}>
              <Popup>📍 You are here!</Popup>
            </Marker>

            {/* Nearby taxi ranks */}
            {getNearbyRanks(position[0], position[1]).map((rank, i) => (
              <Marker
                key={i}
                position={rank.coords}
                eventHandlers={{
                  click: () => setDestination(rank.coords),
                }}
              >
                <Popup>
                  🚕 {rank.name} <br />
                  <button
                    onClick={() => setDestination(rank.coords)}
                    className="mt-1 px-2 py-1 bg-purple-600 text-white rounded-md text-xs hover:bg-purple-700"
                  >
                    Get Directions
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating UI */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-2 rounded-full shadow-lg text-lg font-semibold">
            🚖 TaxiLinkSA
          </div>

          <button
            onClick={() => setDestination(null)}
            className="absolute bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-xl transition-all"
          >
            ✨ Reset Route
          </button>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-lg text-gray-600">
          Getting your location...
        </div>
      )}
    </div>
  );
}
