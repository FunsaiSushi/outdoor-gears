"use client";

import { FiX, FiUser, FiMapPin, FiPlus, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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

export default NavbarMenu;
