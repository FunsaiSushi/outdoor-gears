import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";

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

  const getStatusColor = (status: RentalHistory["status"]) => {
    switch (status) {
      case "active":
        return "text-emerald-600 bg-emerald-100";
      case "completed":
        return "text-blue-600 bg-blue-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
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
                  Rental History
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
                                {new Date(
                                  rental.startDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(rental.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-[#2c1810]/80 mt-1">
                                Total Cost: ${rental.totalCost}
                              </p>
                              {rental.insurancePlan && (
                                <p className="text-sm text-[#2c1810]/80">
                                  Insurance: {rental.insurancePlan} ($
                                  {rental.insuranceCost})
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
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
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { RentalHistoryModal };
