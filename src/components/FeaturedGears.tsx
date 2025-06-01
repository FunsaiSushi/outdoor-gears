"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import GearModal from "./GearModal";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas-neue",
});

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
          className={`text-6xl ${bebasNeue.className} text-center mb-4 text-gray-900`}
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

export default FeaturedGears;
