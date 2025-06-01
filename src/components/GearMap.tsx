import React, { useState, useEffect, useRef, useMemo } from "react";

interface Position {
  lat: number;
  lng: number;
}

interface GearCluster {
  id: number;
  position: Position;
  name: string;
  items: string[];
  color: string;
  description: string;
}

interface MapPin {
  id: string;
  position: Position;
  color: string;
  label: string;
  cluster?: GearCluster;
}

// Utility functions for map calculations
const deg2rad = (deg: number): number => deg * (Math.PI / 180);

const getDistanceFromLatLng = (pos1: Position, pos2: Position): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(pos2.lat - pos1.lat);
  const dLng = deg2rad(pos2.lng - pos1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pos1.lat)) *
      Math.cos(deg2rad(pos2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

// Convert lat/lng to pixel coordinates
const latLngToPixel = (
  lat: number,
  lng: number,
  zoom: number,
  tileSize: number = 256
): { x: number; y: number } => {
  const scale = Math.pow(2, zoom);
  const worldCoordX = ((lng + 180) / 360) * scale;
  const worldCoordY =
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
    scale;

  return {
    x: worldCoordX * tileSize,
    y: worldCoordY * tileSize,
  };
};

// Convert pixel coordinates to lat/lng
const pixelToLatLng = (
  x: number,
  y: number,
  zoom: number,
  tileSize: number = 256
): Position => {
  const scale = Math.pow(2, zoom);
  const worldCoordX = x / (scale * tileSize);
  const worldCoordY = y / (scale * tileSize);

  const lng = worldCoordX * 360 - 180;
  const latRadians = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldCoordY)));
  const lat = (latRadians * 180) / Math.PI;

  return { lat, lng };
};

// Generate random point within radius
const generateRandomPoint = (center: Position, radiusKm: number): Position => {
  const radiusInDegrees = radiusKm / 111.32;
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.sqrt(Math.random()) * radiusInDegrees;

  const lat = center.lat + distance * Math.cos(angle);
  const lng =
    center.lng +
    (distance * Math.sin(angle)) / Math.cos((center.lat * Math.PI) / 180);

  return { lat, lng };
};

