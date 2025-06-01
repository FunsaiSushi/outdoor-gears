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
  FiCheck,
} from "react-icons/fi";
import Calendar from "./Calendar";
import { Reviews } from "./Reviews";

// Add RentalHistory type
type RentalHistory = {
  id: string;
  gearName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  userEmail: string;
  insurancePlan?: "basic" | "premium" | null;
  insuranceCost?: number;
  totalCost: number;
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [isSingleMode, setIsSingleMode] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<
    "basic" | "premium" | null
  >(null);

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
    { id: "availability" as Tab, label: "Availability", icon: FiCalendar },
    { id: "insurance" as Tab, label: "Insurance", icon: FiShield },
    { id: "reviews" as Tab, label: "Reviews", icon: FiStar },
  ];

  const handleModeChange = (singleMode: boolean) => {
    setIsSingleMode(singleMode);
    // Clear all selections when switching modes
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    setSelectedDate(null);
    setIsSelectingStartDate(false);
    setIsSelectingEndDate(false);
  };

  const handleDateSelect = (date: Date) => {
    if (isSingleMode) {
      // Single day selection mode
      setSelectedDate(date);
    } else {
      // Range selection mode (existing logic)
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
    }
  };

  const handleSelectDates = () => {
    setActiveTab("availability");
    if (!isSingleMode) {
      setIsSelectingStartDate(true);
      setSelectedStartDate(null);
      setSelectedEndDate(null);
    }
  };

  const handleInsuranceSelect = (plan: "basic" | "premium" | null) => {
    setSelectedInsurance(plan);
  };

  const handleRentNow = () => {
    const hasValidSelection = isSingleMode
      ? selectedDate
      : selectedStartDate && selectedEndDate;

    if (!hasValidSelection) {
      handleSelectDates();
      return;
    }

    // Check if any dates in range are unavailable
    let isAnyDateUnavailable = false;

    if (isSingleMode && selectedDate) {
      isAnyDateUnavailable = unavailableDates.some((unavailableDate) => {
        return unavailableDate.toDateString() === selectedDate.toDateString();
      });
    } else if (selectedStartDate && selectedEndDate) {
      isAnyDateUnavailable = unavailableDates.some((unavailableDate) => {
        const date = new Date(unavailableDate);
        return date >= selectedStartDate && date <= selectedEndDate;
      });
    }

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

    // Calculate insurance cost
    const days = getRentalDays();
    const insuranceCost = selectedInsurance
      ? (gear.insuranceOptions?.[selectedInsurance]?.price || 0) * days
      : 0;

    // Create new rental record
    const newRental: RentalHistory = {
      id: crypto.randomUUID(), // Generate unique ID
      gearName: gear.name,
      startDate:
        isSingleMode && selectedDate
          ? selectedDate.toISOString()
          : selectedStartDate!.toISOString(),
      endDate:
        isSingleMode && selectedDate
          ? selectedDate.toISOString()
          : selectedEndDate!.toISOString(),
      status: "active",
      userEmail: currentUser.email,
      insurancePlan: selectedInsurance,
      insuranceCost: insuranceCost,
      totalCost: calculateTotalPrice(),
    };

    // Get existing rentals from localStorage
    const existingRentals = JSON.parse(localStorage.getItem("rentals") || "[]");

    // Add new rental to the list
    const updatedRentals = [...existingRentals, newRental];

    // Save to localStorage
    localStorage.setItem("rentals", JSON.stringify(updatedRentals));

    // Show success message
    const insuranceMessage = selectedInsurance
      ? ` with ${selectedInsurance} insurance`
      : "";
    toast.success(`Gear rented successfully${insuranceMessage}!`);

    // Close the modal
    onClose();
  };

  const getRentalDays = () => {
    if (isSingleMode) {
      return 1;
    }

    if (!selectedStartDate || !selectedEndDate) return 1;

    return (
      Math.ceil(
        (selectedEndDate.getTime() - selectedStartDate.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const calculateTotalPrice = () => {
    const days = getRentalDays();
    const gearCost = gear.price * days;
    const insuranceCost = selectedInsurance
      ? (gear.insuranceOptions?.[selectedInsurance]?.price || 0) * days
      : 0;

    return gearCost + insuranceCost;
  };

  const getSelectedDatesDisplay = () => {
    if (isSingleMode && selectedDate) {
      return selectedDate.toLocaleDateString();
    } else if (selectedStartDate && selectedEndDate) {
      return `${selectedStartDate.toLocaleDateString()} - ${selectedEndDate.toLocaleDateString()}`;
    }
    return null;
  };

  const hasValidSelection = () => {
    return isSingleMode ? selectedDate : selectedStartDate && selectedEndDate;
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
                  selectedDate={selectedDate}
                  isSelectingStartDate={isSelectingStartDate}
                  isSelectingEndDate={isSelectingEndDate}
                  allowSingleDay={isSingleMode}
                  onModeChange={handleModeChange}
                />
              </div>
              {hasValidSelection() && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        Selected {isSingleMode ? "Date" : "Dates"}
                      </p>
                      <p className="font-medium">{getSelectedDatesDisplay()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Gear Cost</p>
                      <p className="text-xl font-bold text-emerald-600">
                        ${gear.price * getRentalDays()}
                      </p>
                      {selectedInsurance && (
                        <>
                          <p className="text-sm text-gray-600 mt-1">
                            Insurance
                          </p>
                          <p className="font-medium text-emerald-600">
                            +$
                            {(gear.insuranceOptions?.[selectedInsurance]
                              ?.price || 0) * getRentalDays()}
                          </p>
                        </>
                      )}
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
      case "insurance":
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Insurance Options
            </h3>
            <div className="space-y-4">
              {/* No Insurance Option */}
              <div
                className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                  selectedInsurance === null
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
                onClick={() => handleInsuranceSelect(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">No Insurance</h4>
                    <p className="text-gray-600 text-sm mt-1">$0/day</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Rely on security deposit for coverage
                    </p>
                  </div>
                  {selectedInsurance === null && (
                    <FiCheck className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              </div>

              {/* Basic Coverage */}
              <div
                className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                  selectedInsurance === "basic"
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
                onClick={() => handleInsuranceSelect("basic")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Basic Coverage
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      ${gear.insuranceOptions?.basic.price}/day
                    </p>
                    <ul className="text-gray-600 text-sm mt-2 space-y-1">
                      {gear.insuranceOptions?.basic.features.map(
                        (feature, index) => (
                          <li key={index}>• {feature}</li>
                        )
                      )}
                    </ul>
                  </div>
                  {selectedInsurance === "basic" && (
                    <FiCheck className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
              </div>

              {/* Premium Coverage */}
              <div
                className={`border rounded-2xl p-4 cursor-pointer transition-all ${
                  selectedInsurance === "premium"
                    ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200"
                    : "border-gray-200 hover:border-emerald-300"
                }`}
                onClick={() => handleInsuranceSelect("premium")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Premium Coverage
                    </h4>
                    <p className="text-gray-600 text-sm mt-1">
                      ${gear.insuranceOptions?.premium.price}/day
                    </p>
                    <ul className="text-gray-600 text-sm mt-2 space-y-1">
                      {gear.insuranceOptions?.premium.features.map(
                        (feature, index) => (
                          <li key={index}>• {feature}</li>
                        )
                      )}
                    </ul>
                  </div>
                  {selectedInsurance === "premium" && (
                    <FiCheck className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
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

              {/* Quick Info Section */}
              <div className="bg-amber-50/80 backdrop-blur-sm border-y border-amber-200">
                <div className="max-w-3xl mx-auto px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <FiDollarSign className="w-4 h-4" />
                      <span>Deposit: ${gear.deposit || gear.price * 10}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-800">
                      <FiMapPin className="w-4 h-4" />
                      <span>
                        Pickup:{" "}
                        {gear.pickupLocation ||
                          "123 Outdoor Avenue, Adventure City"}
                      </span>
                    </div>
                  </div>
                </div>
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
              <div className="max-w-3xl mx-auto">
                {/* Insurance Selection Indicator */}
                {selectedInsurance && (
                  <div className="mb-2 text-center">
                    <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                      {selectedInsurance.charAt(0).toUpperCase() +
                        selectedInsurance.slice(1)}{" "}
                      Insurance Selected (+$
                      {gear.insuranceOptions?.[selectedInsurance]?.price || 0}
                      /day)
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      {hasValidSelection() ? "Total Price" : "Price per Day"}
                    </span>
                    {hasValidSelection() && (
                      <>
                        <div className="flex flex-col text-sm text-gray-500">
                          <span>Gear: ${gear.price * getRentalDays()}</span>
                          {selectedInsurance && (
                            <span>
                              Insurance: +$
                              {(gear.insuranceOptions?.[selectedInsurance]
                                ?.price || 0) * getRentalDays()}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                    <span className="text-2xl font-bold text-gray-900">
                      $
                      {hasValidSelection() ? calculateTotalPrice() : gear.price}
                      {!hasValidSelection() && "/day"}
                    </span>
                  </div>
                  <button
                    className={`px-8 py-3 rounded-2xl font-medium transition-colors cursor-pointer border border-amber-800/20 ${
                      hasValidSelection()
                        ? "bg-amber-700 text-white hover:bg-amber-800"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                    }`}
                    onClick={
                      hasValidSelection() ? handleRentNow : handleSelectDates
                    }
                  >
                    {hasValidSelection() ? "Rent Now" : "Select Dates"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GearModal;
