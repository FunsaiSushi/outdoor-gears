import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";

interface DamageReport {
  id: number;
  gearId: string;
  damageImage: string;
  description: string;
  timestamp: string;
  userEmail?: string;
}

interface YourReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const YourReportsModal = ({ isOpen, onClose }: YourReportsModalProps) => {
  const [reports, setReports] = useState<DamageReport[]>([]);

  useEffect(() => {
    // Get reports from localStorage
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const allReports = JSON.parse(
      localStorage.getItem("damageReports") || "[]"
    );
    const userReports = allReports.filter(
      (report: DamageReport) =>
        report.gearId !== undefined &&
        (!currentUser.email || report.userEmail === currentUser.email)
    );
    setReports(userReports);

    if (isOpen) {
      // Prevent background scroll
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      // Restore scrolling when modal closes
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    }

    return () => {
      // Cleanup when component unmounts
      document.body.style.overflow = "unset";
      document.body.style.height = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#F5E6D3] overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-[#F5E6D3] border-b border-amber-700/30 p-4">
              <div className="max-w-3xl mx-auto flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#2c1810]">
                  Your Damage Reports
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-amber-50/80 backdrop-blur-sm hover:bg-amber-50 transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <div className="max-w-3xl mx-auto px-4 py-6">
                {reports.length === 0 ? (
                  <p className="text-[#2c1810]/80 text-center py-8">
                    No damage reports found.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-amber-50 rounded-2xl p-4 border border-amber-200"
                      >
                        <div className="space-y-4">
                          {/* Report Image */}
                          <div className="aspect-video relative rounded-xl overflow-hidden bg-black/5">
                            <img
                              src={report.damageImage}
                              alt="Damage"
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Report Details */}
                          <div>
                            <p className="text-sm text-[#2c1810]/80">
                              Reported on:{" "}
                              {new Date(report.timestamp).toLocaleDateString()}
                            </p>
                            <p className="mt-2 text-[#2c1810]">
                              {report.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { YourReportsModal };
