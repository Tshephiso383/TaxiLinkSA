import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        () => {
          // If location fails, default to Pretoria
          setPosition([-25.7479, 28.2293]);
        }
      );
    }
  }, []);

  const taxiRanks = [
    { name: "Main Street Rank", coords: [-26.204, 28.047] as [number, number] },
    { name: "Bree Taxi Rank", coords: [-26.202, 28.035] as [number, number] },
    { name: "Gandhi Square", coords: [-26.205, 28.041] as [number, number] },
  ];

  return (
    <div className="relative h-screen w-full bg-white">
      {position ? (
        <MapContainer
          center={position}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>📍 You are here!</Popup>
          </Marker>

          {taxiRanks.map((rank, idx) => (
            <Marker key={idx} position={rank.coords}>
              <Popup>
                <div className="text-center">
                  <strong className="text-purple-700">🚕 {rank.name}</strong>
                  <br />
                  <span className="text-sm text-gray-600">Click marker to view location</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-600">
          <div className="text-center">
            <div className="text-2xl mb-2">📍</div>
            <div>Getting your location...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;