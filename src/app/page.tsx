"use client";

import FeaturedGears from "@/components/FeaturedGears";
import Gears from "@/components/Gears";
import GearMap from "@/components/GearMap";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { RentalHistoryModal } from "@/components/RentalHistoryModal";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import AddRentalListingModal from "@/components/AddRentalListingModal";
import { YourListingsModal } from "@/components/YourListingsModal";
import { ReportModal } from "@/components/ReportModal";
import { NavbarMenu } from "@/components/NavbarMenu";
import { YourReportsModal } from "@/components/YourReportsModal";

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

export type StoredGearItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  availableCount: number;
  image: string;
  status: "active" | "inactive" | "rented";
  lastRented?: string;
};

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
  const [showYourReports, setShowYourReports] = useState(false);

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
            onYourReportsClick={() => setShowYourReports(true)}
            onMenuClick={() => setShowMobileMenu(true)}
          />
          {!showLocations ? (
            <>
              <Hero onLocationsClick={() => handleLocationsClick(true)} />
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
        <YourReportsModal
          isOpen={showYourReports}
          onClose={() => setShowYourReports(false)}
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
          onYourReportsClick={() => {
            setShowYourReports(true);
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
