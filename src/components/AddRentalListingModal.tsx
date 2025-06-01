import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FiX, FiArrowRight } from "react-icons/fi";

interface AddRentalListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "details" | "deposit" | "pickup" | "insurance";

interface GearDetails {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  description: string;
  features: string[];
  deposit: number;
  pickupLocation: string;
  pickupInstructions: string;
  insuranceOptions: {
    basic: {
      price: number;
      features: string[];
    };
    premium: {
      price: number;
      features: string[];
    };
  };
}

const AddRentalListingModal = ({
  isOpen,
  onClose,
}: AddRentalListingModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("details");
  const [gearDetails, setGearDetails] = useState<GearDetails>({
    id: "",
    name: "",
    category: "",
    image: "",
    price: 0,
    description: "",
    features: [],
    deposit: 0,
    pickupLocation: "",
    pickupInstructions: "",
    insuranceOptions: {
      basic: {
        price: 5,
        features: ["Covers accidental damage", "Basic theft protection"],
      },
      premium: {
        price: 10,
        features: [
          "Full damage coverage",
          "Extended theft protection",
          "Emergency replacement",
        ],
      },
    },
  });

  const [newFeature, setNewFeature] = useState("");

  const steps: { id: Step; label: string }[] = [
    { id: "details", label: "Item Details" },
    { id: "deposit", label: "Deposit" },
    { id: "pickup", label: "Pickup" },
    { id: "insurance", label: "Insurance" },
  ];

  const handleNext = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setGearDetails((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    setGearDetails((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = e.target.value.trim();
    if (imageUrl) {
      try {
        new URL(imageUrl);
        setGearDetails((prev) => ({
          ...prev,
          image: imageUrl,
        }));
      } catch {
        toast.error("Please enter a valid image URL");
      }
    } else {
      setGearDetails((prev) => ({
        ...prev,
        image: "",
      }));
    }
  };

  const handleUpload = () => {
    // Validate required fields
    if (
      !gearDetails.name ||
      !gearDetails.category ||
      !gearDetails.price ||
      !gearDetails.image
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Generate a unique ID for the gear listing
    const gearId = `gear_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const gearWithId = { ...gearDetails, id: gearId };

    // Get existing gear listings from localStorage
    const existingGear = JSON.parse(
      localStorage.getItem("gearListings") || "[]"
    );

    // Add new gear listing
    const updatedGear = [...existingGear, gearWithId];

    // Save to localStorage
    localStorage.setItem("gearListings", JSON.stringify(updatedGear));

    toast.success("Gear listing created successfully!");
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "details":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
              >
                Image URL
              </label>
              <input
                type="url"
                id="image"
                value={gearDetails.image}
                onChange={handleImageChange}
                placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                className="w-full px-4 py-2 border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text"
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter a direct URL to your gear image
              </p>
            </div>

            {gearDetails.image && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2 cursor-pointer">
                  Image Preview
                </p>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-gray-200">
                  <img
                    src={gearDetails.image}
                    alt="Gear preview"
                    className="w-full h-full object-cover"
                    onError={() => {
                      toast.error(
                        "Failed to load image. Please check the URL."
                      );
                      setGearDetails((prev) => ({ ...prev, image: "" }));
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={gearDetails.name}
                onChange={(e) =>
                  setGearDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text"
                placeholder="Enter item name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={gearDetails.category}
                onChange={(e) =>
                  setGearDetails((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-pointer"
              >
                <option value="">Select a category</option>
                <option value="tents">Tents</option>
                <option value="sleeping-bags">Sleeping Bags</option>
                <option value="backpacks">Backpacks</option>
                <option value="cooking">Cooking Gear</option>
                <option value="climbing">Climbing Gear</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Price per Day ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={gearDetails.price || ""}
                onChange={(e) =>
                  setGearDetails((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text"
                placeholder="Enter price per day"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Description
              </label>
              <textarea
                value={gearDetails.description}
                onChange={(e) =>
                  setGearDetails((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text resize-none"
                rows={4}
                placeholder="Enter item description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Features
              </label>
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text"
                  placeholder="Add a feature"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <button
                  onClick={handleAddFeature}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-700 text-white rounded-2xl hover:bg-amber-800 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {gearDetails.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs sm:text-sm"
                  >
                    {feature}
                    <button
                      onClick={() => handleRemoveFeature(index)}
                      className="text-amber-600 hover:text-amber-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case "deposit":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Security Deposit Amount ($)
              </label>
              <input
                type="number"
                value={gearDetails.deposit || ""}
                onChange={(e) =>
                  setGearDetails((prev) => ({
                    ...prev,
                    deposit: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text"
                placeholder="Enter deposit amount"
                min="0"
                step="0.01"
              />
            </div>
            <div className="bg-amber-50 p-3 sm:p-4 rounded-2xl">
              <h4 className="font-medium text-amber-800 mb-2 text-sm sm:text-base">
                Deposit Information
              </h4>
              <p className="text-amber-700 text-sm sm:text-base">
                The security deposit will be fully refunded upon return of the
                equipment in its original condition. This helps protect against
                damage, loss, or late returns.
              </p>
            </div>
          </div>
        );

      case "pickup":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Pickup Location
              </label>
              <input
                type="text"
                value={gearDetails.pickupLocation}
                onChange={(e) =>
                  setGearDetails((prev) => ({
                    ...prev,
                    pickupLocation: e.target.value,
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text"
                placeholder="Enter pickup location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                Pickup Instructions
              </label>
              <textarea
                value={gearDetails.pickupInstructions}
                onChange={(e) =>
                  setGearDetails((prev) => ({
                    ...prev,
                    pickupInstructions: e.target.value,
                  }))
                }
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-amber-200 rounded-2xl focus:outline-none focus:border-amber-500 bg-white/50 cursor-text resize-none"
                rows={4}
                placeholder="Enter pickup instructions"
              />
            </div>
          </div>
        );

      case "insurance":
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="border rounded-2xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Basic Coverage
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      ${gearDetails.insuranceOptions.basic.price}/day
                    </p>
                  </div>
                  <input
                    type="number"
                    value={gearDetails.insuranceOptions.basic.price}
                    onChange={(e) =>
                      setGearDetails((prev) => ({
                        ...prev,
                        insuranceOptions: {
                          ...prev.insuranceOptions,
                          basic: {
                            ...prev.insuranceOptions.basic,
                            price: parseFloat(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full sm:w-20 px-2 py-1 text-sm sm:text-base border border-amber-200 rounded focus:border-amber-500 focus:outline-none bg-white/50"
                    min="0"
                    step="0.01"
                  />
                </div>
                <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                  {gearDetails.insuranceOptions.basic.features.map(
                    (feature, index) => (
                      <li key={index}>• {feature}</li>
                    )
                  )}
                </ul>
              </div>

              <div className="border rounded-2xl p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">
                      Premium Coverage
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      ${gearDetails.insuranceOptions.premium.price}/day
                    </p>
                  </div>
                  <input
                    type="number"
                    value={gearDetails.insuranceOptions.premium.price}
                    onChange={(e) =>
                      setGearDetails((prev) => ({
                        ...prev,
                        insuranceOptions: {
                          ...prev.insuranceOptions,
                          premium: {
                            ...prev.insuranceOptions.premium,
                            price: parseFloat(e.target.value) || 0,
                          },
                        },
                      }))
                    }
                    className="w-full sm:w-20 px-2 py-1 text-sm sm:text-base border border-amber-200 rounded focus:border-amber-500 focus:outline-none bg-white/50"
                    min="0"
                    step="0.01"
                  />
                </div>
                <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
                  {gearDetails.insuranceOptions.premium.features.map(
                    (feature, index) => (
                      <li key={index}>• {feature}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#F5E6D3]"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-[#F5E6D3] border-b border-amber-700/30">
              <div className="flex items-center justify-between px-4 py-4">
                <h2 className="text-lg sm:text-xl font-semibold text-amber-900">
                  Add New Gear
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/80 backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Progress Steps */}
              <div className="px-2 sm:px-4 pb-4 overflow-x-auto">
                <div className="flex justify-between min-w-[600px] sm:min-w-0">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base ${
                          steps.findIndex((s) => s.id === currentStep) >= index
                            ? "bg-amber-700 text-white"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span
                        className={`ml-2 text-xs sm:text-sm whitespace-nowrap ${
                          steps.findIndex((s) => s.id === currentStep) >= index
                            ? "text-amber-800"
                            : "text-amber-700/70"
                        }`}
                      >
                        {step.label}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-8 sm:w-12 h-0.5 mx-2 ${
                            steps.findIndex((s) => s.id === currentStep) > index
                              ? "bg-amber-700"
                              : "bg-amber-200"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                {renderStepContent()}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#F5E6D3] border-t border-amber-700/30 p-3 sm:p-4">
              <div className="max-w-2xl mx-auto flex justify-between">
                {currentStep !== "details" && (
                  <button
                    onClick={handleBack}
                    className="px-4 sm:px-6 py-2 text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <div className="ml-auto">
                  {currentStep === steps[steps.length - 1].id ? (
                    <button
                      onClick={handleUpload}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-700 text-white rounded-2xl hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FiArrowRight className="w-4 h-4" />
                      <span className="whitespace-nowrap">Upload Gear</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-amber-700 text-white rounded-2xl hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="whitespace-nowrap">Next</span>
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddRentalListingModal;
