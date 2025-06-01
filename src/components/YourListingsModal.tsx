import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiTrash2, FiEye } from "react-icons/fi";
import { toast } from "sonner";

interface GearListing {
  id: string | number;
  name: string;
  category: string;
  price: number;
  availableCount: number;
  image: string;
  status: "active" | "inactive" | "rented";
  lastRented?: string;
}

interface YourListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: GearListing[];
  onDeleteListing: (id: string | number) => void;
}

const YourListingsModal: React.FC<YourListingsModalProps> = ({
  isOpen,
  onClose,
  listings,
  onDeleteListing,
}) => {
  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      onDeleteListing(id);
      toast.success("Listing deleted successfully");
    }
  };

  const getStatusColor = (status: GearListing["status"]) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700";
      case "inactive":
        return "bg-gray-100 text-gray-700";
      case "rented":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        >
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Listings
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  {listings.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        You haven&apos;t listed any gear yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                          onClick={() => {
                            // Handle listing click - could open details view
                            console.log("View listing details:", listing.id);
                          }}
                        >
                          {/* Image */}
                          <div className="w-20 h-20 flex-shrink-0">
                            <img
                              src={listing.image}
                              alt={listing.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-grow">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900 group-hover:text-amber-700 transition-colors">
                                  {listing.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {listing.category}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                  listing.status
                                )}`}
                              >
                                {listing.status.charAt(0).toUpperCase() +
                                  listing.status.slice(1)}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                              <span>${listing.price}/day</span>
                              <span>•</span>
                              <span>{listing.availableCount} available</span>
                              {listing.lastRented && (
                                <>
                                  <span>•</span>
                                  <span>Last rented: {listing.lastRented}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div
                            className="flex items-center gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleDelete(listing.id)}
                              className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Delete listing"
                            >
                              <FiTrash2 className="w-5 h-5 text-red-600" />
                            </button>
                            <button
                              className="p-2 hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="View details"
                            >
                              <FiEye className="w-5 h-5 text-gray-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { YourListingsModal };
