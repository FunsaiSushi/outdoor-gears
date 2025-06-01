"use client";

import React, { useState, useEffect, useMemo, ReactNode } from "react";

// Add font styles
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap');
  
  .bebas-neue {
    font-family: 'Bebas Neue', cursive;
  }

  .urbanist {
    font-family: 'Urbanist', sans-serif;
  }
`;

// UI and animation libraries
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { renderToStaticMarkup } from "react-dom/server";

// Map-related imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLngTuple } from "leaflet";

// React Icons (Fi)
import {
  FiX,
  FiArrowRight,
  FiHome,
  FiDollarSign,
  FiCalendar,
  FiShield,
  FiInfo,
  FiStar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiMenu,
  FiLogOut,
  FiPlus,
  FiAlertCircle,
  FiTrash2,
  FiEye,
} from "react-icons/fi";

// Font Awesome Icons (Fa)
import {
  FaMapMarkerAlt,
  FaFire,
  FaCampground,
  FaCompass,
  FaMapMarkedAlt,
} from "react-icons/fa";

// Define interface for gear items stored in localStorage
interface StoredGearItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
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

export { AddRentalListingModal };

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-[#2c1810]/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-[#f5e6d3] rounded-2xl w-full max-w-4xl mx-4 overflow-hidden shadow-xl">
        <button
          className="absolute top-4 right-4 text-[#2c1810]/60 hover:text-[#2c1810] z-10 cursor-pointer"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};

export { Modal };

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

interface User {
  name?: string;
  email: string;
  password: string;
}

const AuthModal = ({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [formData, setFormData] = useState<User>({
    name: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (mode === "signup" && !formData.name?.trim()) {
      toast.error("Please enter your name");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    if (!formData.password) {
      toast.error("Please enter your password");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted", { mode, formData });

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      if (mode === "signup") {
        // Check if user already exists
        const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
        console.log("Existing users:", existingUsers);

        const userExists = existingUsers.some(
          (user: User) =>
            user.email.toLowerCase() === formData.email.toLowerCase()
        );

        if (userExists) {
          toast.error("An account with this email already exists");
          setIsSubmitting(false);
          return;
        }

        // Store new user
        const newUser = {
          name: formData.name?.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        };

        localStorage.setItem(
          "users",
          JSON.stringify([...existingUsers, newUser])
        );
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        toast.success("Account created successfully! Welcome to CraftShop!");
        onClose();
      } else {
        // Login logic
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        console.log("Attempting login with:", formData.email);
        console.log("Available users:", users);

        // Check if there are any users registered
        if (users.length === 0) {
          toast.error("No registered users found. Please sign up first.");
          setIsSubmitting(false);
          return;
        }

        const user = users.find(
          (u: User) =>
            u.email.toLowerCase() === formData.email.toLowerCase() &&
            u.password === formData.password
        );

        if (user) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("currentUser", JSON.stringify(user));
          toast.success(`Welcome back, ${user.name || ""}!`);
          onClose();
        } else {
          const userExists = users.some(
            (u: User) => u.email.toLowerCase() === formData.email.toLowerCase()
          );
          if (userExists) {
            toast.error("Incorrect password");
          } else {
            toast.error(
              "No account found with this email. Please sign up first."
            );
          }
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    // Reset form data when switching modes
    setFormData({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex min-h-[600px]">
        {/* Left side - Image */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1770&auto=format&fit=crop"
            alt="Camping authentication"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
            <h2 className="text-4xl font-bold text-white text-center px-6 drop-shadow-lg">
              {mode === "login"
                ? "Welcome Back to OutdoorBoys!"
                : "Join the OutdoorBoys community and start your adventure."}
            </h2>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center bg-[#f5e6d3]">
          <h3 className="text-2xl font-bold text-[#2c1810] mb-6">
            {mode === "login" ? "Login to Your Account" : "Create Your Account"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#2c1810] mb-1 cursor-pointer"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-white/80 border border-[#d4b595] rounded-2xl focus:outline-none focus:border-[#8b5e34] text-[#2c1810] placeholder-[#8b5e34]/60 cursor-text"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#2c1810] mb-1 cursor-pointer"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-white/80 border border-[#d4b595] rounded-2xl focus:outline-none focus:border-[#8b5e34] text-[#2c1810] placeholder-[#8b5e34]/60 cursor-text"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#2c1810] mb-1 cursor-pointer"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-white/80 border border-[#d4b595] rounded-2xl focus:outline-none focus:border-[#8b5e34] text-[#2c1810] placeholder-[#8b5e34]/60 cursor-text"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-[#8b5e34] text-white py-2 px-4 rounded-2xl font-medium transition-colors mt-6 cursor-pointer
                ${
                  isSubmitting
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-[#6f4b29]"
                }`}
            >
              {isSubmitting
                ? "Processing..."
                : mode === "login"
                ? "Login"
                : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-[#2c1810]/80">
            {mode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-2 text-[#8b5e34] hover:text-[#6f4b29] font-medium cursor-pointer"
            >
              {mode === "login" ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </Modal>
  );
};

export { AuthModal };

interface CalendarProps {
  unavailableDates: Date[];
  today: Date;
  onDateSelect?: (date: Date) => void;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  isSelectingStartDate?: boolean;
  isSelectingEndDate?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  unavailableDates,
  today,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  isSelectingStartDate,
  isSelectingEndDate,
}) => {
  const DAYS = [
    { key: "sun", label: "S" },
    { key: "mon", label: "M" },
    { key: "tue", label: "T" },
    { key: "wed", label: "W" },
    { key: "thu", label: "T" },
    { key: "fri", label: "F" },
    { key: "sat", label: "S" },
  ];
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month (0-6)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Calculate the number of weeks needed
  const totalDays = firstDayOfMonth + daysInMonth;
  const numberOfWeeks = Math.ceil(totalDays / 7);

  // Add this function to check if a date is between start and end dates
  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    const normalizedStart = new Date(
      selectedStartDate.getFullYear(),
      selectedStartDate.getMonth(),
      selectedStartDate.getDate()
    ).getTime();
    const normalizedEnd = new Date(
      selectedEndDate.getFullYear(),
      selectedEndDate.getMonth(),
      selectedEndDate.getDate()
    ).getTime();
    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
  };

  // Add this function to check if a date is selectable
  const isDateSelectable = (date: Date) => {
    if (date < today) return false;
    return !unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.toDateString() === date.toDateString()
    );
  };

  // Modify the calendar days creation to support continuous range styling
  const calendarDays = [];
  let day = 1;

  for (let week = 0; week < numberOfWeeks; week++) {
    const weekDays = [];

    for (let weekday = 0; weekday < 7; weekday++) {
      if (week === 0 && weekday < firstDayOfMonth) {
        weekDays.push(
          <td key={`empty-${weekday}`} className="p-0.5 sm:p-1 md:p-2"></td>
        );
      } else if (day > daysInMonth) {
        weekDays.push(
          <td key={`empty-end-${weekday}`} className="p-0.5 sm:p-1 md:p-2"></td>
        );
      } else {
        const currentDay = new Date(currentYear, currentMonth, day);
        const isUnavailable = unavailableDates.some(
          (date) => date.toDateString() === currentDay.toDateString()
        );
        const isPast = currentDay < today;
        const isRangeStart =
          selectedStartDate?.toDateString() === currentDay.toDateString();
        const isRangeEnd =
          selectedEndDate?.toDateString() === currentDay.toDateString();
        const isInRange = isDateInRange(currentDay);
        const isSelectable = isDateSelectable(currentDay);

        weekDays.push(
          <td key={day} className="p-0.5 sm:p-1 md:p-2 relative">
            {isInRange && (
              <div
                className={`absolute inset-0 bg-amber-100 z-0 ${
                  isRangeStart
                    ? "rounded-l-full"
                    : isRangeEnd
                    ? "rounded-r-full"
                    : ""
                }`}
              />
            )}
            <div className="relative">
              <button
                onClick={() => {
                  if (isSelectable && onDateSelect) {
                    onDateSelect(currentDay);
                  }
                }}
                disabled={!isSelectable}
                className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base
                  transition-colors relative z-10 border border-amber-800/10
                  ${
                    isPast
                      ? "text-amber-200 cursor-not-allowed border-amber-200/30"
                      : isUnavailable
                      ? "bg-red-200 text-red-700 cursor-not-allowed border-red-300"
                      : isRangeStart || isRangeEnd
                      ? "bg-amber-700 text-white hover:bg-amber-800 border-amber-800"
                      : isInRange
                      ? "bg-amber-200 text-amber-800 hover:bg-amber-300 border-amber-300"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer border-amber-200"
                  }
                `}
              >
                {day}
              </button>
            </div>
          </td>
        );
        day++;
      }
    }
    calendarDays.push(<tr key={`week-${week}`}>{weekDays}</tr>);
  }

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto p-4 bg-[#F5E6D3] rounded-2xl border border-amber-700/30 shadow-sm">
      {(isSelectingStartDate || isSelectingEndDate) && (
        <div className="text-center mb-4 text-amber-800 font-medium">
          {isSelectingStartDate ? "Select Start Date" : "Select End Date"}
        </div>
      )}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 sm:p-2 rounded-full hover:bg-amber-100 transition-colors cursor-pointer border border-amber-800/20"
          disabled={
            currentYear === today.getFullYear() &&
            currentMonth === today.getMonth()
          }
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-center font-semibold text-xs sm:text-sm md:text-base">
          {MONTHS[currentMonth]} {currentYear}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-1 sm:p-2 rounded-full hover:bg-amber-100 transition-colors cursor-pointer border border-amber-800/20"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <table className="w-full table-fixed">
        <thead>
          <tr>
            {DAYS.map((day) => (
              <th
                key={day.key}
                className="p-0.5 sm:p-1 md:p-2 text-[10px] sm:text-xs md:text-sm text-amber-800 font-medium"
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{calendarDays}</tbody>
      </table>
      <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 text-[10px] sm:text-xs md:text-sm text-amber-800">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-amber-200"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-red-200"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export { Calendar };

// Add RentalHistory type
type RentalHistory = {
  id: string;
  gearName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  userEmail: string;
};

type GearModalProps = {
  isOpen: boolean;
  onClose: () => void;
  gear: {
    id: string | number;
    name: string;
    category: string;
    image: string;
    price: number;
    availableCount: number;
    description?: string;
    features?: string[];
    deposit?: number;
    pickupLocation?: string;
    pickupInstructions?: string;
    insuranceOptions?: {
      basic: {
        price: number;
        features: string[];
      };
      premium: {
        price: number;
        features: string[];
      };
    };
  };
  unavailableDates: Date[];
};

type Tab =
  | "details"
  | "deposit"
  | "pickup"
  | "availability"
  | "insurance"
  | "reviews";

const GearModal: React.FC<GearModalProps> = ({
  isOpen,
  onClose,
  gear,
  unavailableDates,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("details");
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);

  // Get current date without time
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const tabs = [
    { id: "details" as Tab, label: "Details", icon: FiInfo },
    { id: "deposit" as Tab, label: "Deposit", icon: FiDollarSign },
    { id: "pickup" as Tab, label: "Pickup", icon: FiMapPin },
    { id: "availability" as Tab, label: "Availability", icon: FiCalendar },
    { id: "insurance" as Tab, label: "Insurance", icon: FiShield },
    { id: "reviews" as Tab, label: "Reviews", icon: FiStar },
  ];

  const handleDateSelect = (date: Date) => {
    if (isSelectingStartDate) {
      // If clicking the same date, deselect it
      if (date.toDateString() === selectedStartDate?.toDateString()) {
        setSelectedStartDate(null);
        return;
      }
      setSelectedStartDate(date);
      setIsSelectingStartDate(false);
      setIsSelectingEndDate(true);
    } else if (isSelectingEndDate) {
      // If clicking the same date, deselect it
      if (date.toDateString() === selectedEndDate?.toDateString()) {
        setSelectedEndDate(null);
        setIsSelectingEndDate(true);
        return;
      }
      // If clicking the start date, deselect end date and switch to selecting end date
      if (date.toDateString() === selectedStartDate?.toDateString()) {
        setSelectedEndDate(null);
        setIsSelectingEndDate(true);
        return;
      }
      if (date < selectedStartDate!) {
        toast.error("End date must be after start date");
        return;
      }
      setSelectedEndDate(date);
      setIsSelectingEndDate(false);
    } else {
      // If we're not in selection mode but click a selected date, start over
      if (
        date.toDateString() === selectedStartDate?.toDateString() ||
        date.toDateString() === selectedEndDate?.toDateString()
      ) {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setIsSelectingStartDate(true);
        return;
      }
      // If clicking a new date when both dates are selected, start over
      setSelectedStartDate(null);
      setSelectedEndDate(null);
      setIsSelectingStartDate(true);
      handleDateSelect(date); // Call again to handle the selection
    }
  };

  const handleSelectDates = () => {
    setActiveTab("availability");
    setIsSelectingStartDate(true);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
  };

  const handleRentNow = () => {
    if (!selectedStartDate || !selectedEndDate) {
      handleSelectDates();
      return;
    }

    // Check if any dates in range are unavailable
    const isAnyDateUnavailable = unavailableDates.some((unavailableDate) => {
      const date = new Date(unavailableDate);
      return date >= selectedStartDate && date <= selectedEndDate;
    });

    if (isAnyDateUnavailable) {
      toast.error(
        "Some selected dates are unavailable. Please choose different dates."
      );
      return;
    }

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email) {
      toast.error("Please sign in to rent gear");
      return;
    }

    // Create new rental record
    const newRental: RentalHistory = {
      id: crypto.randomUUID(), // Generate unique ID
      gearName: gear.name,
      startDate: selectedStartDate.toISOString(),
      endDate: selectedEndDate.toISOString(),
      status: "active",
      userEmail: currentUser.email,
    };

    // Get existing rentals from localStorage
    const existingRentals = JSON.parse(localStorage.getItem("rentals") || "[]");

    // Add new rental to the list
    const updatedRentals = [...existingRentals, newRental];

    // Save to localStorage
    localStorage.setItem("rentals", JSON.stringify(updatedRentals));

    // Show success message
    toast.success("Gear rented successfully!");

    // Close the modal
    onClose();
  };

  const calculateTotalPrice = () => {
    if (!selectedStartDate || !selectedEndDate) return gear.price;

    const days =
      Math.ceil(
        (selectedEndDate.getTime() - selectedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    return gear.price * days;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "availability":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Check Availability
            </h3>
            <div className="p-4 rounded-2xl">
              <p className="text-gray-600 mb-4">
                Currently {gear.availableCount} units available for rent.
              </p>
              <div className="flex justify-center">
                <Calendar
                  unavailableDates={unavailableDates}
                  today={today}
                  onDateSelect={handleDateSelect}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  isSelectingStartDate={isSelectingStartDate}
                  isSelectingEndDate={isSelectingEndDate}
                />
              </div>
              {selectedStartDate && selectedEndDate && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Selected Dates</p>
                      <p className="font-medium">
                        {selectedStartDate.toLocaleDateString()} -{" "}
                        {selectedEndDate.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Price</p>
                      <p className="text-xl font-bold text-emerald-600">
                        ${calculateTotalPrice()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case "details":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {gear.name}
                </h3>
                <p className="text-gray-500">{gear.category}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  ${gear.price}/day
                </p>
                <p className="text-sm text-gray-500">
                  {gear.availableCount} available
                </p>
              </div>
            </div>
            <p className="text-gray-600">
              {gear.description ||
                "High-quality outdoor gear perfect for your next adventure. Our equipment is regularly maintained and cleaned to ensure the best experience for our customers."}
            </p>
            {gear.features && gear.features.length > 0 && (
              <div className="bg-emerald-50 p-4 rounded-2xl">
                <h4 className="font-semibold text-emerald-800 mb-2">
                  Features
                </h4>
                <ul className="list-disc list-inside text-emerald-700 space-y-1">
                  {gear.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case "deposit":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Deposit Requirements
            </h3>
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <p className="text-amber-800">
                A security deposit of ${gear.deposit || gear.price * 10} is
                required for this item. The deposit will be fully refunded upon
                return of the equipment in its original condition.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                What&apos;s covered:
              </h4>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Accidental damage</li>
                <li>Lost or stolen equipment</li>
                <li>Late return fees</li>
              </ul>
            </div>
          </div>
        );
      case "pickup":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Pickup Instructions
            </h3>
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <p className="text-gray-600">
                  {gear.pickupLocation ||
                    "123 Outdoor Avenue\nAdventure City, AC 12345"}
                </p>
              </div>
              {gear.pickupInstructions && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">
                    Additional Instructions
                  </h4>
                  <p className="text-gray-600">{gear.pickupInstructions}</p>
                </div>
              )}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">
                  Hours of Operation
                </h4>
                <ul className="text-gray-600 space-y-1">
                  <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                  <li>Saturday: 10:00 AM - 4:00 PM</li>
                  <li>Sunday: Closed</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case "insurance":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Insurance Options
            </h3>
            <div className="space-y-4">
              <div className="border rounded-2xl p-4 hover:border-emerald-500 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900">Basic Coverage</h4>
                <p className="text-gray-600 text-sm mt-1">
                  ${gear.insuranceOptions?.basic.price || 5}/day
                </p>
                <ul className="text-gray-600 text-sm mt-2 space-y-1">
                  {(
                    gear.insuranceOptions?.basic.features || [
                      "Covers accidental damage",
                      "Basic theft protection",
                    ]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-2xl p-4 hover:border-emerald-500 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900">Premium Coverage</h4>
                <p className="text-gray-600 text-sm mt-1">
                  ${gear.insuranceOptions?.premium.price || 10}/day
                </p>
                <ul className="text-gray-600 text-sm mt-2 space-y-1">
                  {(
                    gear.insuranceOptions?.premium.features || [
                      "Full damage coverage",
                      "Extended theft protection",
                      "Emergency replacement",
                    ]
                  ).map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      case "reviews":
        return <Reviews gearName={gear.name} />;
      default:
        return null;
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
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#F5E6D3]">
              {/* Image Section */}
              <div className="relative h-48">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-amber-50/80 backdrop-blur-sm hover:bg-amber-50 transition-colors cursor-pointer"
                >
                  <FiX className="w-6 h-6" />
                </button>
                <img
                  src={gear.image}
                  alt={gear.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Sticky Navigation */}
              <div className="bg-[#F5E6D3] border-b border-amber-700/30">
                <div className="max-w-3xl mx-auto">
                  <div className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors cursor-pointer ${
                            activeTab === tab.id
                              ? "text-amber-800 border-b-2 border-amber-800"
                              : "text-amber-700/70 hover:text-amber-900"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-20">
              <div className="max-w-3xl mx-auto px-4 py-6">
                {renderTabContent()}
              </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#F5E6D3] border-t border-amber-700/30 p-4 z-40">
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">
                    {selectedStartDate && selectedEndDate
                      ? "Total Price"
                      : "Price per Day"}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    $
                    {selectedStartDate && selectedEndDate
                      ? calculateTotalPrice()
                      : gear.price}
                    /day
                  </span>
                </div>
                <button
                  className={`px-8 py-3 rounded-2xl font-medium transition-colors cursor-pointer border border-amber-800/20 ${
                    selectedStartDate && selectedEndDate
                      ? "bg-amber-700 text-white hover:bg-amber-800"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                  onClick={
                    selectedStartDate && selectedEndDate
                      ? handleRentNow
                      : handleSelectDates
                  }
                >
                  {selectedStartDate && selectedEndDate
                    ? "Rent Now"
                    : "Select Dates"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { GearModal };

// Import the same types as Gears component
interface BaseGearItem {
  id: string | number;
  name: string;
  category: string;
  image: string;
  price: number;
  availableCount: number;
}

interface SampleGearItem extends BaseGearItem {
  id: number;
  unavailableDates: Date[];
}

interface LocalStorageGearItem extends BaseGearItem {
  id: string;
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

type GearItem = SampleGearItem | LocalStorageGearItem;

// Sample gear data from Gears component
const sampleGear: GearItem[] = [
  {
    id: 1,
    name: "Sleeping Bag Ultra",
    category: "SLEEPING",
    image:
      "https://images.unsplash.com/photo-1558477280-1bfed08ea5db?q=80&w=1976&auto=format&fit=crop",
    price: 25,
    availableCount: 8,
    unavailableDates: [],
  },
  {
    id: 2,
    name: "Camping Stove Pro",
    category: "COOKING",
    image: "https://images.unsplash.com/photo-1523497873958-8639c94677f2",
    price: 15,
    availableCount: 5,
    unavailableDates: [],
  },
  {
    id: 4,
    name: "4-Person Tent",
    category: "TENTS",
    image: "https://images.unsplash.com/photo-1501703979959-797917eb21c8?q=80",
    price: 45,
    availableCount: 3,
    unavailableDates: [],
  },
  {
    id: 6,
    name: "Cooler Pro 50L",
    category: "STORAGE",
    image:
      "https://images.unsplash.com/photo-1700004583893-981e311b3501?q=80&w=2071&auto=format&fit=crop",
    price: 20,
    availableCount: 6,
    unavailableDates: [],
  },
];

const FeaturedGears = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [localStorageGear, setLocalStorageGear] = useState<GearItem[]>([]);

  // Load gear from localStorage
  useEffect(() => {
    const loadLocalStorageGear = () => {
      try {
        const storedGear = JSON.parse(
          localStorage.getItem("gearListings") || "[]"
        );
        setLocalStorageGear(storedGear);
      } catch (error) {
        console.error("Error loading gear from localStorage:", error);
      }
    };

    loadLocalStorageGear();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gearListings") {
        loadLocalStorageGear();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Combine sample gear and localStorage gear
  const allGear = [...sampleGear, ...localStorageGear];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex + newDirection + allGear.length) % allGear.length
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);

    return () => clearInterval(timer);
  }, [allGear.length]);

  return (
    <section
      id="featured-gears"
      className="py-16 bg-gradient-to-b from-emerald-50 to-teal-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl bebas-neue text-center mb-4 text-gray-900"
        >
          FEATURED GEAR
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
        >
          Discover our most popular and highly-rated outdoor equipment, ready
          for your next adventure
        </motion.p>

        <div className="relative h-[500px] overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full h-full flex justify-center items-center cursor-pointer"
              onClick={() => setSelectedGear(allGear[currentIndex])}
            >
              <div className="relative w-full max-w-2xl mx-auto">
                <div className="relative aspect-[3/2] rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={allGear[currentIndex].image}
                    alt={allGear[currentIndex].name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <span className="text-emerald-400 font-medium mb-2 block">
                      {allGear[currentIndex].category}
                    </span>
                    <h3 className="text-2xl font-bold mb-2">
                      {allGear[currentIndex].name}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-gray-200">
                        ${allGear[currentIndex].price}/day
                      </p>
                      <span className="text-sm text-gray-200">
                        {allGear[currentIndex].availableCount} available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              paginate(-1);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              paginate(1);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {allGear.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? "bg-emerald-400 w-4" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gear Modal */}
      {selectedGear && (
        <GearModal
          isOpen={true}
          onClose={() => setSelectedGear(null)}
          gear={selectedGear}
          unavailableDates={
            "unavailableDates" in selectedGear
              ? selectedGear.unavailableDates
              : []
          }
        />
      )}
    </section>
  );
};

export { FeaturedGears };

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-emerald-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h3 className="text-2xl font-bold text-white">OutdoorBoys</h3>
            <p className="text-sm text-gray-400">
              Your trusted platform for outdoor gear rentals. Adventure awaits
              with our quality equipment and seamless rental experience.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {["About Us", "How It Works", "Safety", "Blog"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Categories */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Gear Categories
            </h4>
            <ul className="space-y-2">
              {[
                "Camping",
                "Hiking",
                "Climbing",
                "Water Sports",
                "Winter Sports",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-emerald-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <FiMapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">
                  123 Adventure Lane, Outdoor City
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-emerald-400" />
                <span className="text-sm">hello@outdoorboys.com</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-emerald-800 text-center text-sm text-gray-400"
        >
          <p>© 2024 OutdoorBoys. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
};

export { Footer };

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

export { GearMap };

// Base interface for common gear properties
interface BaseGearItem {
  id: string | number;
  name: string;
  category: string;
  image: string;
  price: number;
  availableCount: number;
}

// Interface for sample gear items
interface SampleGearItem extends BaseGearItem {
  id: number;
  unavailableDates: Date[];
}

// Interface for localStorage gear items
interface LocalStorageGearItem extends BaseGearItem {
  id: string;
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

// Union type for all gear items

const categories = [
  {
    name: "ALL",
    image:
      "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "SLEEPING",
    image:
      "https://images.unsplash.com/photo-1558477280-1bfed08ea5db?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "COOKING",
    image: "https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?q=80",
  },
  {
    name: "LIGHTS",
    image:
      "https://images.unsplash.com/photo-1632534244358-ab0c65c1b1e4?q=80&w=1926&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "STORAGE",
    image:
      "https://images.unsplash.com/photo-1700004583893-981e311b3501?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "FURNITURE",
    image:
      "https://images.unsplash.com/photo-1625773581460-482530b2b158?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "TENTS",
    image: "https://images.unsplash.com/photo-1501703979959-797917eb21c8?q=80",
  },
  {
    name: "APPAREL",
    image:
      "https://images.unsplash.com/photo-1713379796475-d061422dca01?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

// Helper function to generate random unavailable dates
const generateUnavailableDates = (count: number): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate dates for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // 30% chance of being unavailable
    if (Math.random() < 0.3) {
      dates.push(date);
    }
  }

  // Ensure we have at least count number of dates
  while (dates.length < count) {
    const date = new Date(today);
    date.setDate(today.getDate() + Math.floor(Math.random() * 30));
    if (!dates.some((d) => d.toDateString() === date.toDateString())) {
      dates.push(date);
    }
  }

  return dates.slice(0, count);
};

// Helper function to get unavailable dates from rentals
const getUnavailableDatesFromRentals = (gearName: string): Date[] => {
  const rentals = JSON.parse(localStorage.getItem("rentals") || "[]");
  const unavailableDates: Date[] = [];

  // Get all active rentals for this gear
  const gearRentals = rentals.filter(
    (rental: RentalHistory) =>
      rental.gearName === gearName && rental.status === "active"
  );

  // For each rental, add all dates in the range to unavailable dates
  gearRentals.forEach((rental: RentalHistory) => {
    const startDate = new Date(rental.startDate);
    const endDate = new Date(rental.endDate);

    // Set both dates to midnight to avoid time issues
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Add all dates in the range
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dateCopy = new Date(date);
      if (
        !unavailableDates.some(
          (d) => d.toDateString() === dateCopy.toDateString()
        )
      ) {
        unavailableDates.push(dateCopy);
      }
    }
  });

  return unavailableDates;
};

// Helper function to convert localStorage gear to display format
const convertLocalStorageGearToDisplayFormat = (
  gear: LocalStorageGearItem
): GearItem => {
  // Get actual unavailable dates from rentals
  const rentalUnavailableDates = getUnavailableDatesFromRentals(gear.name);

  // Generate some additional random unavailable dates if needed
  const randomUnavailableDates = generateUnavailableDates(1);

  // Combine both sets of dates, removing duplicates
  const allUnavailableDates = [...rentalUnavailableDates];
  randomUnavailableDates.forEach((date) => {
    if (
      !allUnavailableDates.some((d) => d.toDateString() === date.toDateString())
    ) {
      allUnavailableDates.push(date);
    }
  });

  return {
    ...gear,
    availableCount: 1, // Default to 1 for user-added gear
    unavailableDates: allUnavailableDates,
  };
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.7, 0, 0.3, 1],
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: [0.7, 0, 0.3, 1],
    },
  },
};

const Gears = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGear, setSelectedGear] = useState<GearItem | null>(null);
  const [localStorageGear, setLocalStorageGear] = useState<GearItem[]>([]);

  // Load gear from localStorage
  useEffect(() => {
    const loadLocalStorageGear = () => {
      try {
        const storedGear = JSON.parse(
          localStorage.getItem("gearListings") || "[]"
        );
        const convertedGear = storedGear.map(
          convertLocalStorageGearToDisplayFormat
        );
        setLocalStorageGear(convertedGear);
      } catch (error) {
        console.error("Error loading gear from localStorage:", error);
      }
    };

    loadLocalStorageGear();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gearListings") {
        loadLocalStorageGear();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Combine sample gear and localStorage gear
  const allGear = [...sampleGear, ...localStorageGear];

  // Filter gear by category
  const filteredGear = selectedCategory
    ? allGear.filter((item) =>
        selectedCategory === "ALL"
          ? true
          : item.category.toUpperCase() === selectedCategory
      )
    : [];

  return (
    <section id="camping-gear" className="h-full overflow-y-auto bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-8xl bebas-neue text-black mb-8">CATALOG</h2>
        </motion.div>

        {/* Categories Grid */}
        {!selectedCategory && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12"
          >
            {categories.map((category) => (
              <motion.div
                key={category.name}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.name)}
                className="relative overflow-hidden aspect-square cursor-pointer group rounded-2xl"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <h3 className="text-2xl bebas-neue text-white">
                    {category.name}
                  </h3>
                  <span className="text-sm text-white mt-2">
                    {
                      allGear.filter((item) =>
                        category.name === "ALL"
                          ? true
                          : item.category.toUpperCase() === category.name
                      ).length
                    }{" "}
                    items
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Horizontal Scrollable Categories */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 -mx-4 sm:-mx-6 lg:-mx-8"
          >
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex overflow-x-auto pb-4 scrollbar-hide -mx-2">
                {categories.map((category) => (
                  <motion.button
                    key={category.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`flex-none mx-2 relative group cursor-pointer ${
                      selectedCategory === category.name
                        ? "opacity-100"
                        : "opacity-50 hover:opacity-75"
                    }`}
                  >
                    <div className="w-32 h-20 relative overflow-hidden rounded-2xl">
                      <div
                        className={`absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10 ${
                          selectedCategory === category.name
                            ? "bg-emerald-900/40"
                            : ""
                        }`}
                      />
                      <img
                        src={category.image}
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <h3 className={`text-sm bebas-neue text-white`}>
                          {category.name}
                        </h3>
                        <span className="text-xs text-white mt-1">
                          {
                            allGear.filter((item) =>
                              category.name === "ALL"
                                ? true
                                : item.category.toUpperCase() === category.name
                            ).length
                          }{" "}
                          items
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Selected Category Items */}
        {selectedCategory && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredGear.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => setSelectedGear(item)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110 group-hover:brightness-110"
                  />
                  {"features" in item && item.features.length > 0 && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full z-10">
                      {item.features.length} features
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {item.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xl font-semibold text-gray-900">
                      ${item.price}/day
                    </p>
                    <span className="text-sm text-gray-500">
                      {item.availableCount} available
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 rounded-2xl hover:bg-emerald-700 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent div's onClick
                      setSelectedGear(item);
                    }}
                  >
                    <FiCalendar className="w-4 h-4" />
                    Check Availability
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Gear Modal */}
      {selectedGear && (
        <GearModal
          isOpen={true}
          onClose={() => setSelectedGear(null)}
          gear={selectedGear}
          unavailableDates={
            "unavailableDates" in selectedGear
              ? selectedGear.unavailableDates
              : []
          }
        />
      )}
    </section>
  );
};

export { Gears };

const Hero = () => {
  const cornerLinksVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1533873984035-25970ab07461"
          alt="Camping Hero"
          className="h-full w-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4 sm:px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-4 md:space-y-6 max-w-[90vw] md:max-w-4xl"
        >
          <h1 className="bebas-neue text-5xl sm:text-6xl md:text-7xl lg:text-[120px] text-white leading-none tracking-wide">
            EQUIPPED
            <br />
            FOR
            <br />
            COMFORT
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-200 text-base sm:text-lg md:text-xl max-w-2xl mx-auto px-4"
          >
            Rent premium outdoor gear from local adventurers. Experience nature
            without the burden of ownership.
          </motion.p>
        </motion.div>

        {/* Corner Links */}
        <div className="absolute inset-0 p-4 sm:p-6 md:p-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-full w-full flex flex-col justify-between"
          >
            <div className="w-full flex justify-between">
              <motion.div variants={cornerLinksVariants} className="mt-20">
                <button
                  onClick={() => scrollToSection("camping-gear")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaCampground className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 hidden sm:inline">
                    CAMPING GEAR
                  </span>
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 sm:hidden">
                    GEAR
                  </span>
                </button>
              </motion.div>
              <motion.div variants={cornerLinksVariants} className="mt-20">
                <button
                  onClick={() => scrollToSection("featured-gears")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaFire className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 hidden sm:inline">
                    FEATURED GEARS
                  </span>
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 sm:hidden">
                    FEATURED
                  </span>
                </button>
              </motion.div>
            </div>
            <div className="w-full flex justify-between">
              <motion.div variants={cornerLinksVariants}>
                <button
                  onClick={() => scrollToSection("locations")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaMapMarkedAlt className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 hidden sm:inline">
                    LIMITED
                  </span>
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1 sm:hidden">
                    LOC
                  </span>
                </button>
              </motion.div>
              <motion.div variants={cornerLinksVariants}>
                <button
                  onClick={() => scrollToSection("explore")}
                  className="text-white hover:text-emerald-400 flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base md:text-lg font-medium cursor-pointer"
                >
                  <FaCompass className="text-sm sm:text-base md:text-lg" />
                  <span className="border-b-2 border-transparent hover:border-emerald-400 pb-1">
                    EST. 2024
                  </span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export { Hero };

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

export { LocationGearsModal };

interface NavbarProps {
  onLocationsClick: (show: boolean) => void;
  showLocations: boolean;
  onUserClick: () => void;
  onRentalHistoryClick: () => void;
  onAddRentalClick: () => void;
  onMenuClick: () => void;
  onReportDamageClick: () => void;
  onYourListingsClick: () => void;
}

const Navbar = ({
  onLocationsClick,
  showLocations,
  onUserClick,
  onRentalHistoryClick,
  onAddRentalClick,
  onMenuClick,
  onReportDamageClick,
  onYourListingsClick,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(
    null
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check authentication status
    const authStatus = localStorage.getItem("isAuthenticated");
    if (authStatus === "true") {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      setCurrentUser(user);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleUserClick = () => {
    if (currentUser) {
      setShowUserMenu(!showUserMenu);
    } else {
      onUserClick();
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-menu") && !target.closest(".user-button")) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed w-full backdrop-blur-sm z-50 transition-all duration-300 ${
        showLocations
          ? "bg-black/80 shadow-lg"
          : isScrolled
          ? "bg-black/80 shadow-lg"
          : "bg-gradient-to-b from-black/50 to-transparent"
      }`}
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button
            onClick={() => onLocationsClick(false)}
            className="flex items-center cursor-pointer"
          >
            <span className="text-2xl font-bold text-white hover:text-emerald-400 transition-colors">
              OutdoorGears
            </span>
          </button>

          {!showLocations ? (
            <>
              {/* Desktop Navigation Items */}
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={() => onLocationsClick(true)}
                  className="text-white hover:text-emerald-400 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <FiMapPin className="w-5 h-5" />
                  <span>Locations</span>
                </button>

                {currentUser && (
                  <button
                    onClick={onAddRentalClick}
                    className="text-white hover:text-emerald-400 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FiPlus className="w-5 h-5" />
                    <span>Add Gear</span>
                  </button>
                )}

                {/* User Menu Button */}
                <div className="relative">
                  <button
                    onClick={handleUserClick}
                    className="user-button p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <FiUser className="w-5 h-5 text-white hover:text-emerald-400 transition-colors" />
                  </button>

                  {/* User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="user-menu absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm text-gray-600 truncate">
                          {currentUser?.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          onRentalHistoryClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Rental History
                      </button>
                      <button
                        onClick={() => {
                          onYourListingsClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      >
                        Your Listings
                      </button>
                      <button
                        onClick={() => {
                          onReportDamageClick();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-gray-100 cursor-pointer"
                      >
                        Report Damage
                      </button>
                      <button
                        onClick={() => {
                          localStorage.removeItem("isAuthenticated");
                          localStorage.removeItem("currentUser");
                          setCurrentUser(null);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <FiMenu className="w-6 h-6 text-white hover:text-emerald-400 transition-colors" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onLocationsClick(false)}
              className="flex items-center cursor-pointer"
            >
              <FiHome className="w-6 h-6 text-white hover:text-emerald-400 transition-colors cursor-pointer" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export { Navbar };

interface NavbarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationsClick: (show: boolean) => void;
  onUserClick: () => void;
  onRentalHistoryClick: () => void;
  onAddRentalClick: () => void;
  onReportDamageClick: () => void;
  onYourListingsClick: () => void;
  currentUser: { email: string } | null;
  onLogout: () => void;
}

const NavbarMenu = ({
  isOpen,
  onClose,
  onLocationsClick,
  onUserClick,
  onRentalHistoryClick,
  onAddRentalClick,
  onReportDamageClick,
  onYourListingsClick,
  currentUser,
  onLogout,
}: NavbarMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Menu */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-[280px] bg-white z-50 shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-6 h-6 text-gray-900" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-4">
              {/* User Section */}
              {currentUser ? (
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600 truncate">
                    {currentUser.email}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    onUserClick();
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiUser className="w-5 h-5 text-gray-900" />
                  <span className="text-gray-900">Sign In</span>
                </button>
              )}

              {/* Locations */}
              <button
                onClick={() => {
                  onClose();
                  onLocationsClick(true);
                }}
                className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiMapPin className="w-5 h-5 text-gray-900" />
                <span className="text-gray-900">Locations</span>
              </button>

              {/* Add Gear (Authenticated Users Only) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onClose();
                    onAddRentalClick();
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiPlus className="w-5 h-5 text-gray-900" />
                  <span className="text-gray-900">Add Gear</span>
                </button>
              )}

              {/* Rental History (Authenticated Users Only) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onClose();
                    onRentalHistoryClick();
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-900">Rental History</span>
                </button>
              )}

              {/* Your Listings (Authenticated Users Only) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onClose();
                    onYourListingsClick();
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-gray-900">Your Listings</span>
                </button>
              )}

              {/* Report Damage (Authenticated Users Only) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onClose();
                    onReportDamageClick();
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors text-amber-600"
                >
                  <span>Report Damage</span>
                </button>
              )}

              {/* Logout (Authenticated Users Only) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="flex items-center gap-3 w-full p-3 hover:bg-gray-100 rounded-lg transition-colors text-left text-red-600"
                >
                  <FiLogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export { NavbarMenu };

interface RentalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Review {
  id: string;
  rentalId: string;
  gearName: string;
  userEmail: string;
  review: string;
  date: string;
}

const RentalHistoryModal = ({ isOpen, onClose }: RentalHistoryModalProps) => {
  const [rentalHistory, setRentalHistory] = useState<RentalHistory[]>([]);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Get rental history from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const allRentals = JSON.parse(localStorage.getItem("rentals") || "[]");
    const userRentals = allRentals.filter(
      (rental: RentalHistory) => rental.userEmail === currentUser.email
    );
    setRentalHistory(userRentals);

    // Get existing reviews
    const existingReviews = JSON.parse(localStorage.getItem("reviews") || "[]");
    setReviews(existingReviews);
  }, [isOpen]);

  const getStatusColor = (status: RentalHistory["status"]) => {
    switch (status) {
      case "active":
        return "text-emerald-600";
      case "completed":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleReviewClick = (rentalId: string) => {
    if (expandedReviewId === rentalId) {
      setExpandedReviewId(null);
      setReviewText("");
    } else {
      setExpandedReviewId(rentalId);
      setReviewText("");
    }
  };

  const handleReviewSubmit = (rental: RentalHistory) => {
    if (!reviewText.trim()) {
      toast.error("Please enter a review");
      return;
    }

    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email) {
      toast.error("Please sign in to submit a review");
      return;
    }

    const newReview: Review = {
      id: crypto.randomUUID(),
      rentalId: rental.id,
      gearName: rental.gearName,
      userEmail: currentUser.email,
      review: reviewText.trim(),
      date: new Date().toISOString(),
    };

    const updatedReviews = [...reviews, newReview];
    localStorage.setItem("reviews", JSON.stringify(updatedReviews));
    setReviews(updatedReviews);
    setReviewText("");
    setExpandedReviewId(null);
    toast.success("Review submitted successfully!");
  };

  const hasReview = (rentalId: string) => {
    return reviews.some((review) => review.rentalId === rentalId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#2c1810] mb-6">
          Rental History
        </h2>

        {rentalHistory.length === 0 ? (
          <p className="text-[#2c1810]/80 text-center py-8">
            No rental history found.
          </p>
        ) : (
          <div className="space-y-4">
            {rentalHistory.map((rental) => (
              <div key={rental.id} className="space-y-2">
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-[#2c1810]">
                        {rental.gearName}
                      </h3>
                      <p className="text-sm text-[#2c1810]/80 mt-1">
                        {new Date(rental.startDate).toLocaleDateString()} -{" "}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          rental.status
                        )}`}
                      >
                        {rental.status}
                      </span>
                      {rental.status === "completed" &&
                        !hasReview(rental.id) && (
                          <button
                            onClick={() => handleReviewClick(rental.id)}
                            className="px-3 py-1 text-sm bg-amber-100 text-amber-800 rounded-full hover:bg-amber-200 transition-colors"
                          >
                            {expandedReviewId === rental.id
                              ? "Cancel"
                              : "Review"}
                          </button>
                        )}
                      {rental.status === "completed" &&
                        hasReview(rental.id) && (
                          <span className="px-3 py-1 text-sm bg-emerald-100 text-emerald-800 rounded-full">
                            Reviewed
                          </span>
                        )}
                      {rental.status === "active" && (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                          Review after completion
                        </span>
                      )}
                      {rental.status === "cancelled" && (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                          Not available for review
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {expandedReviewId === rental.id && (
                  <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200">
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your review here..."
                      className="w-full h-24 p-3 rounded-xl border border-amber-200 focus:border-amber-400 focus:outline-none bg-white/50 resize-none"
                    />
                    <div className="flex justify-end mt-2 gap-2">
                      <button
                        onClick={() => handleReviewClick(rental.id)}
                        className="px-4 py-2 text-sm text-amber-800 hover:bg-amber-100 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReviewSubmit(rental)}
                        className="px-4 py-2 text-sm bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export { RentalHistoryModal };

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentedGear: Array<{
    id: string | number;
    name: string;
    rentalDate: string;
  }>;
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  rentedGear,
}) => {
  const [selectedGear, setSelectedGear] = useState<string>("");
  const [damageImage, setDamageImage] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGear) {
      toast.error("Please select the gear item");
      return;
    }
    if (!damageImage) {
      toast.error("Please provide an image of the damage");
      return;
    }
    if (!description) {
      toast.error("Please provide a description of the damage");
      return;
    }

    // Handle the report submission
    console.log("Damage report submitted:", {
      gearId: selectedGear,
      damageImage,
      description,
    });

    toast.success("Damage report submitted successfully");
    onClose();
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
                className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <FiAlertCircle className="w-6 h-6 text-amber-500" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Report Damage
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiX className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Gear Selection */}
                  <div>
                    <label
                      htmlFor="gear"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Select Gear Item
                    </label>
                    <select
                      id="gear"
                      value={selectedGear}
                      onChange={(e) => setSelectedGear(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="">Select an item</option>
                      {rentedGear.map((gear) => (
                        <option key={gear.id} value={gear.id}>
                          {gear.name} (Rented on {gear.rentalDate})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Damage Image */}
                  <div>
                    <label
                      htmlFor="damageImage"
                      className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                    >
                      Damage Image URL
                    </label>
                    <input
                      type="url"
                      id="damageImage"
                      value={damageImage}
                      onChange={(e) => setDamageImage(e.target.value)}
                      placeholder="https://example.com/damage-image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-text"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700 mb-2 cursor-pointer"
                    >
                      Damage Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Please describe the damage in detail..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-text resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors cursor-pointer"
                  >
                    Submit Report
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { ReportModal };

interface Review {
  id: string;
  rentalId: string;
  gearName: string;
  userEmail: string;
  review: string;
  date: string;
}

interface Rental {
  id: string;
  gearName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  userEmail: string;
}

// Example reviews data
const exampleReviews = [
  {
    id: 1,
    author: "John D.",
    rating: 5,
    date: "2024-03-15",
    comment:
      "Excellent gear, exactly what I needed for my hiking trip. Very well maintained.",
    verified: true,
  },
  {
    id: 2,
    author: "Sarah M.",
    rating: 4,
    date: "2024-03-10",
    comment:
      "Great quality equipment. The pickup process was smooth. Would rent again.",
    verified: true,
  },
  {
    id: 3,
    author: "Mike R.",
    rating: 5,
    date: "2024-03-05",
    comment:
      "Perfect condition, made my camping trip so much better. Highly recommend!",
    verified: true,
  },
];

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <FiStar
          key={index}
          className={`w-4 h-4 ${
            index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
};

interface ReviewsProps {
  gearName?: string;
}

const Reviews: React.FC<ReviewsProps> = ({ gearName }) => {
  const [hasRented, setHasRented] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email) return;

    // Get rentals from localStorage
    const rentals = JSON.parse(localStorage.getItem("rentals") || "[]");
    const userRentals = rentals.filter(
      (rental: Rental) =>
        rental.userEmail === currentUser.email &&
        rental.gearName === gearName &&
        rental.status === "completed"
    );
    setHasRented(userRentals.length > 0);

    // Get reviews from localStorage
    const storedReviews = JSON.parse(localStorage.getItem("reviews") || "[]");
    const gearReviews = storedReviews.filter(
      (review: Review) => review.gearName === gearName
    );
    setReviews(gearReviews);
  }, [gearName]);

  if (!hasRented) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Customer Reviews
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center">{renderStars(4.7)}</div>
            <span className="text-lg font-medium text-gray-900">4.7</span>
            <span className="text-sm text-gray-500">
              ({exampleReviews.length} reviews)
            </span>
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <p className="text-amber-800">
            You can review this product after completing your rental. Reviews
            help other customers make informed decisions about their gear
            choices.
          </p>
        </div>
        <div className="space-y-4">
          {exampleReviews.map((review) => (
            <div key={review.id} className="border rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {review.author}
                    </span>
                    {review.verified && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        Verified Rental
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">
          Customer Reviews
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">{renderStars(4.7)}</div>
          <span className="text-lg font-medium text-gray-900">4.7</span>
          <span className="text-sm text-gray-500">
            ({exampleReviews.length + reviews.length} reviews)
          </span>
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">You</span>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    Your Review
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.review}</p>
          </div>
        ))}
        {exampleReviews.map((review) => (
          <div key={review.id} className="border rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {review.author}
                  </span>
                  {review.verified && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Verified Rental
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Reviews };

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

const Home = () => {
  const [showLocations, setShowLocations] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRentalHistory, setShowRentalHistory] = useState(false);
  const [showAddRental, setShowAddRental] = useState(false);
  const [showReportDamage, setShowReportDamage] = useState(false);
  const [showYourListings, setShowYourListings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string } | null>(
    null
  );
  const [userListings, setUserListings] = useState<
    Array<{
      id: string;
      name: string;
      category: string;
      price: number;
      availableCount: number;
      image: string;
      status: "active" | "inactive" | "rented";
      lastRented?: string;
    }>
  >([]);

  // Example data for rented gear - in a real app, this would come from an API
  const [rentedGear] = useState([
    {
      id: 1,
      name: "Mountain Bike",
      rentalDate: "2024-03-15",
    },
    {
      id: 2,
      name: "Camping Tent",
      rentalDate: "2024-03-10",
    },
  ]);

  // Load user listings from localStorage
  useEffect(() => {
    const loadUserListings = () => {
      try {
        const storedGear = JSON.parse(
          localStorage.getItem("gearListings") || "[]"
        ) as StoredGearItem[];
        // Transform the stored gear into the format expected by YourListingsModal
        const transformedListings = storedGear.map((gear) => ({
          id: gear.id,
          name: gear.name,
          category: gear.category,
          price: gear.price,
          availableCount: 1, // Default to 1 for user-added gear
          image: gear.image,
          status: "active" as const, // Default to active for user-added gear
          lastRented: undefined, // This would come from rental history in a real app
        }));
        setUserListings(transformedListings);
      } catch (error) {
        console.error("Error loading user listings from localStorage:", error);
        setUserListings([]);
      }
    };

    loadUserListings();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "gearListings") {
        loadUserListings();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");

    if (authStatus === "true") {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      setCurrentUser(user);
    }
  }, []);

  const handleLocationsClick = (show: boolean) => {
    setShowLocations(show);
    setShowMobileMenu(false);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    // Update authentication status after modal closes
    const authStatus = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(authStatus === "true");

    if (authStatus === "true") {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowMobileMenu(false);
  };

  const handleDeleteListing = (id: string | number) => {
    try {
      // Get current listings
      const storedGear = JSON.parse(
        localStorage.getItem("gearListings") || "[]"
      ) as StoredGearItem[];
      // Filter out the deleted listing
      const updatedGear = storedGear.filter((gear) => gear.id !== id);
      // Save back to localStorage
      localStorage.setItem("gearListings", JSON.stringify(updatedGear));
      // Update state
      setUserListings((prev) => prev.filter((listing) => listing.id !== id));
      toast.success("Listing deleted successfully");
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  return (
    <>
      <style>{fontStyles}</style>
      <main className="urbanist font-sans min-h-screen overflow-y-auto bg-gradient-to-b from-emerald-50 via-teal-50 to-emerald-50">
        <div className="relative min-h-screen w-full flex flex-col">
          <Navbar
            onLocationsClick={handleLocationsClick}
            showLocations={showLocations}
            onUserClick={() => !isAuthenticated && setShowAuthModal(true)}
            onRentalHistoryClick={() => setShowRentalHistory(true)}
            onAddRentalClick={() => setShowAddRental(true)}
            onReportDamageClick={() => setShowReportDamage(true)}
            onYourListingsClick={() => setShowYourListings(true)}
            onMenuClick={() => setShowMobileMenu(true)}
          />
          {!showLocations ? (
            <>
              <Hero />
              <div className="flex-grow w-full transition-all duration-1000 ease-in-out">
                <Gears />
                <FeaturedGears />
              </div>
            </>
          ) : (
            <div className="flex-grow pt-20 min-h-screen bg-gradient-to-b from-emerald-100/50 via-teal-100/50 to-emerald-100/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                    Find Gear Near You
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-6 lg:px-0">
                    Discover available outdoor gear in your area. Each marker
                    represents a collection of gear ready for your next
                    adventure.
                  </p>
                </div>
              </div>
              <GearMap />
            </div>
          )}
          <Footer />
        </div>
        <Toaster />
        <AuthModal isOpen={showAuthModal} onClose={handleAuthModalClose} />
        <RentalHistoryModal
          isOpen={showRentalHistory}
          onClose={() => setShowRentalHistory(false)}
        />
        <AddRentalListingModal
          isOpen={showAddRental}
          onClose={() => setShowAddRental(false)}
        />
        <ReportModal
          isOpen={showReportDamage}
          onClose={() => setShowReportDamage(false)}
          rentedGear={rentedGear}
        />
        <YourListingsModal
          isOpen={showYourListings}
          onClose={() => setShowYourListings(false)}
          listings={userListings}
          onDeleteListing={handleDeleteListing}
        />
        <NavbarMenu
          isOpen={showMobileMenu}
          onClose={() => setShowMobileMenu(false)}
          onLocationsClick={handleLocationsClick}
          onUserClick={() => !isAuthenticated && setShowAuthModal(true)}
          onRentalHistoryClick={() => {
            setShowRentalHistory(true);
            setShowMobileMenu(false);
          }}
          onAddRentalClick={() => {
            setShowAddRental(true);
            setShowMobileMenu(false);
          }}
          onReportDamageClick={() => {
            setShowReportDamage(true);
            setShowMobileMenu(false);
          }}
          onYourListingsClick={() => {
            setShowYourListings(true);
            setShowMobileMenu(false);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </main>
    </>
  );
};

export default Home;
