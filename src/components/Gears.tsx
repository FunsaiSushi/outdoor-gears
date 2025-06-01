"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiCalendar } from "react-icons/fi";
import { Bebas_Neue } from "next/font/google";
import GearModal from "./GearModal";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

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
type GearItem = SampleGearItem | LocalStorageGearItem;

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

// Helper function to convert localStorage gear to display format
const convertLocalStorageGearToDisplayFormat = (
  gear: LocalStorageGearItem
): GearItem => {
  return {
    ...gear,
    availableCount: 1, // Default to 1 for user-added gear
    unavailableDates: generateUnavailableDates(1), // Generate some unavailable dates
  };
};

const sampleGear: GearItem[] = [
  {
    id: 1,
    name: "Sleeping Bag Ultra",
    category: "SLEEPING",
    image:
      "https://images.unsplash.com/photo-1558477280-1bfed08ea5db?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: 25,
    availableCount: 8,
    unavailableDates: generateUnavailableDates(8),
  },
  {
    id: 2,
    name: "Camping Stove Pro",
    category: "COOKING",
    image: "https://images.unsplash.com/photo-1523497873958-8639c94677f2",
    price: 15,
    availableCount: 5,
    unavailableDates: generateUnavailableDates(5),
  },
  {
    id: 3,
    name: "LED Camping Lantern",
    category: "LIGHTS",
    image:
      "https://images.unsplash.com/photo-1632534244358-ab0c65c1b1e4?q=80&w=1926&auto=format&fit=crop",
    price: 10,
    availableCount: 12,
    unavailableDates: generateUnavailableDates(4),
  },
  {
    id: 4,
    name: "4-Person Tent",
    category: "TENTS",
    image: "https://images.unsplash.com/photo-1501703979959-797917eb21c8?q=80",
    price: 45,
    availableCount: 3,
    unavailableDates: generateUnavailableDates(6),
  },
  {
    id: 5,
    name: "Camping Chair Deluxe",
    category: "FURNITURE",
    image:
      "https://images.unsplash.com/photo-1625773581460-482530b2b158?q=80&w=1974&auto=format&fit=crop",
    price: 12,
    availableCount: 15,
    unavailableDates: generateUnavailableDates(3),
  },
  {
    id: 6,
    name: "Cooler Pro 50L",
    category: "STORAGE",
    image:
      "https://images.unsplash.com/photo-1700004583893-981e311b3501?q=80&w=2071&auto=format&fit=crop",
    price: 20,
    availableCount: 6,
    unavailableDates: generateUnavailableDates(7),
  },
  {
    id: 7,
    name: "Hiking Boots Premium",
    category: "APPAREL",
    image:
      "https://images.unsplash.com/photo-1713379796475-d061422dca01?q=80&w=1976&auto=format&fit=crop",
    price: 18,
    availableCount: 10,
    unavailableDates: generateUnavailableDates(5),
  },
];

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
          <h2 className={`text-8xl ${bebasNeue.className} text-black mb-8`}>
            CATALOG
          </h2>
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
                  <h3 className={`text-2xl ${bebasNeue.className} text-white`}>
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
                        <h3
                          className={`text-sm ${bebasNeue.className} text-white`}
                        >
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

export default Gears;
