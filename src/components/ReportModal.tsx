import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiAlertCircle } from "react-icons/fi";
import { toast } from "sonner";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setDamageImage(base64String);
    };
    reader.readAsDataURL(file);
  };

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

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!currentUser.email) {
      toast.error("Please sign in to submit a report");
      return;
    }

    // Store the report in localStorage
    const reports = JSON.parse(localStorage.getItem("damageReports") || "[]");
    const newReport = {
      id: Date.now(),
      gearId: selectedGear,
      damageImage,
      description,
      timestamp: new Date().toISOString(),
      userEmail: currentUser.email,
    };
    reports.push(newReport);
    localStorage.setItem("damageReports", JSON.stringify(reports));

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
                      Upload Damage Image
                    </label>
                    <input
                      type="file"
                      id="damageImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-amber-500 cursor-pointer"
                    />
                    {damageImage && (
                      <div className="mt-2">
                        <img
                          src={damageImage}
                          alt="Damage preview"
                          className="w-full max-h-48 object-contain rounded-lg"
                        />
                      </div>
                    )}
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
