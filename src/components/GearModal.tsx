"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  FiX,
  FiDollarSign,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiInfo,
  FiStar,
} from "react-icons/fi";
import Calendar from "./Calendar";
import Reviews from "./Reviews";

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

export default GearModal;
