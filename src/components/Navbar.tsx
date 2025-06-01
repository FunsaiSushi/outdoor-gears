"use client";

import { useState, useEffect } from "react";
import { FiUser, FiMenu, FiMapPin, FiLogOut, FiPlus } from "react-icons/fi";

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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
