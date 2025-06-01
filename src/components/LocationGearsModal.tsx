import React from "react";

interface Gear {
  id: number;
  name: string;
  category: string;
  quantity: number;
}

interface LocationGearsModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationName: string;
  gears: Gear[];
}

const LocationGearsModal: React.FC<LocationGearsModalProps> = ({
  isOpen,
  onClose,
  locationName,
  gears,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {locationName} - Available Gear
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {gears.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No gear available at this location
          </p>
        ) : (
          <div className="space-y-3">
            {gears.map((gear) => (
              <div
                key={gear.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl"
              >
                <div>
                  <h3 className="font-semibold">{gear.name}</h3>
                  <p className="text-sm text-gray-600">{gear.category}</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  Qty: {gear.quantity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationGearsModal;
