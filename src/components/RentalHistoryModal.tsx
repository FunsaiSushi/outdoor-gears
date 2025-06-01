import { useEffect, useState } from "react";
import Modal from "./Modal";
import { toast } from "sonner";

interface RentalHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RentalHistory {
  id: string;
  gearName: string;
  startDate: string;
  endDate: string;
  status: "active" | "completed" | "cancelled";
  userEmail: string;
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
  }, [isOpen]);

  const getStatusColor = (status: RentalHistory["status"]) => {
    switch (status) {
      case "active":
        return "text-emerald-600";
      case "completed":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-[#2c1810] mb-6">
          Rental History
        </h2>

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
                        {new Date(rental.startDate).toLocaleDateString()} -{" "}
                        {new Date(rental.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
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
                      {rental.status === "active" && (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                          Review after completion
                        </span>
                      )}
                      {rental.status === "cancelled" && (
                        <span className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full">
                          Not available for review
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
    </Modal>
  );
};

export default RentalHistoryModal;