// Generate gear clusters
const generateNearbyClusters = (
  userLocation: Position,
  count: number = 8
): GearCluster[] => {
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
    const position = generateRandomPoint(userLocation, 50);

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

const GearMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<Position | null>(null);
  const [mapCenter, setMapCenter] = useState<Position>({
    lat: 51.505,
    lng: -0.09,
  });
  const [zoom, setZoom] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [mapDimensions, setMapDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 500 });

  // Generate gear clusters
  const gearClusters = useMemo(() => {
    if (!userLocation) return [];
    return generateNearbyClusters(userLocation);
  }, [userLocation]);

  // Create map pins
  const mapPins = useMemo(() => {
    const pins: MapPin[] = [];

    // Add user location pin
    if (userLocation) {
      pins.push({
        id: "user",
        position: userLocation,
        color: "#2196F3",
        label: "You are here",
      });
    }

    // Add gear cluster pins
    gearClusters.forEach((cluster) => {
      pins.push({
        id: `cluster-${cluster.id}`,
        position: cluster.position,
        color: cluster.color,
        label: cluster.name,
        cluster,
      });
    });

    return pins;
  }, [userLocation, gearClusters]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userPos = { lat: latitude, lng: longitude };
        setUserLocation(userPos);
        setMapCenter(userPos);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setError("Unable to retrieve your location");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  // Update map dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (mapRef.current) {
        const rect = mapRef.current.getBoundingClientRect();
        setMapDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Calculate tile coordinates
  const getTileCoords = (lat: number, lng: number, zoom: number) => {
    const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
    const y = Math.floor(
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
        Math.pow(2, zoom)
    );
    return { x, y };
  };

  // Get visible tiles
  const getVisibleTiles = () => {
    const tileSize = 256;
    const centerPixel = latLngToPixel(
      mapCenter.lat,
      mapCenter.lng,
      zoom,
      tileSize
    );
    const halfWidth = mapDimensions.width / 2;
    const halfHeight = mapDimensions.height / 2;

    const topLeft = pixelToLatLng(
      centerPixel.x - halfWidth,
      centerPixel.y - halfHeight,
      zoom,
      tileSize
    );
    const bottomRight = pixelToLatLng(
      centerPixel.x + halfWidth,
      centerPixel.y + halfHeight,
      zoom,
      tileSize
    );

    const topLeftTile = getTileCoords(topLeft.lat, topLeft.lng, zoom);
    const bottomRightTile = getTileCoords(
      bottomRight.lat,
      bottomRight.lng,
      zoom
    );

    const tiles = [];
    for (let x = topLeftTile.x - 1; x <= bottomRightTile.x + 1; x++) {
      for (let y = topLeftTile.y - 1; y <= bottomRightTile.y + 1; y++) {
        tiles.push({ x, y });
      }
    }

    return tiles;
  };

  // Convert position to screen coordinates
  const positionToScreen = (position: Position) => {
    const centerPixel = latLngToPixel(mapCenter.lat, mapCenter.lng, zoom);
    const pinPixel = latLngToPixel(position.lat, position.lng, zoom);

    return {
      x: mapDimensions.width / 2 + (pinPixel.x - centerPixel.x),
      y: mapDimensions.height / 2 + (pinPixel.y - centerPixel.y),
    };
  };

  // Get client coordinates from mouse or touch event
  const getClientCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return {
      x: (e as React.MouseEvent).clientX,
      y: (e as React.MouseEvent).clientY,
    };
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const coords = getClientCoords(e);
    setIsDragging(true);
    setDragStart(coords);
    setSelectedPin(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    e.preventDefault();
    const coords = getClientCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    const centerPixel = latLngToPixel(mapCenter.lat, mapCenter.lng, zoom);
    const newCenter = pixelToLatLng(
      centerPixel.x - deltaX,
      centerPixel.y - deltaY,
      zoom
    );

    setMapCenter(newCenter);
    setDragStart(coords);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setDragStart(null);
  };

  // Handle touch events (without preventDefault to avoid passive listener errors)
  const handleTouchStart = (e: React.TouchEvent) => {
    const coords = getClientCoords(e);
    setIsDragging(true);
    setDragStart(coords);
    setSelectedPin(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart) return;

    const coords = getClientCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    const centerPixel = latLngToPixel(mapCenter.lat, mapCenter.lng, zoom);
    const newCenter = pixelToLatLng(
      centerPixel.x - deltaX,
      centerPixel.y - deltaY,
      zoom
    );

    setMapCenter(newCenter);
    setDragStart(coords);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(1, Math.min(18, zoom + delta));
    setZoom(newZoom);
  };

  const handlePinClick = (
    pin: MapPin,
    e: React.MouseEvent | React.TouchEvent
  ) => {
    e.stopPropagation();
    setSelectedPin(pin);
  };

  const handlePinTouch = (pin: MapPin, e: React.TouchEvent) => {
    e.stopPropagation();
    // Prevent dragging when touching a pin
    setIsDragging(false);
    setDragStart(null);
    setSelectedPin(pin);
  };

  // Add global mouse up listener to handle mouse up outside map
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        setDragStart(null);
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchend", handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging]);

  if (isLoading) {
    return (
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">
          {error ? error : "Loading map and getting your location..."}
        </div>
      </div>
    );
  }

  const visibleTiles = getVisibleTiles();

  return (
    <div className="h-[500px] w-full relative overflow-hidden bg-gray-200 rounded-lg">
      <div
        ref={mapRef}
        className={`w-full h-full relative ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        } select-none`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Render map tiles */}
        {visibleTiles.map((tile) => {
          // Calculate tile position more accurately
          const tileWorldX = tile.x * 256;
          const tileWorldY = tile.y * 256;

          const centerPixel = latLngToPixel(mapCenter.lat, mapCenter.lng, zoom);

          const tileScreenX =
            mapDimensions.width / 2 + (tileWorldX - centerPixel.x);
          const tileScreenY =
            mapDimensions.height / 2 + (tileWorldY - centerPixel.y);

          const style = {
            position: "absolute" as const,
            left: tileScreenX,
            top: tileScreenY,
            width: 256,
            height: 256,
          };

          return (
            <img
              key={`${tile.x}-${tile.y}-${zoom}`}
              src={`https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`}
              alt="Map tile"
              style={style}
              loading="lazy"
              draggable={false}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
              }}
            />
          );
        })}

        {/* Render pins */}
        {mapPins.map((pin) => {
          const screenPos = positionToScreen(pin.position);

          // Only render pins that are visible on screen
          if (
            screenPos.x < -50 ||
            screenPos.x > mapDimensions.width + 50 ||
            screenPos.y < -50 ||
            screenPos.y > mapDimensions.height + 50
          ) {
            return null;
          }

          return (
            <div
              key={pin.id}
              className="absolute transform -translate-x-1/2 -translate-y-full touch-manipulation"
              style={{
                left: screenPos.x,
                top: screenPos.y,
                zIndex: selectedPin?.id === pin.id ? 1000 : 10,
              }}
              onClick={(e) => handlePinClick(pin, e)}
              onTouchStart={(e) => handlePinTouch(pin, e)}
            >
              {/* Pin icon */}
              <div className="relative cursor-pointer">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="filter drop-shadow-md"
                >
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill={pin.color}
                    stroke="white"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          );
        })}

        {/* Popup for selected pin */}
        {selectedPin && (
          <div
            className="absolute bg-white rounded-lg shadow-lg p-4 max-w-[280px] sm:max-w-xs z-50 transform -translate-x-1/2"
            style={{
              left: positionToScreen(selectedPin.position).x,
              top: positionToScreen(selectedPin.position).y - 10,
              transform: "translate(-50%, -100%)",
            }}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedPin(null)}
            >
              ×
            </button>

            {selectedPin.cluster ? (
              <div>
                <h3
                  className="text-base font-semibold mb-2"
                  style={{ color: selectedPin.cluster.color }}
                >
                  {selectedPin.cluster.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {selectedPin.cluster.description}
                  {userLocation && (
                    <div className="mt-1 text-xs text-gray-500">
                      Distance:{" "}
                      {getDistanceFromLatLng(
                        userLocation,
                        selectedPin.cluster.position
                      ).toFixed(1)}{" "}
                      km
                    </div>
                  )}
                </p>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Available Items:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedPin.cluster.items.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-sm font-medium text-gray-700">
                {selectedPin.label}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-1 text-sm font-medium shadow-sm"
          onClick={() => setZoom(Math.min(18, zoom + 1))}
        >
          +
        </button>
        <button
          className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-1 text-sm font-medium shadow-sm"
          onClick={() => setZoom(Math.max(1, zoom - 1))}
        >
          −
        </button>
        {userLocation && (
          <button
            className="bg-white hover:bg-gray-50 border border-gray-300 rounded px-3 py-1 text-sm font-medium shadow-sm"
            onClick={() => setMapCenter(userLocation)}
          >
            📍
          </button>
        )}
      </div>

      {/* Map info */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded px-3 py-2 text-xs text-gray-600">
        Zoom: {zoom} | Pins: {mapPins.length}
      </div>
    </div>
  );
};

export default GearMap;
