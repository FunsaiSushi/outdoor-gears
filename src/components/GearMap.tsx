import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";

// Component to handle map center updates
const ChangeView = ({ center }: { center: LatLngTuple }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

// Create custom icon using react-icons
const createCustomIcon = (color: string = "#FF0000") => {
  const iconHtml = renderToStaticMarkup(
    <FaMapMarkerAlt size={24} color={color} />
  );

  return new Icon({
    iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(iconHtml)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Default center (London) in case geolocation fails
const DEFAULT_CENTER: LatLngTuple = [51.505, -0.09];

// Helper function to generate a random point within a radius (in kilometers)
const generateRandomPoint = (
  center: LatLngTuple,
  radiusKm: number
): LatLngTuple => {
  // Convert radius from km to degrees (approximate)
  const radiusInDegrees = radiusKm / 111.32;

  // Generate random angle
  const angle = Math.random() * 2 * Math.PI;

  // Generate random distance (using square root for uniform distribution)
  const distance = Math.sqrt(Math.random()) * radiusInDegrees;

  // Calculate new point
  const lat = center[0] + distance * Math.cos(angle);
  const lng =
    center[1] +
    (distance * Math.sin(angle)) / Math.cos((center[0] * Math.PI) / 180);

  return [lat, lng];
};

// Function to generate nearby gear clusters
const generateNearbyClusters = (
  userLocation: LatLngTuple,
  count: number = 8
): Array<{
  id: number;
  position: LatLngTuple;
  name: string;
  items: string[];
  color: string;
  description: string;
}> => {
  const gearTypes = [
    {
      name: "Camping Gear",
      items: [
        "4-Person Tent",
        "Sleeping Bags",
        "Camping Stoves",
        "Portable Chairs",
        "Coolers",
      ],
      color: "#FF6B6B",
      description:
        "Complete camping setup for 4 people, perfect for weekend getaways",
    },
    {
      name: "Hiking Equipment",
      items: [
        "Hiking Boots",
        "Backpacks",
        "Trekking Poles",
        "Water Bottles",
        "First Aid Kits",
      ],
      color: "#4ECDC4",
      description:
        "Professional hiking gear for day trips and longer expeditions",
    },
    {
      name: "Climbing Gear",
      items: [
        "Climbing Harnesses",
        "Ropes",
        "Carabiners",
        "Climbing Shoes",
        "Helmets",
      ],
      color: "#FFD93D",
      description:
        "Full climbing equipment set for beginners and intermediate climbers",
    },
    {
      name: "Water Sports",
      items: [
        "Kayaks",
        "Paddle Boards",
        "Life Jackets",
        "Waterproof Bags",
        "Dry Suits",
      ],
      color: "#6C5CE7",
      description: "Complete water sports equipment for aquatic adventures",
    },
    {
      name: "Cycling Gear",
      items: [
        "Mountain Bikes",
        "Cycling Helmets",
        "Bike Locks",
        "Repair Kits",
        "Bike Lights",
      ],
      color: "#00B894",
      description:
        "Quality mountain bikes and cycling accessories for all skill levels",
    },
    {
      name: "Winter Sports",
      items: [
        "Cross-Country Skis",
        "Snowshoes",
        "Winter Tents",
        "Sleeping Bags",
        "Thermal Gear",
      ],
      color: "#81ECEC",
      description:
        "Specialized winter sports equipment for cold weather adventures",
    },
    {
      name: "Adventure Gear",
      items: [
        "Hammocks",
        "Mosquito Nets",
        "Rain Gear",
        "Hiking Boots",
        "Trekking Poles",
      ],
      color: "#FF9F43",
      description: "Essential gear for outdoor adventures in any weather",
    },
    {
      name: "Photography Equipment",
      items: [
        "Camera Gear",
        "Tripods",
        "Waterproof Cases",
        "Lens Filters",
        "Memory Cards",
      ],
      color: "#95E1D3",
      description: "Professional photography equipment for outdoor shooting",
    },
  ];

  return Array.from({ length: count }, (_, index) => {
    const gearType = gearTypes[index % gearTypes.length];
    const position = generateRandomPoint(userLocation, 50); // 50km radius

    return {
      id: index + 1,
      position,
      name: `Nearby ${gearType.name}`,
      items: gearType.items,
      color: gearType.color,
      description: gearType.description,
    };
  });
};

const GearMap = () => {
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate nearby clusters when user location changes
  const nearbyClusters = useMemo(() => {
    if (!userLocation) return [];
    return generateNearbyClusters(userLocation);
  }, [userLocation]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Unable to retrieve your location");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  if (isLoading) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">
          Loading map and getting your location...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-center">
          <p className="mb-2">{error}</p>
          <p>Using default location instead.</p>
        </div>
      </div>
    );
  }

  const center = userLocation || DEFAULT_CENTER;

  return (
    <div className="h-[500px] w-full">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={createCustomIcon("#2196F3")}>
            <Popup>
              <div className="text-sm font-medium text-gray-700">
                You are here
              </div>
            </Popup>
          </Marker>
        )}
        {/* Nearby gear cluster markers */}
        {nearbyClusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.position}
            icon={createCustomIcon(cluster.color)}
          >
            <Popup>
              <div className="min-w-[200px] p-1">
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: cluster.color }}
                >
                  {cluster.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {cluster.description}
                </p>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Available Items:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {cluster.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GearMap;
